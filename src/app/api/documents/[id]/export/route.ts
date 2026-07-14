import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const doc = await prisma.document.findUnique({
    where: { id },
    select: { title: true, content: true, excerpt: true, status: true, type: true, createdAt: true, updatedAt: true, createdBy: { select: { name: true } } },
  });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "markdown";

  await prisma.auditLog.create({ data: { actorId: session.user.id, entityType: "DOCUMENT", entityId: id, action: "EXPORT", metadata: { format }, success: true } });

  if (format === "json") {
    return NextResponse.json({
      title: doc.title, content: doc.content, excerpt: doc.excerpt, status: doc.status, type: doc.type,
      author: doc.createdBy.name, createdAt: doc.createdAt.toISOString(), updatedAt: doc.updatedAt.toISOString(),
    });
  }

  const markdown = `# ${doc.title}\n\n${doc.excerpt ? `> ${doc.excerpt}\n\n` : ""}${doc.content || ""}\n\n---\n*Created by ${doc.createdBy.name || "Unknown"} on ${doc.createdAt.toISOString().split("T")[0]}*`;

  return new NextResponse(markdown, {
    headers: { "Content-Type": "text/markdown", "Content-Disposition": `attachment; filename="${doc.title.replace(/\s+/g, "-").toLowerCase()}.md"` },
  });
}

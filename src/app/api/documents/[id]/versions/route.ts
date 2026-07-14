import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const versions = await prisma.documentVersion.findMany({
    where: { documentId: id },
    include: { createdBy: { select: { name: true } } },
    orderBy: { version: "desc" },
    take: 100,
  });

  return NextResponse.json(versions.map((v) => ({ id: v.id, documentId: v.documentId, version: v.version, title: v.title, content: v.content, createdById: v.createdById, createdByName: v.createdBy.name, createdAt: v.createdAt.toISOString() })));
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
  if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

  const { id } = await params;
  const comments = await prisma.documentComment.findMany({
    where: { documentId: id },
    include: { author: { select: { name: true, image: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(comments.map((c) => ({ id: c.id, documentId: c.documentId, authorId: c.authorId, authorName: c.author.name, authorImage: c.author.image, content: c.content, createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString() })));
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
  if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

  const { id } = await params;
  const body = await request.json();
  const { content } = body;

  if (!content) return NextResponse.json({ error: "Content is required" }, { status: 400 });

  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const comment = await prisma.documentComment.create({
    data: { documentId: id, authorId: authz.user!.id, content },
    include: { author: { select: { name: true, image: true } } },
  });

  await prisma.auditLog.create({ data: { actorId: authz.user!.id, entityType: "DOCUMENT_COMMENT", entityId: comment.id, action: "CREATE", success: true } });

  return NextResponse.json({ id: comment.id, documentId: comment.documentId, authorId: comment.authorId, authorName: comment.author.name, authorImage: comment.author.image, content: comment.content, createdAt: comment.createdAt.toISOString(), updatedAt: comment.updatedAt.toISOString() }, { status: 201 });
}

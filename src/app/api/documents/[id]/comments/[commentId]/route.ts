import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string; commentId: string }> }) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
  if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

  const { id, commentId } = await params;
  const comment = await prisma.documentComment.findFirst({ where: { id: commentId, documentId: id, authorId: authz.user!.id } });
  if (!comment) return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });

  const body = await request.json();
  const { content } = body;
  if (!content) return NextResponse.json({ error: "Content is required" }, { status: 400 });

  const updated = await prisma.documentComment.update({
    where: { id: commentId },
    data: { content },
    include: { author: { select: { name: true, image: true } } },
  });

  return NextResponse.json({ id: updated.id, documentId: updated.documentId, authorId: updated.authorId, authorName: updated.author.name, authorImage: updated.author.image, content: updated.content, createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; commentId: string }> }) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
  if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

  const { id, commentId } = await params;
  const comment = await prisma.documentComment.findFirst({ where: { id: commentId, documentId: id } });
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (comment.authorId !== authz.user!.id && authz.user!.role === "USER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.documentComment.delete({ where: { id: commentId } });
  return NextResponse.json({ success: true });
}

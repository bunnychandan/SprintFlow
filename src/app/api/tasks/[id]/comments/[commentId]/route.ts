import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";
import { commentUpdateSchema } from "@/lib/validations";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const { id, commentId } = await params;

  const task = await prisma.task.findUnique({ where: { id }, select: { id: true, projectId: true, deletedAt: true } });
  if (!task || task.deletedAt) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.taskId !== id) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

  const authz = await requireProjectAccess(task.projectId);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const isAuthor = comment.authorId === authz.user?.id;
  const isPmOrScrum = authz.member && ["PROJECT_MANAGER", "SCRUM_MASTER"].includes(authz.member.roleInProject);
  const isGlobalAdmin = ["SUPER_ADMIN", "ADMIN"].includes(authz.user?.role ?? "");

  if (!isAuthor && !isPmOrScrum && !isGlobalAdmin) {
    return NextResponse.json({ error: "Not authorized to edit this comment" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = commentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { content: parsed.data.content },
    include: { author: { select: { id: true, name: true, email: true, image: true } } },
  });

  return NextResponse.json({ comment: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const { id, commentId } = await params;

  const task = await prisma.task.findUnique({ where: { id }, select: { id: true, projectId: true, deletedAt: true } });
  if (!task || task.deletedAt) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.taskId !== id) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

  const authz = await requireProjectAccess(task.projectId);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const isAuthor = comment.authorId === authz.user?.id;
  const isPmOrScrum = authz.member && ["PROJECT_MANAGER", "SCRUM_MASTER"].includes(authz.member.roleInProject);
  const isGlobalAdmin = ["SUPER_ADMIN", "ADMIN"].includes(authz.user?.role ?? "");

  if (!isAuthor && !isPmOrScrum && !isGlobalAdmin) {
    return NextResponse.json({ error: "Not authorized to delete this comment" }, { status: 403 });
  }

  await prisma.comment.delete({ where: { id: commentId } });

  return NextResponse.json({ message: "Comment deleted" });
}

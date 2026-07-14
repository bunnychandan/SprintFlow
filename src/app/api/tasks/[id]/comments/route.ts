import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const task = await prisma.task.findFirst({ where: { id, deletedAt: null }, select: { id: true, projectId: true, title: true, reporterId: true } });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const authz = await requireProjectAccess(task.projectId, ["PROJECT_MANAGER", "SCRUM_MASTER", "DEVELOPER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const actorId = authz.user?.id ?? authz.session?.user?.id;
  if (!actorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { content } = body;

  if (!content || !content.trim()) {
    return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      taskId: id,
      authorId: actorId,
      content,
    },
    include: { author: { select: { id: true, name: true, email: true, image: true } } },
  });

  await prisma.auditLog.create({
    data: { actorId, entityType: "TASK", entityId: id, action: "ADD_COMMENT", details: `Added comment to task ${task.title}`, projectId: task.projectId },
  });

  if (task.reporterId && task.reporterId !== actorId) {
    await prisma.notification.create({
      data: {
        recipientId: task.reporterId,
        actorId,
        projectId: task.projectId,
        taskId: id,
        type: "TASK_COMMENT",
        title: "New Comment",
        message: `New comment on task "${task.title}"`,
        channel: "IN_APP",
      },
    });
  }

  return NextResponse.json({ comment }, { status: 201 });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;

  const authz = await requireProjectAccess(projectId, ["PROJECT_MANAGER", "SCRUM_MASTER", "DEVELOPER", "TESTER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const body = await request.json();
  const { taskId, targetStatus, targetIndex, targetSprintId } = body;

  if (!taskId || !targetStatus) {
    return NextResponse.json({ error: "taskId and targetStatus are required" }, { status: 400 });
  }

  const task = await prisma.task.findFirst({ where: { id: taskId, projectId, deletedAt: null } });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const oldStatus = task.status;
  const oldSprintId = task.sprintId;

  if (task.status === "DONE" && targetStatus !== "REOPENED") {
    return NextResponse.json({ error: "Cannot move a completed task unless reopening" }, { status: 400 });
  }
  if (task.status === "CANCELLED" && targetStatus !== "REOPENED" && targetStatus !== "BACKLOG") {
    return NextResponse.json({ error: "Cannot move a cancelled task unless reopening" }, { status: 400 });
  }

  if (targetSprintId) {
    const targetSprint = await prisma.sprint.findUnique({ where: { id: targetSprintId } });
    if (!targetSprint || targetSprint.projectId !== projectId) {
      return NextResponse.json({ error: "Invalid target sprint" }, { status: 400 });
    }
  }

  const actorId = authz.user?.id ?? authz.session?.user?.id;

  const updateData: Record<string, unknown> = {
    status: targetStatus,
    updatedById: actorId,
  };
  if (targetSprintId !== undefined) updateData.sprintId = targetSprintId || null;

  await prisma.task.update({ where: { id: taskId }, data: updateData as any });

  await prisma.auditLog.create({
    data: {
      actorId: actorId ?? "",
      entityType: "TASK",
      entityId: taskId,
      action: "MOVE_TASK",
      details: `Moved task "${task.title}" from ${oldStatus} to ${targetStatus}`,
      projectId,
    },
  });

  if (targetSprintId && targetSprintId !== oldSprintId) {
    await prisma.auditLog.create({
      data: {
        actorId: actorId ?? "",
        entityType: "TASK",
        entityId: taskId,
        action: "SPRINT_MOVE",
        details: `Moved task "${task.title}" to sprint ${targetSprintId}`,
        projectId,
      },
    });
  }

  if (targetStatus !== oldStatus) {
    const sprint = await prisma.sprint.findFirst({ where: { projectId, status: "ACTIVE", deletedAt: null } });
    if (sprint) {
      const members = await prisma.projectMember.findMany({
        where: { projectId, roleInProject: { in: ["PROJECT_MANAGER", "SCRUM_MASTER"] } },
        select: { userId: true },
      });
      const recipients = [...new Set([...members.map((m) => m.userId), task.assigneeId].filter(Boolean))] as string[];
      for (const rid of recipients) {
        if (rid !== actorId) {
          await prisma.notification.create({
            data: {
              recipientId: rid,
              actorId: actorId ?? "",
              projectId,
              taskId,
              type: "TASK_UPDATED",
              title: "Task Moved",
              message: `Task "${task.title}" moved from ${oldStatus} to ${targetStatus}`,
              channel: "IN_APP",
            },
          });
        }
      }
    }
  }

  return NextResponse.json({ message: "Task moved successfully" });
}

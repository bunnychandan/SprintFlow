import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";
import { moveTaskSchema } from "@/lib/validations";
import { notifySprintMembers } from "@/lib/sprint/notifications";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const sprint = await prisma.sprint.findUnique({ where: { id } });
  if (!sprint) return NextResponse.json({ error: "Sprint not found" }, { status: 404 });

  if (sprint.status === "COMPLETED" || sprint.status === "CANCELLED") {
    return NextResponse.json({ error: `Cannot modify a ${sprint.status.toLowerCase()} sprint` }, { status: 400 });
  }

  const authz = await requireProjectAccess(sprint.projectId, ["PROJECT_MANAGER", "SCRUM_MASTER", "DEVELOPER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const body = await request.json();
  const parsed = moveTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { taskId, targetSprintId } = parsed.data;

  const task = await prisma.task.findFirst({
    where: { id: taskId, projectId: sprint.projectId, deletedAt: null },
  });
  if (!task) return NextResponse.json({ error: "Task not found in this project" }, { status: 404 });

  const previousSprintId = task.sprintId;

  await prisma.task.update({
    where: { id: taskId },
    data: { sprintId: targetSprintId },
  });

  await prisma.auditLog.create({
    data: {
      actorId: authz.user?.id ?? authz.session?.user?.id,
      entityType: "TASK",
      entityId: taskId,
      action: "MOVE_TASK",
      details: `Moved task "${task.title}" ${targetSprintId ? `to sprint ${targetSprintId}` : "to backlog"}${previousSprintId ? ` from sprint ${previousSprintId}` : ""}`,
      projectId: sprint.projectId,
    },
  });

  return NextResponse.json({ message: "Task moved successfully" });
}

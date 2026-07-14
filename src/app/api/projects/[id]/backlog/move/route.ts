import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";
import { backlogMoveSchema } from "@/lib/validations";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;

  const authz = await requireProjectAccess(projectId, ["PROJECT_MANAGER", "SCRUM_MASTER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const actorId = authz.user?.id ?? authz.session?.user?.id;
  if (!actorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = backlogMoveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { taskIds, targetSprintId, targetEpicId, targetReleaseId } = parsed.data;

  const tasks = await prisma.task.findMany({
    where: { id: { in: taskIds }, projectId, deletedAt: null },
  });

  if (tasks.length !== taskIds.length) {
    return NextResponse.json({ error: "One or more tasks not found" }, { status: 404 });
  }

  if (targetSprintId) {
    const sprint = await prisma.sprint.findFirst({ where: { id: targetSprintId, projectId } });
    if (!sprint) return NextResponse.json({ error: "Target sprint not found" }, { status: 404 });
  }

  if (targetEpicId) {
    const epic = await prisma.epic.findFirst({ where: { id: targetEpicId, projectId, archivedAt: null } });
    if (!epic) return NextResponse.json({ error: "Target epic not found" }, { status: 404 });
    if (epic!.status === "COMPLETED" || epic!.status === "CANCELLED") {
      return NextResponse.json({ error: `Cannot move tasks to a ${epic!.status.toLowerCase()} epic` }, { status: 400 });
    }
  }

  if (targetReleaseId) {
    const release = await prisma.release.findFirst({ where: { id: targetReleaseId, projectId, archivedAt: null } });
    if (!release) return NextResponse.json({ error: "Target release not found" }, { status: 404 });
    if (release!.status === "RELEASED" || release!.status === "CANCELLED") {
      return NextResponse.json({ error: `Cannot move tasks to a ${release!.status.toLowerCase()} release` }, { status: 400 });
    }
  }

  const updateData: Record<string, unknown> = {};
  if (targetSprintId !== undefined) updateData.sprintId = targetSprintId;
  if (targetEpicId !== undefined) updateData.epicId = targetEpicId;
  if (targetReleaseId !== undefined) updateData.releaseId = targetReleaseId;

  await prisma.task.updateMany({
    where: { id: { in: taskIds } },
    data: updateData as any,
  });

  const movedList = tasks.map((t) => t.title).join(", ");
  const targets = [targetSprintId && `sprint ${targetSprintId}`, targetEpicId && `epic ${targetEpicId}`, targetReleaseId && `release ${targetReleaseId}`].filter(Boolean).join(", ");

  await prisma.auditLog.create({
    data: { actorId, entityType: "TASK", entityId: taskIds.join(","), action: "BULK_MOVE", details: `Moved tasks to ${targets}: ${movedList}`, projectId },
  });

  return NextResponse.json({ message: `Successfully moved ${taskIds.length} task(s)` });
}

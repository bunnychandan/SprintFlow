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
  const { taskId, status, targetIndex } = body;

  if (!taskId || !status || targetIndex === undefined) {
    return NextResponse.json({ error: "taskId, status, and targetIndex are required" }, { status: 400 });
  }

  const task = await prisma.task.findFirst({ where: { id: taskId, projectId, deletedAt: null } });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const actorId = authz.user?.id ?? authz.session?.user?.id;

  await prisma.task.update({
    where: { id: taskId },
    data: { status: status as any, updatedById: actorId },
  });

  await prisma.auditLog.create({
    data: {
      actorId: actorId ?? "",
      entityType: "TASK",
      entityId: taskId,
      action: "REORDER_TASK",
      details: `Reordered task "${task.title}" in ${status} column at position ${targetIndex}`,
      projectId,
    },
  });

  return NextResponse.json({ message: "Task reordered successfully" });
}

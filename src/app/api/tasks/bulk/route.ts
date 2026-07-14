import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, requireProjectAccess } from "@/lib/authz";
import { bulkTaskActionSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const body = await request.json();
  const parsed = bulkTaskActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { ids, action, status, priority, assigneeId, sprintId } = parsed.data;
  const actorId = authz.user?.id ?? authz.session?.user?.id;

  const tasks = await prisma.task.findMany({
    where: { id: { in: ids }, deletedAt: null },
    select: { id: true, projectId: true },
  });

  if (tasks.length !== ids.length) {
    return NextResponse.json({ error: "Some tasks not found" }, { status: 404 });
  }

  for (const t of tasks) {
    const acc = await requireProjectAccess(t.projectId);
    if (!acc.ok) return NextResponse.json({ error: `No access to project ${t.projectId}` }, { status: 403 });
  }

  let updateData: Record<string, unknown> = { updatedById: actorId };
  let actionLabel = action;

  switch (action) {
    case "changeStatus":
      updateData.status = status;
      break;
    case "changePriority":
      updateData.priority = priority;
      break;
    case "changeAssignee":
      updateData.assigneeId = assigneeId ?? null;
      break;
    case "moveSprint":
      updateData.sprintId = sprintId ?? null;
      break;
    case "archive":
      updateData.archivedAt = new Date();
      break;
    case "restore":
      updateData.archivedAt = null;
      break;
    case "delete":
      updateData.deletedAt = new Date();
      break;
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  await prisma.task.updateMany({
    where: { id: { in: ids } },
    data: updateData,
  });

  const projectId = tasks[0]?.projectId;
  await prisma.auditLog.create({
    data: { actorId, entityType: "TASK", entityId: ids.join(","), action: `BULK_${actionLabel.toUpperCase()}`, details: `Bulk ${actionLabel} on ${ids.length} tasks`, projectId: projectId ?? undefined },
  });

  return NextResponse.json({ message: `Bulk ${actionLabel} completed for ${ids.length} tasks` });
}

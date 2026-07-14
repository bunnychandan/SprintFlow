import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";
import { backlogBulkSchema } from "@/lib/validations";

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
  const parsed = backlogBulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { taskIds, action, value } = parsed.data;

  const tasks = await prisma.task.findMany({
    where: { id: { in: taskIds }, projectId, deletedAt: null },
  });

  if (tasks.length !== taskIds.length) {
    return NextResponse.json({ error: "One or more tasks not found" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};

  if (action === "SET_PRIORITY") {
    updateData.priority = value;
  } else if (action === "SET_ASSIGNEE") {
    updateData.assigneeId = value;
  } else if (action === "SET_STATUS") {
    updateData.status = value;
  } else if (action === "SET_LABELS") {
    const labelArray = value as string;
    const labels = labelArray.startsWith("[") ? JSON.parse(labelArray) : labelArray.split(",").map((l) => l.trim());
    updateData.labels = labels;
  } else {
    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }

  await prisma.task.updateMany({
    where: { id: { in: taskIds } },
    data: updateData as any,
  });

  const movedList = tasks.map((t) => t.title).join(", ");
  await prisma.auditLog.create({
    data: { actorId, entityType: "TASK", entityId: taskIds.join(","), action: "BULK_UPDATE", details: `Bulk ${action} = ${JSON.stringify(value)} on tasks: ${movedList}`, projectId },
  });

  return NextResponse.json({ message: `Successfully updated ${taskIds.length} task(s)` });
}

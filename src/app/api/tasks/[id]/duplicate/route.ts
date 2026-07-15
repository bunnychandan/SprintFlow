import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const original = await prisma.task.findUnique({ where: { id } });
  if (!original || original.deletedAt) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const authz = await requireProjectAccess(original.projectId, ["PROJECT_MANAGER", "SCRUM_MASTER", "DEVELOPER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const actorId = authz.user?.id ?? authz.session?.user?.id;
  if (!actorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const duplicated = await prisma.task.create({
    data: {
      projectId: original.projectId,
      title: `${original.title} (copy)`,
      description: original.description,
      status: "BACKLOG",
      priority: original.priority,
      type: original.type,
      originalEstimate: original.originalEstimate,
      timeRemaining: original.originalEstimate,
      storyPoints: original.storyPoints,
      reporterId: actorId,
      assigneeId: null,
      sprintId: null,
      dueDate: null,
      labels: original.labels as any,
    },
  });

  const checklistItems = await prisma.taskChecklist.findMany({
    where: { taskId: id },
    orderBy: { order: "asc" },
  });

  if (checklistItems.length > 0) {
    await prisma.taskChecklist.createMany({
      data: checklistItems.map((item) => ({
        taskId: duplicated.id,
        title: item.title,
        isChecked: false,
        order: item.order,
      })),
    });
  }

  await prisma.auditLog.create({
    data: { actorId, entityType: "TASK", entityId: duplicated.id, action: "DUPLICATE_TASK", details: `Duplicated task from ${original.title}`, projectId: original.projectId },
  });

  return NextResponse.json({ task: duplicated });
}

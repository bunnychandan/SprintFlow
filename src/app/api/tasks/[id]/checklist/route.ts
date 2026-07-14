import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";
import { checklistItemSchema } from "@/lib/validations";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const task = await prisma.task.findFirst({ where: { id, deletedAt: null }, select: { id: true, projectId: true } });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const authz = await requireProjectAccess(task.projectId);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const items = await prisma.taskChecklist.findMany({
    where: { taskId: id },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ items });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const task = await prisma.task.findFirst({ where: { id, deletedAt: null }, select: { id: true, projectId: true } });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const authz = await requireProjectAccess(task.projectId, ["PROJECT_MANAGER", "SCRUM_MASTER", "DEVELOPER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const body = await request.json();
  const parsed = checklistItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const actorId = authz.user?.id ?? authz.session?.user?.id;
  if (!actorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const maxOrder = await prisma.taskChecklist.aggregate({
    where: { taskId: id },
    _max: { order: true },
  });

  const item = await prisma.taskChecklist.create({
    data: {
      taskId: id,
      title: data.title,
      isChecked: data.isChecked ?? false,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  await prisma.auditLog.create({
    data: { actorId, entityType: "TASK", entityId: id, action: "ADD_CHECKLIST_ITEM", details: `Added checklist item "${data.title}"`, projectId: task.projectId },
  });

  return NextResponse.json({ item }, { status: 201 });
}

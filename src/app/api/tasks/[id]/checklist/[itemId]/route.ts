import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";
import { checklistUpdateSchema } from "@/lib/validations";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id, itemId } = await params;

  const task = await prisma.task.findUnique({ where: { id }, select: { id: true, projectId: true, deletedAt: true } });
  if (!task || task.deletedAt) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const item = await prisma.taskChecklist.findUnique({ where: { id: itemId } });
  if (!item || item.taskId !== id) return NextResponse.json({ error: "Checklist item not found" }, { status: 404 });

  const authz = await requireProjectAccess(task.projectId, ["PROJECT_MANAGER", "SCRUM_MASTER", "DEVELOPER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const body = await request.json();
  const parsed = checklistUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.isChecked !== undefined) updateData.isChecked = data.isChecked;
  if (data.order !== undefined) updateData.order = data.order;

  const updated = await prisma.taskChecklist.update({
    where: { id: itemId },
    data: updateData,
  });

  return NextResponse.json({ item: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id, itemId } = await params;

  const task = await prisma.task.findUnique({ where: { id }, select: { id: true, projectId: true, deletedAt: true } });
  if (!task || task.deletedAt) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const item = await prisma.taskChecklist.findUnique({ where: { id: itemId } });
  if (!item || item.taskId !== id) return NextResponse.json({ error: "Checklist item not found" }, { status: 404 });

  const authz = await requireProjectAccess(task.projectId, ["PROJECT_MANAGER", "SCRUM_MASTER", "DEVELOPER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  await prisma.taskChecklist.delete({ where: { id: itemId } });

  return NextResponse.json({ message: "Checklist item deleted" });
}

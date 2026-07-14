import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";
import { backlogReorderSchema } from "@/lib/validations";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;

  const authz = await requireProjectAccess(projectId, ["PROJECT_MANAGER", "SCRUM_MASTER", "DEVELOPER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const body = await request.json();
  const parsed = backlogReorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { taskId, targetIndex } = parsed.data;

  const task = await prisma.task.findFirst({ where: { id: taskId, projectId, deletedAt: null } });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const backlogTasks = await prisma.task.findMany({
    where: { projectId, sprintId: null, deletedAt: null, backlogOrder: { not: null } },
    orderBy: { backlogOrder: "asc" },
    select: { id: true, backlogOrder: true },
  });

  const newOrder = targetIndex < 0 ? 0 : targetIndex > backlogTasks.length ? backlogTasks.length : targetIndex;

  const existingIndex = backlogTasks.findIndex((t) => t.id === taskId);
  const reordered = existingIndex !== -1 ? backlogTasks.filter((t) => t.id !== taskId) : backlogTasks;
  reordered.splice(newOrder, 0, { id: taskId, backlogOrder: 0 });

  await prisma.$transaction(
    reordered.map((t, i) =>
      prisma.task.update({ where: { id: t.id }, data: { backlogOrder: (i + 1) * 1000 } })
    )
  );

  return NextResponse.json({ message: "Task reordered successfully" });
}

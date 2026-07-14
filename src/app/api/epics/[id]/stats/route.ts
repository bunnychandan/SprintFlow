import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const epic = await prisma.epic.findFirst({ where: { id, archivedAt: null } });
  if (!epic) return NextResponse.json({ error: "Epic not found" }, { status: 404 });

  const authz = await requireProjectAccess(epic.projectId);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const tasks = await prisma.task.findMany({
    where: { epicId: id, deletedAt: null },
    select: { status: true, storyPoints: true, priority: true, dueDate: true },
    take: 500,
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const blockedTasks = tasks.filter((t) => t.status === "BLOCKED").length;
  const overdueTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE" && t.status !== "CANCELLED").length;
  const totalStoryPoints = tasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
  const completedStoryPoints = tasks.filter((t) => t.status === "DONE").reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);

  const byStatus = tasks.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  const byPriority = tasks.reduce<Record<string, number>>((acc, t) => {
    acc[t.priority] = (acc[t.priority] || 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    totalTasks,
    completedTasks,
    blockedTasks,
    overdueTasks,
    totalStoryPoints,
    completedStoryPoints,
    completionPct: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
    byPriority: Object.entries(byPriority).map(([priority, count]) => ({ priority, count })),
  });
}

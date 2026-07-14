import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;

  const authz = await requireProjectAccess(projectId);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const { searchParams } = new URL(request.url);
  const sprintId = searchParams.get("sprintId");

  const where: Record<string, unknown> = { projectId, deletedAt: null, archivedAt: null };
  if (sprintId) where.sprintId = sprintId;

  const tasks = await prisma.task.findMany({
    where: where as any,
    select: {
      status: true,
      storyPoints: true,
      dueDate: true,
    },
  });

  const tasksPerStatus = tasks.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  const totalTasks = tasks.length;
  const blockedTasks = tasks.filter((t) => t.status === "BLOCKED").length;
  const overdueTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE" && t.status !== "CANCELLED").length;
  const completedTasks = tasks.filter((t) => t.status === "DONE");
  const storyPointsRemaining = tasks
    .filter((t) => t.status !== "DONE" && t.status !== "CANCELLED")
    .reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
  const completedPoints = completedTasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
  const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
  const completionPct = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  const activeSprint = sprintId
    ? await prisma.sprint.findUnique({ where: { id: sprintId }, select: { startDate: true, endDate: true } })
    : await prisma.sprint.findFirst({
      where: { projectId, status: "ACTIVE", deletedAt: null },
      select: { startDate: true, endDate: true },
    });

  let daysRemaining: number | null = null;
  if (activeSprint?.endDate) {
    daysRemaining = Math.max(0, Math.ceil((new Date(activeSprint.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  }

  const stats = {
    totalTasks,
    tasksPerStatus: Object.entries(tasksPerStatus).map(([status, count]) => ({ status, count })),
    storyPointsRemaining,
    completedPoints,
    totalPoints,
    blockedTasks,
    overdueTasks,
    completionPct,
    velocity: completedPoints,
    daysRemaining,
  };

  return NextResponse.json(stats);
}

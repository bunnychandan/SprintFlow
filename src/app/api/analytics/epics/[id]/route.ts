import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const epic = await prisma.epic.findUnique({ where: { id } });
  if (!epic || epic.archivedAt) return NextResponse.json({ error: "Epic not found" }, { status: 404 });

  const authz = await requireProjectAccess(epic.projectId);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const tasks = await prisma.task.findMany({
    where: { epicId: id, deletedAt: null },
    select: { status: true, storyPoints: true, dueDate: true, createdAt: true, updatedAt: true },
    orderBy: { createdAt: "asc" },
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const blockedTasks = tasks.filter((t) => t.status === "BLOCKED").length;
  const totalPoints = tasks.reduce((s, t) => s + (t.storyPoints ?? 0), 0);
  const completedPoints = tasks.filter((t) => t.status === "DONE").reduce((s, t) => s + (t.storyPoints ?? 0), 0);
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const taskDistribution = Object.entries(
    tasks.reduce<Record<string, number>>((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {})
  ).map(([status, count]) => ({ status, count }));

  const daysUntilTarget = epic.targetDate ? Math.max(0, Math.ceil((new Date(epic.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;

  const timeline = tasks.reduce<Array<{ date: string; pointsCompleted: number; tasksCompleted: number }>>((acc, t) => {
    if (t.status === "DONE") {
      const dateKey = (t.updatedAt || t.createdAt).toISOString().split("T")[0];
      const existing = acc.find((a) => a.date === dateKey);
      if (existing) {
        existing.pointsCompleted += t.storyPoints ?? 0;
        existing.tasksCompleted += 1;
      } else {
        acc.push({ date: dateKey, pointsCompleted: t.storyPoints ?? 0, tasksCompleted: 1 });
      }
    }
    return acc;
  }, []).sort((a, b) => a.date.localeCompare(b.date));

  const kpis = [
    { label: "Total Tasks", value: totalTasks, color: "text-blue-500" },
    { label: "Completed", value: completedTasks, color: "text-emerald-500" },
    { label: "Blocked", value: blockedTasks, color: "text-red-500" },
    { label: "Completion", value: `${completionPct}%`, color: "text-violet-500" },
    { label: "Total Points", value: totalPoints, color: "text-indigo-500" },
    { label: "Points Done", value: completedPoints, color: "text-emerald-500" },
    { label: "Days to Target", value: daysUntilTarget ?? "-", color: "text-cyan-500" },
  ];

  return NextResponse.json({
    epicId: id,
    epicTitle: epic.title,
    epicColor: epic.color,
    kpis,
    taskDistribution,
    completionPct,
    totalPoints,
    completedPoints,
    daysUntilTarget,
    timeline,
  });
}

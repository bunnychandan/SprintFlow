import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const sprint = await prisma.sprint.findUnique({ where: { id } });
  if (!sprint || sprint.deletedAt) return NextResponse.json({ error: "Sprint not found" }, { status: 404 });

  const authz = await requireProjectAccess(sprint.projectId);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const tasks = await prisma.task.findMany({
    where: { sprintId: id, deletedAt: null },
    select: { status: true, priority: true, type: true, storyPoints: true, dueDate: true, assigneeId: true, assignee: { select: { id: true, name: true, email: true, image: true } }, createdAt: true, updatedAt: true },
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const blockedTasks = tasks.filter((t) => t.status === "BLOCKED").length;
  const overdueTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE").length;

  const totalPoints = tasks.reduce((s, t) => s + (t.storyPoints ?? 0), 0);
  const completedPoints = tasks.filter((t) => t.status === "DONE").reduce((s, t) => s + (t.storyPoints ?? 0), 0);

  const distribution = (key: keyof typeof tasks[0]) =>
    Object.entries(tasks.reduce<Record<string, number>>((acc, t) => {
      const v = String(t[key]);
      acc[v] = (acc[v] || 0) + 1;
      return acc;
    }, {})).map(([k, v]) => ({ status: k, count: v }));

  const taskDistribution = tasks.reduce<Record<string, number>>((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {});
  const priorityDistribution = tasks.reduce<Record<string, number>>((acc, t) => { acc[t.priority] = (acc[t.priority] || 0) + 1; return acc; }, {});

  const assigneeMap = new Map<string, { userId: string; name: string | null; email: string; image: string | null; taskCount: number; completedCount: number; storyPoints: number }>();
  for (const t of tasks) {
    if (t.assigneeId) {
      const existing = assigneeMap.get(t.assigneeId) || { userId: t.assigneeId, name: t.assignee?.name || null, email: t.assignee?.email || "", image: t.assignee?.image || null, taskCount: 0, completedCount: 0, storyPoints: 0 };
      existing.taskCount++;
      if (t.status === "DONE") existing.completedCount++;
      existing.storyPoints += t.storyPoints ?? 0;
      assigneeMap.set(t.assigneeId, existing);
    }
  }

  let burndownData: Array<{ date: string; remaining: number; ideal: number; scope: number }> = [];
  if (sprint.startDate && sprint.endDate) {
    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);
    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const idealPerDay = totalPoints / totalDays;
    let remaining = totalPoints;
    for (let i = 0; i <= totalDays; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      burndownData.push({
        date: dateStr,
        remaining: Math.max(0, remaining),
        ideal: Math.max(0, totalPoints - idealPerDay * i),
        scope: totalPoints,
      });
      if (i < totalDays) remaining -= idealPerDay;
    }
  }

  const daysElapsed = sprint.startDate ? Math.max(0, Math.ceil((Date.now() - new Date(sprint.startDate).getTime()) / (1000 * 60 * 60 * 24))) : 0;
  const totalDays = sprint.startDate && sprint.endDate ? Math.max(1, Math.ceil((new Date(sprint.endDate).getTime() - new Date(sprint.startDate).getTime()) / (1000 * 60 * 60 * 24))) : 1;

  const kpis = [
    { label: "Total Tasks", value: totalTasks, color: "text-blue-500" },
    { label: "Completed", value: completedTasks, color: "text-emerald-500" },
    { label: "In Progress", value: inProgressTasks, color: "text-amber-500" },
    { label: "Blocked", value: blockedTasks, color: "text-red-500" },
    { label: "Overdue", value: overdueTasks, color: "text-rose-500" },
    { label: "Story Points", value: totalPoints, color: "text-indigo-500" },
    { label: "Points Done", value: completedPoints, color: "text-emerald-500" },
    { label: "Days Elapsed", value: `${daysElapsed}/${totalDays}`, color: "text-cyan-500" },
  ];

  return NextResponse.json({
    sprintId: id,
    sprintName: sprint.name,
    kpis,
    burndown: { data: burndownData, totalPoints, completedPoints, daysElapsed, totalDays },
    velocity: { sprint: sprint.name, sprintId: id, completedPoints, committedPoints: totalPoints, completionPct: totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0 },
    taskDistribution: Object.entries(taskDistribution).map(([status, count]) => ({ status, count })),
    priorityDistribution: Object.entries(priorityDistribution).map(([priority, count]) => ({ priority, count })),
    assigneeDistribution: Array.from(assigneeMap.values()),
  });
}

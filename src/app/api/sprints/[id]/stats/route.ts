import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const sprint = await prisma.sprint.findUnique({ where: { id } });
  if (!sprint) return NextResponse.json({ error: "Sprint not found" }, { status: 404 });

  const authz = await requireProjectAccess(sprint.projectId);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const tasks = await prisma.task.findMany({
    where: { sprintId: id, deletedAt: null },
    select: {
      id: true, status: true, priority: true, storyPoints: true, dueDate: true, assigneeId: true,
      assignee: { select: { id: true, name: true, email: true, image: true } },
    },
    take: 500,
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const todoTasks = tasks.filter((t) => t.status === "TODO").length;
  const blockedTasks = tasks.filter((t) => t.status === "BLOCKED").length;
  const overdueTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE").length;
  const now = new Date();

  const totalStoryPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const completedStoryPoints = tasks.filter((t) => t.status === "DONE").reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  let remainingDays = 0;
  let totalDays = 0;
  let elapsedDays = 0;

  if (sprint.startDate) {
    const start = new Date(sprint.startDate);
    const end = sprint.endDate ? new Date(sprint.endDate) : now;
    totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    elapsedDays = Math.max(0, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    remainingDays = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  const totalSprintsWithTasks = await prisma.sprint.findMany({
    where: { projectId: sprint.projectId, status: "COMPLETED", deletedAt: null },
    select: { id: true },
  });
  const completedSprintTaskCounts = await Promise.all(
    totalSprintsWithTasks.map((s) =>
      prisma.task.count({ where: { sprintId: s.id, status: "DONE", deletedAt: null } })
    )
  );
  const averageVelocity = completedSprintTaskCounts.length > 0
    ? Math.round(completedSprintTaskCounts.reduce((a, b) => a + b, 0) / completedSprintTaskCounts.length)
    : 0;

  const statusCounts = new Map<string, number>();
  for (const t of tasks) statusCounts.set(t.status, (statusCounts.get(t.status) || 0) + 1);

  const priorityCounts = new Map<string, number>();
  for (const t of tasks) priorityCounts.set(t.priority, (priorityCounts.get(t.priority) || 0) + 1);

  const assigneeMap = new Map<string, { userId: string; name: string | null; email: string; image: string | null; taskCount: number; completedCount: number; storyPoints: number }>();
  for (const t of tasks) {
    if (t.assigneeId) {
      const existing = assigneeMap.get(t.assigneeId);
      const sp = t.storyPoints || 0;
      if (existing) {
        existing.taskCount++;
        if (t.status === "DONE") existing.completedCount++;
        existing.storyPoints += sp;
      } else if (t.assignee) {
        assigneeMap.set(t.assigneeId, {
          userId: t.assignee.id,
          name: t.assignee.name,
          email: t.assignee.email,
          image: t.assignee.image,
          taskCount: 1,
          completedCount: t.status === "DONE" ? 1 : 0,
          storyPoints: sp,
        });
      }
    }
  }

  const blockedByUser = new Map<string, { userId: string; name: string | null; email: string; image: string | null; count: number }>();
  for (const t of tasks) {
    if (t.status === "BLOCKED" && t.assigneeId && t.assignee) {
      const existing = blockedByUser.get(t.assigneeId);
      if (existing) {
        existing.count++;
      } else {
        blockedByUser.set(t.assigneeId, { userId: t.assignee.id, name: t.assignee.name, email: t.assignee.email, image: t.assignee.image, count: 1 });
      }
    }
  }

  let burndownData: Array<{ date: string; remainingTasks: number; remainingPoints: number; idealTasks: number; idealPoints: number }> = [];

  if (sprint.startDate && sprint.endDate) {
    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);
    const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    const completedByDate = new Map<string, { tasks: number; points: number }>();
    const today = new Date();

    for (let i = 0; i <= diffDays; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split("T")[0];
      completedByDate.set(key, { tasks: 0, points: 0 });
    }

    const logs = await prisma.auditLog.findMany({
      where: { entityType: "SPRINT", entityId: id, action: { in: ["UPDATE_TASK", "CREATE_TASK"] }, createdAt: { gte: start } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true, metadata: true },
    });

    for (let i = 0; i <= diffDays; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      if (d > today) break;
      const key = d.toISOString().split("T")[0];
      const progress = 1 - (i / diffDays);
      burndownData.push({
        date: key,
        remainingTasks: Math.max(0, Math.round(totalTasks * (1 - progress))),
        remainingPoints: Math.max(0, Math.round(totalStoryPoints * (1 - progress))),
        idealTasks: Math.max(0, Math.round(totalTasks * (1 - i / diffDays))),
        idealPoints: Math.max(0, Math.round(totalStoryPoints * (1 - i / diffDays))),
      });
    }
  }

  const statistics = {
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    blockedTasks,
    overdueTasks,
    totalStoryPoints,
    completedStoryPoints,
    completionPercentage,
    remainingDays,
    totalDays,
    elapsedDays,
    averageVelocity,
    taskDistribution: Array.from(statusCounts.entries()).map(([status, count]) => ({ status, count })),
    priorityDistribution: Array.from(priorityCounts.entries()).map(([priority, count]) => ({ priority, count })),
    assigneeDistribution: Array.from(assigneeMap.values()),
    burndownData,
    blockedByAssignee: Array.from(blockedByUser.values()),
  };

  return NextResponse.json(statistics);
}

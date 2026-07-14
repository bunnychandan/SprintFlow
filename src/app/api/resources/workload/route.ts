import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function GET(request: Request) {
  const authz = await requireAdmin();
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  const taskWhere: Record<string, unknown> = { deletedAt: null, assigneeId: { not: null } };
  if (projectId) taskWhere.projectId = projectId;

  const tasks = await prisma.task.findMany({
    where: taskWhere as any,
    select: { id: true, status: true, storyPoints: true, assigneeId: true, dueDate: true, workLogs: { select: { timeSpent: true, billable: true } } },
    take: 500,
  });

  const users = await prisma.user.findMany({
    where: { deletedAt: null, isActive: true },
    select: { id: true, name: true, email: true, image: true },
  });

  const workloadMap = new Map<string, { totalTasks: number; inProgress: number; completed: number; overdue: number; totalHours: number; billableHours: number; nonBillableHours: number }>();

  for (const task of tasks) {
    if (!task.assigneeId) continue;
    const w = workloadMap.get(task.assigneeId) || { totalTasks: 0, inProgress: 0, completed: 0, overdue: 0, totalHours: 0, billableHours: 0, nonBillableHours: 0 };
    w.totalTasks++;
    if (task.status === "IN_PROGRESS") w.inProgress++;
    if (task.status === "DONE") w.completed++;
    if (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE" && task.status !== "CANCELLED") w.overdue++;
    for (const wl of task.workLogs) {
      w.totalHours += wl.timeSpent;
      if (wl.billable) w.billableHours += wl.timeSpent;
      else w.nonBillableHours += wl.timeSpent;
    }
    workloadMap.set(task.assigneeId, w);
  }

  const workload = users.map((u) => {
    const w = workloadMap.get(u.id) || { totalTasks: 0, inProgress: 0, completed: 0, overdue: 0, totalHours: 0, billableHours: 0, nonBillableHours: 0 };
    return { userId: u.id, name: u.name, email: u.email, image: u.image, ...w, overtimeHours: Math.max(0, w.totalHours - 40) };
  });

  return NextResponse.json(workload);
}

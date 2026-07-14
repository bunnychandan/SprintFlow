import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authz = await requireProjectAccess(id);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const project = await prisma.project.findFirst({ where: { id, deletedAt: null } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const tasks = await prisma.task.findMany({
    where: { projectId: id, deletedAt: null },
    select: { id: true, status: true, priority: true, type: true, assigneeId: true, dueDate: true, assignee: { select: { id: true, name: true, email: true, image: true } } },
    take: 500,
  });

  const sprints = await prisma.sprint.findMany({
    where: { projectId: id, deletedAt: null },
    select: { id: true, status: true },
  });

  const memberCount = await prisma.projectMember.count({ where: { projectId: id } });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const todoTasks = tasks.filter((t) => t.status === "TODO").length;
  const blockedTasks = tasks.filter((t) => t.status === "BLOCKED").length;
  const overdueTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE").length;

  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const statusCounts = new Map<string, number>();
  for (const t of tasks) statusCounts.set(t.status, (statusCounts.get(t.status) || 0) + 1);

  const priorityCounts = new Map<string, number>();
  for (const t of tasks) priorityCounts.set(t.priority, (priorityCounts.get(t.priority) || 0) + 1);

  const typeCounts = new Map<string, number>();
  for (const t of tasks) typeCounts.set(t.type, (typeCounts.get(t.type) || 0) + 1);

  const assigneeCounts = new Map<string, { userId: string; name: string | null; email: string; image: string | null; count: number }>();
  for (const t of tasks) {
    if (t.assigneeId) {
      const existing = assigneeCounts.get(t.assigneeId);
      if (existing) {
        existing.count++;
      } else if (t.assignee) {
        assigneeCounts.set(t.assigneeId, { userId: t.assignee.id, name: t.assignee.name, email: t.assignee.email, image: t.assignee.image, count: 1 });
      }
    }
  }

  const stats = {
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    blockedTasks,
    totalSprints: sprints.length,
    activeSprints: sprints.filter((s) => s.status === "ACTIVE").length,
    totalMembers: memberCount,
    completionPercentage,
    overdueTasks,
    taskDistribution: Array.from(statusCounts.entries()).map(([status, count]) => ({ status, count })),
    priorityDistribution: Array.from(priorityCounts.entries()).map(([priority, count]) => ({ priority, count })),
    typeDistribution: Array.from(typeCounts.entries()).map(([type, count]) => ({ type, count })),
    tasksByAssignee: Array.from(assigneeCounts.values()),
  };

  return NextResponse.json(stats);
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const authz = await requireProjectAccess(id);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || project.deletedAt) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const [tasks, sprints, members] = await Promise.all([
    prisma.task.findMany({ where: { projectId: id, deletedAt: null }, select: { status: true, priority: true, type: true, storyPoints: true, dueDate: true, assigneeId: true, assignee: { select: { id: true, name: true, email: true, image: true } } } }),
    prisma.sprint.findMany({ where: { projectId: id, deletedAt: null, status: "COMPLETED" }, orderBy: { endDate: "desc" }, take: 6, include: { tasks: { where: { deletedAt: null }, select: { storyPoints: true, status: true } } } }),
    prisma.projectMember.findMany({ where: { projectId: id }, include: { user: { select: { id: true, name: true, email: true, image: true } } } }),
  ]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const blockedTasks = tasks.filter((t) => t.status === "BLOCKED").length;
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const overdueTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE" && t.status !== "CANCELLED").length;

  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const taskDistribution = Object.entries(
    tasks.reduce<Record<string, number>>((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {})
  ).map(([status, count]) => ({ status, count }));

  const priorityDistribution = Object.entries(
    tasks.reduce<Record<string, number>>((acc, t) => { acc[t.priority] = (acc[t.priority] || 0) + 1; return acc; }, {})
  ).map(([priority, count]) => ({ priority, count }));

  const typeDistribution = Object.entries(
    tasks.reduce<Record<string, number>>((acc, t) => { acc[t.type] = (acc[t.type] || 0) + 1; return acc; }, {})
  ).map(([type, count]) => ({ type, count }));

  const sprintVelocity = sprints.reverse().map((s) => {
    const committed = s.tasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
    const completed = s.tasks.filter((t) => t.status === "DONE").reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
    return { sprint: s.name, sprintId: s.id, completedPoints: completed, committedPoints: committed, completionPct: committed > 0 ? Math.round((completed / committed) * 100) : 0 };
  });

  const teamPerformance = members.map((m) => {
    const userTasks = tasks.filter((t) => t.assigneeId === m.userId);
    return {
      userId: m.userId,
      name: m.user.name,
      email: m.user.email,
      image: m.user.image,
      completedTasks: userTasks.filter((t) => t.status === "DONE").length,
      completedPoints: userTasks.filter((t) => t.status === "DONE").reduce((sum, t) => sum + (t.storyPoints ?? 0), 0),
      avgCycleTime: 0,
      tasksInProgress: userTasks.filter((t) => t.status === "IN_PROGRESS").length,
      velocityTrend: [],
    };
  });

  const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
  const completedPoints = tasks.filter((t) => t.status === "DONE").reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);

  const kpis = [
    { label: "Total Tasks", value: totalTasks, color: "text-blue-500" },
    { label: "Completed", value: completedTasks, color: "text-emerald-500" },
    { label: "In Progress", value: inProgressTasks, color: "text-amber-500" },
    { label: "Blocked", value: blockedTasks, color: "text-red-500" },
    { label: "Overdue", value: overdueTasks, color: "text-rose-500" },
    { label: "Completion", value: `${completionPct}%`, color: "text-violet-500" },
    { label: "Story Points", value: totalPoints, color: "text-indigo-500" },
    { label: "Points Done", value: completedPoints, color: "text-emerald-500" },
  ];

  return NextResponse.json({
    projectId: id,
    projectName: project.name,
    projectCode: project.code,
    kpis,
    taskDistribution,
    priorityDistribution,
    typeDistribution,
    sprintVelocity,
    teamPerformance,
    overdueTasks,
    completionPct,
  });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function GET(request: Request) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const dateFilter = from || to ? {
    createdAt: {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    },
  } : {};

  const [
    totalProjects,
    activeProjects,
    totalTasks,
    completedTasks,
    blockedTasks,
    overdueTasks,
    activeSprints,
    totalUsers,
    recentSprints,
  ] = await Promise.all([
    prisma.project.count({ where: { deletedAt: null, ...dateFilter as any } }),
    prisma.project.count({ where: { status: "ACTIVE", deletedAt: null } }),
    prisma.task.count({ where: { deletedAt: null, ...dateFilter as any } }),
    prisma.task.count({ where: { status: "DONE", deletedAt: null, ...dateFilter as any } }),
    prisma.task.count({ where: { status: "BLOCKED", deletedAt: null } }),
    prisma.task.count({ where: { status: { notIn: ["DONE", "CANCELLED"] }, dueDate: { lt: new Date() }, deletedAt: null } }),
    prisma.sprint.count({ where: { status: "ACTIVE", deletedAt: null } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.sprint.findMany({
      where: { status: "COMPLETED", deletedAt: null },
      orderBy: { endDate: "desc" },
      take: 6,
      include: {
        tasks: { where: { deletedAt: null }, select: { storyPoints: true, status: true } },
      },
    }),
  ]);

  const velocityTrend = recentSprints.reverse().map((s) => {
    const totalSp = s.tasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
    const completedSp = s.tasks.filter((t) => t.status === "DONE").reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
    return {
      sprint: s.name,
      sprintId: s.id,
      completedPoints: completedSp,
      committedPoints: totalSp,
      completionPct: totalSp > 0 ? Math.round((completedSp / totalSp) * 100) : 0,
    };
  });

  const overdueCount = overdueTasks;

  const kpis = [
    { label: "Total Projects", value: totalProjects, icon: "FolderKanban", color: "text-blue-500" },
    { label: "Active Projects", value: activeProjects, icon: "Play", color: "text-emerald-500" },
    { label: "Total Tasks", value: totalTasks, icon: "ListTodo", color: "text-indigo-500" },
    { label: "Completed Tasks", value: completedTasks, icon: "CheckCircle2", color: "text-emerald-500" },
    { label: "Blocked Tasks", value: blockedTasks, icon: "AlertCircle", color: "text-red-500" },
    { label: "Overdue Tasks", value: overdueCount, icon: "Ban", color: "text-rose-500" },
    { label: "Active Sprints", value: activeSprints, icon: "GitBranch", color: "text-amber-500" },
    { label: "Team Members", value: totalUsers, icon: "Users", color: "text-violet-500" },
  ];

  return NextResponse.json({
    kpis,
    activeProjects,
    totalTasks,
    completedTasks,
    overdueTasks: overdueCount,
    activeSprints,
    teamMembers: totalUsers,
    velocityTrend,
    recentActivity: [],
  });
}

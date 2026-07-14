import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess, requireRole } from "@/lib/authz";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sprintId = searchParams.get("sprintId");
  const projectId = searchParams.get("projectId");

  if (sprintId) {
    const sprint = await prisma.sprint.findFirst({ where: { id: sprintId, deletedAt: null } });
    if (!sprint) return NextResponse.json({ error: "Sprint not found" }, { status: 404 });
    const authz = await requireProjectAccess(sprint.projectId);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    const tasks = await prisma.task.findMany({ where: { sprintId, deletedAt: null }, select: { storyPoints: true, status: true } });
    const totalPoints = tasks.reduce((s, t) => s + (t.storyPoints ?? 0), 0);
    const completedPoints = tasks.filter((t) => t.status === "DONE").reduce((s, t) => s + (t.storyPoints ?? 0), 0);

    const start = new Date(sprint.startDate!);
    const end = new Date(sprint.endDate!);
    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const idealPerDay = totalPoints / totalDays;
    let cumCompleted = 0;
    const data: Array<{ date: string; total: number; completed: number; scope: number }> = [];

    for (let i = 0; i <= totalDays; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      if (i > 0) cumCompleted += idealPerDay;
      data.push({ date: d.toISOString().split("T")[0], total: totalPoints, completed: Math.min(totalPoints, Math.round(cumCompleted)), scope: totalPoints });
    }

    return NextResponse.json({ data, totalPoints, completedPoints });
  }

  const authz2 = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (!authz2.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz2.status });

  const activeSprints = await prisma.sprint.findMany({ where: { status: "ACTIVE", deletedAt: null }, include: { tasks: { where: { deletedAt: null }, select: { storyPoints: true, status: true } } }, take: 5 });
  const results = await Promise.all(activeSprints.map(async (s) => {
    const totalPoints = s.tasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
    const completedPoints = s.tasks.filter((t) => t.status === "DONE").reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
    if (!s.startDate || !s.endDate) return null;
    const start = new Date(s.startDate);
    const end = new Date(s.endDate);
    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const idealPerDay = totalPoints / totalDays;
    let cumCompleted = 0;
    const data: Array<{ date: string; total: number; completed: number; scope: number }> = [];
    for (let i = 0; i <= totalDays; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      if (i > 0) cumCompleted += idealPerDay;
      data.push({ date: d.toISOString().split("T")[0], total: totalPoints, completed: Math.min(totalPoints, Math.round(cumCompleted)), scope: totalPoints });
    }
    return { sprintId: s.id, sprintName: s.name, data, totalPoints, completedPoints };
  }));

  return NextResponse.json(results.filter(Boolean));
}

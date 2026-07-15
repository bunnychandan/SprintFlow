import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess, requireRole } from "@/lib/authz";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sprintId = searchParams.get("sprintId");
  const projectId = searchParams.get("projectId");

  if (sprintId) {
    const sprint = await prisma.sprint.findUnique({ where: { id: sprintId } });
    if (!sprint || sprint.deletedAt) return NextResponse.json({ error: "Sprint not found" }, { status: 404 });
    const authz = await requireProjectAccess(sprint.projectId);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    const tasks = await prisma.task.findMany({ where: { sprintId, deletedAt: null }, select: { storyPoints: true, status: true } });
    const totalPoints = tasks.reduce((s, t) => s + (t.storyPoints ?? 0), 0);
    const completedPoints = tasks.filter((t) => t.status === "DONE").reduce((s, t) => s + (t.storyPoints ?? 0), 0);

    const start = new Date(sprint.startDate!);
    const end = new Date(sprint.endDate!);
    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const idealPerDay = totalPoints / totalDays;
    let remaining = totalPoints;
    const data: Array<{ date: string; remaining: number; ideal: number; scope: number }> = [];

    for (let i = 0; i <= totalDays; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      data.push({ date: d.toISOString().split("T")[0], remaining: Math.max(0, remaining), ideal: Math.max(0, totalPoints - idealPerDay * i), scope: totalPoints });
      if (i < totalDays) remaining -= idealPerDay;
    }

    return NextResponse.json({ data, totalPoints, completedPoints, daysElapsed: Math.max(0, Math.ceil((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24))), totalDays });
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
    let remaining = totalPoints;
    const data: Array<{ date: string; remaining: number; ideal: number; scope: number }> = [];
    for (let i = 0; i <= totalDays; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      data.push({ date: d.toISOString().split("T")[0], remaining: Math.max(0, remaining), ideal: Math.max(0, totalPoints - idealPerDay * i), scope: totalPoints });
      if (i < totalDays) remaining -= idealPerDay;
    }
    return { sprintId: s.id, sprintName: s.name, data, totalPoints, completedPoints, daysElapsed: Math.max(0, Math.ceil((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24))), totalDays };
  }));

  return NextResponse.json(results.filter(Boolean));
}

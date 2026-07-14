import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

const DEFAULT_WEEKLY_CAPACITY = 40;

export async function GET(request: Request) {
  const authz = await requireAdmin();
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const projectId = searchParams.get("projectId");

  const users = await prisma.user.findMany({
    where: { deletedAt: null, isActive: true },
    select: { id: true, name: true, email: true, image: true },
    take: 200,
  });

  const workLogWhere: Record<string, unknown> = {};
  if (from) workLogWhere.loggedAt = { ...(workLogWhere.loggedAt as object || {}), gte: new Date(from) };
  if (to) workLogWhere.loggedAt = { ...(workLogWhere.loggedAt as object || {}), lte: new Date(to) };

  const workLogs = await prisma.workLog.findMany({
    where: workLogWhere as any,
    select: { userId: true, timeSpent: true, loggedAt: true, task: { select: { projectId: true } } },
  });

  const hoursMap = new Map<string, { total: number; weeklyHours: Map<string, number> }>();

  for (const wl of workLogs) {
    if (projectId && wl.task.projectId !== projectId) continue;
    const h = hoursMap.get(wl.userId) || { total: 0, weeklyHours: new Map() };
    h.total += wl.timeSpent;
    const weekKey = getWeekKey(wl.loggedAt);
    h.weeklyHours.set(weekKey, (h.weeklyHours.get(weekKey) || 0) + wl.timeSpent);
    hoursMap.set(wl.userId, h);
  }

  const capacity = users.map((u) => {
    const h = hoursMap.get(u.id);
    const used = h?.total || 0;
    const weeklyUsed = h?.weeklyHours || new Map();
    const weeks = Math.max(1, weeklyUsed.size || 1);
    const monthlyCapacity = DEFAULT_WEEKLY_CAPACITY * 4.33;
    const weeklyCapacity = DEFAULT_WEEKLY_CAPACITY;
    const trend = Array.from(weeklyUsed.values()).slice(-12);
    return {
      userId: u.id, name: u.name, email: u.email, image: u.image,
      weeklyCapacity, monthlyCapacity, usedHours: used, remainingHours: monthlyCapacity - used,
      utilization: monthlyCapacity > 0 ? Math.round((used / monthlyCapacity) * 100) : 0,
      trend,
    };
  });

  return NextResponse.json(capacity);
}

function getWeekKey(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split("T")[0];
}

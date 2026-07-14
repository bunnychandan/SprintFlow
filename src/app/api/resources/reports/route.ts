import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function GET(request: Request) {
  const authz = await requireAdmin();
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const to = searchParams.get("to") || new Date().toISOString().split("T")[0];
  const projectId = searchParams.get("projectId");

  const users = await prisma.user.findMany({
    where: { deletedAt: null, isActive: true },
    select: { id: true, name: true, email: true },
    take: 200,
  });

  const workLogWhere: Record<string, unknown> = { loggedAt: { gte: new Date(from), lte: new Date(to) } };
  if (projectId) workLogWhere.task = { projectId };

  const workLogs = await prisma.workLog.findMany({
    where: workLogWhere as any,
    select: { userId: true, timeSpent: true, billable: true },
  });

  const reportData = users.map((u) => {
    const logs = workLogs.filter((wl) => wl.userId === u.id);
    const totalHours = logs.reduce((s, l) => s + l.timeSpent, 0);
    const billableHours = logs.filter((l) => l.billable).reduce((s, l) => s + l.timeSpent, 0);
    const nonBillableHours = totalHours - billableHours;
    const capacity = 40 * 4.33;
    return {
      userId: u.id, name: u.name, email: u.email,
      totalHours, billableHours, nonBillableHours,
      utilization: capacity > 0 ? Math.round((totalHours / capacity) * 100) : 0,
      capacity: Math.round(capacity),
      overtimeHours: Math.max(0, totalHours - capacity),
    };
  });

  return NextResponse.json({
    type: "utilization",
    periodStart: from,
    periodEnd: to,
    data: reportData,
  });
}

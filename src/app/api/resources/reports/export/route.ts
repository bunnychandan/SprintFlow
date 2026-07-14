import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function GET(request: Request) {
  const authz = await requireAdmin();
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const to = searchParams.get("to") || new Date().toISOString().split("T")[0];
  const format = searchParams.get("format") || "json";

  const users = await prisma.user.findMany({
    where: { deletedAt: null, isActive: true },
    select: { id: true, name: true, email: true },
    take: 5000,
  });

  const workLogs = await prisma.workLog.findMany({
    where: { loggedAt: { gte: new Date(from), lte: new Date(to) } },
    select: { userId: true, timeSpent: true, billable: true },
  });

  const rows = users.map((u) => {
    const logs = workLogs.filter((wl) => wl.userId === u.id);
    const totalHours = logs.reduce((s, l) => s + l.timeSpent, 0);
    const billableHours = logs.filter((l) => l.billable).reduce((s, l) => s + l.timeSpent, 0);
    const capacity = Math.round(40 * 4.33);
    return {
      userId: u.id, name: u.name || "", email: u.email,
      totalHours, billableHours, nonBillableHours: totalHours - billableHours,
      utilization: capacity > 0 ? Math.round((totalHours / capacity) * 100) : 0,
      capacity, overtimeHours: Math.max(0, totalHours - capacity),
    };
  });

  if (format === "csv") {
    const header = "Name,Email,Total Hours,Billable Hours,Non-Billable Hours,Utilization %,Capacity,Overtime Hours\n";
    const csv = header + rows.map((r) => `${r.name},${r.email},${r.totalHours},${r.billableHours},${r.nonBillableHours},${r.utilization},${r.capacity},${r.overtimeHours}`).join("\n");
    return new NextResponse(csv, {
      headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="resource-report-${from}-${to}.csv"` },
    });
  }

  return NextResponse.json({
    type: "utilization",
    periodStart: from,
    periodEnd: to,
    data: rows,
  });
}

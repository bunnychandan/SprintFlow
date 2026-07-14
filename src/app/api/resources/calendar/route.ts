import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function GET(request: Request) {
  const authz = await requireAdmin();
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") || new Date().toISOString().split("T")[0];
  const to = searchParams.get("to");
  const userId = searchParams.get("userId");

  const toDate = to ? new Date(to) : new Date(new Date(from).getTime() + 30 * 24 * 60 * 60 * 1000);
  const fromDate = new Date(from);

  const events: Array<{ id: string; title: string; date: string; type: string; userId?: string; userName?: string; hours?: number }> = [];

  const holidays = await prisma.holiday.findMany({
    where: { date: { gte: fromDate, lte: toDate } },
    select: { id: true, name: true, date: true, type: true },
  });

  for (const h of holidays) {
    events.push({ id: h.id, title: h.name, date: h.date.toISOString().split("T")[0], type: "HOLIDAY" });
  }

  const leaveWhere: Record<string, unknown> = { status: "APPROVED", startDate: { lte: toDate }, endDate: { gte: fromDate } };
  if (userId) leaveWhere.userId = userId;

  const leaves = await prisma.leave.findMany({
    where: leaveWhere as any,
    select: { id: true, type: true, startDate: true, endDate: true, user: { select: { id: true, name: true } } },
  });

  for (const leave of leaves) {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      events.push({
        id: `${leave.id}-${d.toISOString().split("T")[0]}`,
        title: `${leave.type} - ${leave.user.name || "Unknown"}`,
        date: d.toISOString().split("T")[0],
        type: "LEAVE",
        userId: leave.user.id,
        userName: leave.user.name || undefined,
      });
    }
  }

  return NextResponse.json(events);
}

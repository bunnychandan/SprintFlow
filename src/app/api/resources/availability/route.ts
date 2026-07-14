import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

const DEFAULT_WEEKLY_CAPACITY = 40;

export async function GET(request: Request) {
  const authz = await requireAdmin();
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") || new Date().toISOString().split("T")[0];
  const to = searchParams.get("to");
  const projectId = searchParams.get("projectId");

  const users = await prisma.user.findMany({
    where: { deletedAt: null, isActive: true },
    select: { id: true, name: true, email: true, image: true, allocations: { select: { allocation: true, projectId: true } } },
    take: 200,
  });

  const toDate = to ? new Date(to) : new Date(new Date(from).getTime() + 30 * 24 * 60 * 60 * 1000);

  const leaves = await prisma.leave.findMany({
    where: { status: "APPROVED", startDate: { lte: toDate }, endDate: { gte: new Date(from) } },
    select: { userId: true, startDate: true, endDate: true },
  });

  const holidays = await prisma.holiday.findMany({
    where: { date: { gte: new Date(from), lte: toDate } },
    select: { date: true },
  });

  const leaveDaysPerUser = new Map<string, number>();
  for (const leave of leaves) {
    const days = Math.ceil((leave.endDate.getTime() - leave.startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    leaveDaysPerUser.set(leave.userId, (leaveDaysPerUser.get(leave.userId) || 0) + days);
  }

  const holidayCount = holidays.length;

  return NextResponse.json(
    users.map((u) => {
      const allocated = u.allocations.reduce((sum, a) => sum + a.allocation, 0);
      const allocatedHours = (DEFAULT_WEEKLY_CAPACITY * allocated) / 100;
      const leaveDays = leaveDaysPerUser.get(u.id) || 0;
      const leaveHours = leaveDays * 8;
      const holidayHours = holidayCount * 8;
      const available = DEFAULT_WEEKLY_CAPACITY - allocatedHours - leaveHours - holidayHours;
      return {
        userId: u.id, name: u.name, email: u.email, image: u.image,
        totalCapacity: DEFAULT_WEEKLY_CAPACITY,
        allocated: allocatedHours,
        available: Math.max(0, available),
        utilization: DEFAULT_WEEKLY_CAPACITY > 0 ? Math.round(((DEFAULT_WEEKLY_CAPACITY - available) / DEFAULT_WEEKLY_CAPACITY) * 100) : 0,
        leaveDays, holidayDays: holidayCount,
      };
    })
  );
}

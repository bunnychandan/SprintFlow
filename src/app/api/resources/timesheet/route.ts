import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function GET(request: Request) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
  if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || authz.user!.id;
  const weekStart = searchParams.get("weekStart");

  const where: Record<string, unknown> = { userId };
  if (weekStart) {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    where.weekStart = { gte: start, lt: end };
  }

  const timesheets = await prisma.timesheet.findMany({
    where: where as any,
    include: {
      entries: { orderBy: { loggedAt: "desc" } },
      user: { select: { name: true, email: true } },
      approver: { select: { name: true } },
    },
    orderBy: { weekStart: "desc" },
  });

  return NextResponse.json(
    timesheets.map((ts) => ({
      id: ts.id,
      userId: ts.userId,
      userName: ts.user.name,
      userEmail: ts.user.email,
      weekStart: ts.weekStart.toISOString().split("T")[0],
      weekEnd: ts.weekEnd.toISOString().split("T")[0],
      status: ts.status,
      totalHours: ts.totalHours,
      billableHours: ts.billableHours,
      notes: ts.notes,
      submittedAt: ts.submittedAt?.toISOString() || null,
      approvedAt: ts.approvedAt?.toISOString() || null,
      rejectedAt: ts.rejectedAt?.toISOString() || null,
      rejectionReason: ts.rejectionReason,
      approverId: ts.approverId,
      approverName: ts.approver?.name || null,
      entries: ts.entries.map((e) => ({
        id: e.id,
        taskId: e.taskId,
        taskTitle: "",
        userId: e.userId,
        timesheetId: e.timesheetId,
        description: e.description,
        timeSpent: e.timeSpent,
        billable: e.billable,
        loggedAt: e.loggedAt.toISOString(),
        createdAt: e.createdAt.toISOString(),
      })),
    }))
  );
}

export async function POST(request: Request) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
  if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

  const body = await request.json();
  const { taskId, description, timeSpent, billable, loggedAt, timesheetId } = body;

  if (!taskId || !timeSpent || !loggedAt) {
    return NextResponse.json({ error: "taskId, timeSpent, and loggedAt are required" }, { status: 400 });
  }

  if (timeSpent <= 0 || timeSpent > 24) {
    return NextResponse.json({ error: "timeSpent must be between 1 and 24 hours" }, { status: 400 });
  }

  const existing = await prisma.workLog.findFirst({
    where: { userId: authz.user!.id, taskId, loggedAt: new Date(loggedAt) },
  });
  if (existing) {
    return NextResponse.json({ error: "Duplicate entry: already logged time for this task on this date" }, { status: 409 });
  }

  const entry = await prisma.workLog.create({
    data: {
      taskId,
      userId: authz.user!.id,
      description: description || null,
      timeSpent,
      billable: billable ?? true,
      loggedAt: new Date(loggedAt),
      timesheetId: timesheetId || null,
    },
  });

  if (timesheetId) {
    await updateTimesheetTotals(timesheetId);
  }

  return NextResponse.json({
    id: entry.id, taskId: entry.taskId, userId: entry.userId,
    timesheetId: entry.timesheetId, description: entry.description,
    timeSpent: entry.timeSpent, billable: entry.billable,
    loggedAt: entry.loggedAt.toISOString(), createdAt: entry.createdAt.toISOString(),
  }, { status: 201 });
}

async function updateTimesheetTotals(timesheetId: string) {
  const entries = await prisma.workLog.findMany({ where: { timesheetId } });
  const totalHours = entries.reduce((sum, e) => sum + e.timeSpent, 0);
  const billableHours = entries.filter((e) => e.billable).reduce((sum, e) => sum + e.timeSpent, 0);
  await prisma.timesheet.update({ where: { id: timesheetId }, data: { totalHours, billableHours } });
}

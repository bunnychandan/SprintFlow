import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function POST(request: Request) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
  if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Timesheet ID required" }, { status: 400 });

  const timesheet = await prisma.timesheet.findUnique({
    where: { id },
    include: { entries: true },
  });

  if (!timesheet) return NextResponse.json({ error: "Timesheet not found" }, { status: 404 });
  if (timesheet.userId !== authz.user!.id) return NextResponse.json({ error: "Cannot submit another user's timesheet" }, { status: 403 });
  if (timesheet.status !== "DRAFT") return NextResponse.json({ error: "Timesheet already submitted/approved/rejected" }, { status: 400 });

  if (timesheet.entries.length === 0) {
    return NextResponse.json({ error: "Cannot submit empty timesheet" }, { status: 400 });
  }

  const updated = await prisma.timesheet.update({
    where: { id },
    data: { status: "SUBMITTED", submittedAt: new Date() },
    include: { user: { select: { name: true, email: true } }, approver: { select: { name: true } } },
  });

  await prisma.auditLog.create({
    data: {
      actorId: authz.user!.id,
      entityType: "Timesheet",
      entityId: id,
      action: "SUBMIT",
      details: `Timesheet submitted for week ${timesheet.weekStart.toISOString().split("T")[0]}`,
    },
  });

  return NextResponse.json(formatTimesheet(updated));
}

function formatTimesheet(ts: any) {
  return {
    id: ts.id, userId: ts.userId, userName: ts.user?.name, userEmail: ts.user?.email,
    weekStart: ts.weekStart.toISOString().split("T")[0], weekEnd: ts.weekEnd.toISOString().split("T")[0],
    status: ts.status, totalHours: ts.totalHours, billableHours: ts.billableHours,
    notes: ts.notes, submittedAt: ts.submittedAt?.toISOString() || null,
    approvedAt: ts.approvedAt?.toISOString() || null, rejectedAt: ts.rejectedAt?.toISOString() || null,
    rejectionReason: ts.rejectionReason, approverId: ts.approverId, approverName: ts.approver?.name || null,
    entries: (ts.entries || []).map((e: any) => ({
      id: e.id, taskId: e.taskId, taskTitle: "", userId: e.userId,
      timesheetId: e.timesheetId, description: e.description, timeSpent: e.timeSpent,
      billable: e.billable, loggedAt: e.loggedAt.toISOString(), createdAt: e.createdAt.toISOString(),
    })),
  };
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function POST(request: Request) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

  const { id, reason } = await request.json();
  if (!id) return NextResponse.json({ error: "Timesheet ID required" }, { status: 400 });
  if (!reason) return NextResponse.json({ error: "Rejection reason required" }, { status: 400 });

  const timesheet = await prisma.timesheet.findUnique({ where: { id }, include: { user: true } });
  if (!timesheet) return NextResponse.json({ error: "Timesheet not found" }, { status: 404 });

  if (timesheet.status !== "SUBMITTED") {
    return NextResponse.json({ error: "Only submitted timesheets can be rejected" }, { status: 400 });
  }

  const updated = await prisma.timesheet.update({
    where: { id },
    data: { status: "REJECTED", rejectedAt: new Date(), approverId: authz.user!.id, rejectionReason: reason },
    include: { user: { select: { name: true, email: true } }, approver: { select: { name: true } } },
  });

  await prisma.auditLog.create({
    data: {
      actorId: authz.user!.id,
      entityType: "Timesheet",
      entityId: id,
      action: "REJECT",
      details: `Timesheet for ${timesheet.user.name || timesheet.user.email} (week ${timesheet.weekStart.toISOString().split("T")[0]}) rejected: ${reason}`,
    },
  });

  return NextResponse.json({
    id: updated.id, userId: updated.userId, userName: updated.user.name, userEmail: updated.user.email,
    weekStart: updated.weekStart.toISOString().split("T")[0], weekEnd: updated.weekEnd.toISOString().split("T")[0],
    status: updated.status, totalHours: updated.totalHours, billableHours: updated.billableHours,
    notes: updated.notes, submittedAt: updated.submittedAt?.toISOString() || null,
    rejectedAt: updated.rejectedAt?.toISOString() || null, rejectionReason: updated.rejectionReason,
    approverId: updated.approverId, approverName: updated.approver?.name || null,
  });
}

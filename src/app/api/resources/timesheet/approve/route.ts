import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Timesheet ID required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Only admins can approve timesheets" }, { status: 403 });
  }

  const timesheet = await prisma.timesheet.findUnique({ where: { id }, include: { user: true } });
  if (!timesheet) return NextResponse.json({ error: "Timesheet not found" }, { status: 404 });

  if (timesheet.status !== "SUBMITTED") {
    return NextResponse.json({ error: "Only submitted timesheets can be approved" }, { status: 400 });
  }

  const updated = await prisma.timesheet.update({
    where: { id },
    data: { status: "APPROVED", approvedAt: new Date(), approverId: session.user.id },
    include: { user: { select: { name: true, email: true } }, approver: { select: { name: true } } },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      entityType: "Timesheet",
      entityId: id,
      action: "APPROVE",
      details: `Timesheet for ${timesheet.user.name || timesheet.user.email} (week ${timesheet.weekStart.toISOString().split("T")[0]}) approved`,
    },
  });

  return NextResponse.json({
    id: updated.id, userId: updated.userId, userName: updated.user.name, userEmail: updated.user.email,
    weekStart: updated.weekStart.toISOString().split("T")[0], weekEnd: updated.weekEnd.toISOString().split("T")[0],
    status: updated.status, totalHours: updated.totalHours, billableHours: updated.billableHours,
    notes: updated.notes, submittedAt: updated.submittedAt?.toISOString() || null,
    approvedAt: updated.approvedAt?.toISOString() || null, approverId: updated.approverId,
    approverName: updated.approver?.name || null,
  });
}

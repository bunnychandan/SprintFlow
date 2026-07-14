import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const entry = await prisma.workLog.findUnique({ where: { id }, include: { timesheet: true } });
  if (!entry) return NextResponse.json({ error: "Entry not found" }, { status: 404 });

  if (entry.userId !== session.user.id) {
    return NextResponse.json({ error: "Cannot edit another user's entry" }, { status: 403 });
  }

  if (entry.timesheet && entry.timesheet.status !== "DRAFT") {
    return NextResponse.json({ error: "Cannot edit approved/submitted entries" }, { status: 400 });
  }

  const updated = await prisma.workLog.update({
    where: { id },
    data: {
      description: body.description !== undefined ? body.description : undefined,
      timeSpent: body.timeSpent !== undefined ? body.timeSpent : undefined,
      billable: body.billable !== undefined ? body.billable : undefined,
      loggedAt: body.loggedAt ? new Date(body.loggedAt) : undefined,
    },
  });

  if (updated.timesheetId) {
    const entries = await prisma.workLog.findMany({ where: { timesheetId: updated.timesheetId } });
    const totalHours = entries.reduce((sum, e) => sum + e.timeSpent, 0);
    const billableHours = entries.filter((e) => e.billable).reduce((sum, e) => sum + e.timeSpent, 0);
    await prisma.timesheet.update({ where: { id: updated.timesheetId! }, data: { totalHours, billableHours } });
  }

  return NextResponse.json({
    id: updated.id, taskId: updated.taskId, userId: updated.userId,
    timesheetId: updated.timesheetId, description: updated.description,
    timeSpent: updated.timeSpent, billable: updated.billable,
    loggedAt: updated.loggedAt.toISOString(), createdAt: updated.createdAt.toISOString(),
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const entry = await prisma.workLog.findUnique({ where: { id }, include: { timesheet: true } });
  if (!entry) return NextResponse.json({ error: "Entry not found" }, { status: 404 });

  if (entry.userId !== session.user.id) {
    return NextResponse.json({ error: "Cannot delete another user's entry" }, { status: 403 });
  }

  if (entry.timesheet && entry.timesheet.status !== "DRAFT") {
    return NextResponse.json({ error: "Cannot delete approved/submitted entries" }, { status: 400 });
  }

  const timesheetId = entry.timesheetId;
  await prisma.workLog.delete({ where: { id } });

  if (timesheetId) {
    const entries = await prisma.workLog.findMany({ where: { timesheetId } });
    const totalHours = entries.reduce((sum, e) => sum + e.timeSpent, 0);
    const billableHours = entries.filter((e) => e.billable).reduce((sum, e) => sum + e.timeSpent, 0);
    await prisma.timesheet.update({ where: { id: timesheetId }, data: { totalHours, billableHours } });
  }

  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";
import { workLogSchema } from "@/lib/validations";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const task = await prisma.task.findUnique({ where: { id }, select: { id: true, projectId: true, deletedAt: true } });
  if (!task || task.deletedAt) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const authz = await requireProjectAccess(task.projectId);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const workLogs = await prisma.workLog.findMany({
    where: { taskId: id },
    orderBy: { loggedAt: "desc" },
    include: { user: { select: { id: true, name: true, image: true } } },
  });

  return NextResponse.json({ workLogs });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.deletedAt) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const authz = await requireProjectAccess(task.projectId, ["PROJECT_MANAGER", "SCRUM_MASTER", "DEVELOPER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const body = await request.json();
  const parsed = workLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const actorId = authz.user?.id ?? authz.session?.user?.id;
  if (!actorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = parsed.data;

  const workLog =   await prisma.$transaction(async (tx) => {
    await tx.workLog.create({
      data: {
        taskId: id,
        userId: actorId,
        timeSpent: data.timeSpent,
        description: data.description ?? null,
        loggedAt: data.loggedAt ? new Date(data.loggedAt) : new Date(),
      },
    });

    await tx.task.update({
      where: { id },
      data: {
        timeSpent: { increment: data.timeSpent },
      },
    });

    await tx.auditLog.create({
      data: { actorId, entityType: "TASK", entityId: id, action: "LOG_WORK", details: `Logged ${data.timeSpent}m work`, projectId: task.projectId },
    });
  });

  return NextResponse.json({ workLog }, { status: 201 });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";
import { relationshipSchema } from "@/lib/validations";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const task = await prisma.task.findUnique({ where: { id }, select: { id: true, projectId: true, deletedAt: true } });
  if (!task || task.deletedAt) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const authz = await requireProjectAccess(task.projectId);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const [outgoing, incoming] = await Promise.all([
    prisma.taskRelationship.findMany({
      where: { taskId: id },
      include: { relatedTask: { select: { id: true, title: true, status: true, type: true, projectId: true } } },
    }),
    prisma.taskRelationship.findMany({
      where: { relatedTaskId: id },
      include: { task: { select: { id: true, title: true, status: true, type: true, projectId: true } } },
    }),
  ]);

  return NextResponse.json({ outgoing, incoming });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const task = await prisma.task.findUnique({ where: { id }, select: { id: true, projectId: true, deletedAt: true } });
  if (!task || task.deletedAt) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const authz = await requireProjectAccess(task.projectId, ["PROJECT_MANAGER", "SCRUM_MASTER", "DEVELOPER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const body = await request.json();
  const parsed = relationshipSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { relatedTaskId, type } = parsed.data;

  if (relatedTaskId === id) {
    return NextResponse.json({ error: "Cannot relate a task to itself" }, { status: 400 });
  }

  const relatedTask = await prisma.task.findUnique({ where: { id: relatedTaskId } });
  if (!relatedTask || relatedTask.deletedAt) return NextResponse.json({ error: "Related task not found" }, { status: 404 });

  const existing = await prisma.taskRelationship.findFirst({
    where: { taskId: id, relatedTaskId: relatedTaskId },
  });
  if (existing) {
    return NextResponse.json({ error: "Relationship already exists" }, { status: 409 });
  }

  const actorId = authz.user?.id ?? authz.session?.user?.id;

  const relationship = await prisma.taskRelationship.create({
    data: { taskId: id, relatedTaskId, type: type as any },
  });

  await prisma.auditLog.create({
    data: { actorId, entityType: "TASK", entityId: id, action: "ADD_RELATIONSHIP", details: `Added ${type} relationship to ${relatedTask.title}`, projectId: task.projectId },
  });

  return NextResponse.json({ relationship }, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const relatedTaskId = searchParams.get("relatedTaskId");

  const task = await prisma.task.findUnique({ where: { id }, select: { id: true, projectId: true, deletedAt: true } });
  if (!task || task.deletedAt) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const authz = await requireProjectAccess(task.projectId, ["PROJECT_MANAGER", "SCRUM_MASTER", "DEVELOPER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const actorId = authz.user?.id ?? authz.session?.user?.id;

  if (relatedTaskId) {
    await prisma.taskRelationship.deleteMany({
      where: { taskId: id, relatedTaskId },
    });
    await prisma.taskRelationship.deleteMany({
      where: { taskId: relatedTaskId, relatedTaskId: id },
    });
  }

  await prisma.auditLog.create({
    data: { actorId, entityType: "TASK", entityId: id, action: "REMOVE_RELATIONSHIP", details: `Removed relationship with task ${relatedTaskId}`, projectId: task.projectId },
  });

  return NextResponse.json({ message: "Relationship removed" });
}

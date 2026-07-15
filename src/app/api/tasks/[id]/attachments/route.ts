import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const task = await prisma.task.findUnique({ where: { id }, select: { id: true, projectId: true, deletedAt: true } });
  if (!task || task.deletedAt) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const authz = await requireProjectAccess(task.projectId);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const attachments = await prisma.attachment.findMany({
    where: { taskId: id },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, image: true } } },
  });

  return NextResponse.json({ attachments });
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

  const actorId = authz.user?.id ?? authz.session?.user?.id;
  if (!actorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { fileName, fileUrl, fileSize, mimeType } = body;

  if (!fileName || !fileUrl) {
    return NextResponse.json({ error: "fileName and fileUrl are required" }, { status: 400 });
  }

  const { attachment } = await prisma.$transaction(async (tx) => {
    const attachment = await tx.attachment.create({
      data: {
        taskId: id,
        userId: actorId,
        fileName,
        fileUrl,
        fileSize: fileSize ?? null,
        mimeType: mimeType ?? null,
      },
    });

    await tx.auditLog.create({
      data: { actorId, entityType: "TASK", entityId: id, action: "ADD_ATTACHMENT", details: `Added attachment ${fileName}`, projectId: task.projectId },
    });

    return { attachment };
  });

  return NextResponse.json({ attachment }, { status: 201 });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const task = await prisma.task.findUnique({ where: { id }, select: { id: true, projectId: true, deletedAt: true } });
  if (!task || task.deletedAt) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const authz = await requireProjectAccess(task.projectId, ["PROJECT_MANAGER", "SCRUM_MASTER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const actorId = authz.user?.id ?? authz.session?.user?.id;

  await prisma.$transaction(async (tx) => {
    await tx.attachment.deleteMany({ where: { taskId: id } });

    await tx.auditLog.create({
      data: { actorId, entityType: "TASK", entityId: id, action: "DELETE_ATTACHMENTS", details: `Deleted all attachments for task`, projectId: task.projectId },
    });
  });

  return NextResponse.json({ message: "Attachments deleted" });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authz = await requireProjectAccess(id);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const project = await prisma.project.findFirst({ where: { id, deletedAt: null } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const tasks = await prisma.task.findMany({
    where: { projectId: id, deletedAt: null },
    select: { id: true },
  });

  const taskIds = tasks.map((t) => t.id);

  const attachments = await prisma.attachment.findMany({
    where: { taskId: { in: taskIds } },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, image: true } } },
  });

  return NextResponse.json(attachments.map((a) => ({
    id: a.id,
    fileName: a.fileName,
    fileUrl: a.fileUrl,
    fileSize: a.fileSize,
    mimeType: a.mimeType,
    createdAt: a.createdAt.toISOString(),
    user: a.user,
  })));
}

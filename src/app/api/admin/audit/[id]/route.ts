import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

  const { id } = await params;

  const log = await prisma.auditLog.findUnique({
    where: { id },
    include: {
      actor: { select: { id: true, name: true, email: true, image: true, role: true } },
    },
  });

  if (!log) {
    return NextResponse.json({ error: "Audit log not found" }, { status: 404 });
  }

  if (auth.user?.role !== "SUPER_ADMIN" && log.actorId !== auth.user!.id) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const previousLogs = await prisma.auditLog.findMany({
    where: { entityType: log.entityType, entityId: log.entityId, id: { not: id } },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      actor: { select: { name: true, email: true } },
    },
  });

  let relatedUser = null;
  let relatedProject = null;

  if (log.entityType === "USER") {
    relatedUser = await prisma.user.findUnique({
      where: { id: log.entityId },
      select: { id: true, name: true, email: true, role: true },
    });
  } else if (log.entityType === "PROJECT") {
    relatedProject = await prisma.project.findUnique({
      where: { id: log.entityId },
      select: { id: true, name: true, code: true },
    });
  } else if (log.entityType === "TASK") {
    const task = await prisma.task.findUnique({
      where: { id: log.entityId },
      select: { projectId: true, assigneeId: true, reporterId: true },
    });
    if (task) {
      if (task.assigneeId) {
        relatedUser = await prisma.user.findUnique({
          where: { id: task.assigneeId },
          select: { id: true, name: true, email: true, role: true },
        });
      }
      relatedProject = await prisma.project.findUnique({
        where: { id: task.projectId },
        select: { id: true, name: true, code: true },
      });
    }
  } else {
    relatedProject = log.projectId
      ? await prisma.project.findUnique({ where: { id: log.projectId }, select: { id: true, name: true, code: true } })
      : null;
  }

  return NextResponse.json({
    log,
    previousLogs,
    relatedUser,
    relatedProject,
  });
}

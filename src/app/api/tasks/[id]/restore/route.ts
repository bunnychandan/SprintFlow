import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const task = await prisma.task.findFirst({ where: { id, deletedAt: null } });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const authz = await requireProjectAccess(task.projectId);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const actorId = authz.user?.id ?? authz.session?.user?.id;

  await prisma.task.update({
    where: { id },
    data: { archivedAt: null, updatedById: actorId },
  });

  await prisma.auditLog.create({
    data: { actorId, entityType: "TASK", entityId: id, action: "RESTORE_TASK", details: `Restored task ${task.title} from archive`, projectId: task.projectId },
  });

  return NextResponse.json({ message: "Task restored from archive" });
}

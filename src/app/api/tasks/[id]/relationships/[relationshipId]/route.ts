import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; relationshipId: string }> }
) {
  const { id, relationshipId } = await params;

  const task = await prisma.task.findUnique({ where: { id }, select: { id: true, projectId: true, deletedAt: true } });
  if (!task || task.deletedAt) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const rel = await prisma.taskRelationship.findUnique({ where: { id: relationshipId } });
  if (!rel || rel.taskId !== id) return NextResponse.json({ error: "Relationship not found" }, { status: 404 });

  const authz = await requireProjectAccess(task.projectId, ["PROJECT_MANAGER", "SCRUM_MASTER", "DEVELOPER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const actorId = authz.user?.id ?? authz.session?.user?.id;

  await prisma.taskRelationship.delete({ where: { id: relationshipId } });

  await prisma.auditLog.create({
    data: { actorId, entityType: "TASK", entityId: id, action: "REMOVE_RELATIONSHIP", details: `Removed relationship`, projectId: task.projectId },
  });

  return NextResponse.json({ message: "Relationship removed" });
}

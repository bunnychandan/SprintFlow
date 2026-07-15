import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";
import { notifyProjectMembers } from "@/lib/project/notifications";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authz = await requireProjectAccess(id, ["PROJECT_MANAGER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const actorId = authz.user?.id ?? authz.session?.user?.id;
  if (!actorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || project.deletedAt) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  if (project.status !== "ARCHIVED") {
    return NextResponse.json({ error: "Project is not archived" }, { status: 400 });
  }

  const updated = await prisma.project.update({
    where: { id },
    data: { status: "ACTIVE", archivedAt: null, updatedById: actorId },
  });

  await prisma.auditLog.create({
    data: { actorId, entityType: "PROJECT", entityId: id, action: "RESTORE_PROJECT", details: `Restored project ${project.name}` },
  });

  await notifyProjectMembers({
    projectId: id,
    actorId,
    type: "PROJECT_UPDATED",
    title: "Project Restored",
    message: `Project "${project.name}" has been restored.`,
    excludeActor: true,
  });

  return NextResponse.json({ project: updated });
}

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

  const project = await prisma.project.findFirst({ where: { id, deletedAt: null } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  if (project.status === "ARCHIVED") {
    return NextResponse.json({ error: "Project is already archived" }, { status: 400 });
  }

  const updated = await prisma.project.update({
    where: { id },
    data: { status: "ARCHIVED", archivedAt: new Date(), updatedById: actorId },
  });

  await prisma.auditLog.create({
    data: { actorId, entityType: "PROJECT", entityId: id, action: "ARCHIVE_PROJECT", details: `Archived project ${project.name}` },
  });

  await notifyProjectMembers({
    projectId: id,
    actorId,
    type: "PROJECT_ARCHIVED",
    title: "Project Archived",
    message: `Project "${project.name}" has been archived.`,
    excludeActor: true,
  });

  return NextResponse.json({ project: updated });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { z } from "zod";
import { notifyProjectMembers } from "@/lib/project/notifications";

const transferSchema = z.object({
  newOwnerId: z.string().min(1),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authz = await requireRole(["SUPER_ADMIN"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const actorId = authz.user?.id ?? authz.session?.user?.id;
  if (!actorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = transferSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const project = await prisma.project.findFirst({ where: { id, deletedAt: null } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const newOwner = await prisma.user.findUnique({ where: { id: parsed.data.newOwnerId } });
  if (!newOwner) return NextResponse.json({ error: "New owner not found" }, { status: 404 });

  await prisma.project.update({
    where: { id },
    data: { ownerId: parsed.data.newOwnerId, updatedById: actorId },
  });

  const memberExists = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: id, userId: parsed.data.newOwnerId } },
  });
  if (!memberExists) {
    await prisma.projectMember.create({
      data: { projectId: id, userId: parsed.data.newOwnerId, roleInProject: "PROJECT_MANAGER" },
    });
  } else if (memberExists.roleInProject !== "PROJECT_MANAGER") {
    await prisma.projectMember.update({
      where: { projectId_userId: { projectId: id, userId: parsed.data.newOwnerId } },
      data: { roleInProject: "PROJECT_MANAGER" },
    });
  }

  await prisma.auditLog.create({
    data: { actorId, entityType: "PROJECT", entityId: id, action: "TRANSFER_OWNERSHIP", details: `Transferred ownership to ${newOwner.name || newOwner.email}` },
  });

  await notifyProjectMembers({
    projectId: id,
    actorId,
    type: "PROJECT_UPDATED",
    title: "Ownership Transferred",
    message: `Ownership of "${project.name}" has been transferred to ${newOwner.name || newOwner.email}.`,
    excludeActor: true,
  });

  return NextResponse.json({ message: "Ownership transferred successfully", newOwnerId: parsed.data.newOwnerId });
}

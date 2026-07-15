import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { z } from "zod";
import { notifyProjectMembers } from "@/lib/project/notifications";
import { handleApiError } from "@/lib/api-error-handler";

const transferSchema = z.object({
  newOwnerId: z.string().min(1),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const newOwnerId = parsed.data.newOwnerId;

    const result = await prisma.$transaction(async (tx) => {
      const project = await tx.project.findUnique({ where: { id } });
      if (!project || project.deletedAt) throw new Error("PROJECT_NOT_FOUND");

      const newOwner = await tx.user.findUnique({ where: { id: newOwnerId } });
      if (!newOwner) throw new Error("USER_NOT_FOUND");

      await tx.project.update({
        where: { id },
        data: { ownerId: newOwnerId, updatedById: actorId },
      });

      const memberExists = await tx.projectMember.findUnique({
        where: { projectId_userId: { projectId: id, userId: newOwnerId } },
      });

      if (!memberExists) {
        await tx.projectMember.create({
          data: { projectId: id, userId: newOwnerId, roleInProject: "PROJECT_MANAGER" },
        });
      } else if (memberExists.roleInProject !== "PROJECT_MANAGER") {
        await tx.projectMember.update({
          where: { projectId_userId: { projectId: id, userId: newOwnerId } },
          data: { roleInProject: "PROJECT_MANAGER" },
        });
      }

      await tx.auditLog.create({
        data: { actorId, entityType: "PROJECT", entityId: id, action: "TRANSFER_OWNERSHIP", details: `Transferred ownership to ${newOwner.name || newOwner.email}` },
      });

      return { projectName: project.name, newOwnerName: newOwner.name || newOwner.email };
    });

    await notifyProjectMembers({
      projectId: id,
      actorId,
      type: "PROJECT_UPDATED",
      title: "Ownership Transferred",
      message: `Ownership of "${result.projectName}" has been transferred to ${result.newOwnerName}.`,
      excludeActor: true,
    });

    return NextResponse.json({ message: "Ownership transferred successfully", newOwnerId });
  } catch (error: any) {
    if (error?.message === "PROJECT_NOT_FOUND") {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (error?.message === "USER_NOT_FOUND") {
      return NextResponse.json({ error: "New owner not found" }, { status: 404 });
    }
    return handleApiError(error);
  }
}

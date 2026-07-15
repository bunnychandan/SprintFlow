import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";
import { releaseUpdateSchema } from "@/lib/validations";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const release = await prisma.release.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true, image: true } },
        updatedBy: { select: { id: true, name: true, email: true, image: true } },
        project: { select: { id: true, name: true, code: true, color: true, status: true } },
        _count: { select: { tasks: true } },
      },
    });

    if (!release || release.archivedAt) return NextResponse.json({ error: "Release not found" }, { status: 404 });

    const authz = await requireProjectAccess(release.projectId);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    return NextResponse.json({ release });
  } catch (error) {
    return handleApiError(error, "GET /api/releases/[id]");
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const release = await prisma.release.findUnique({ where: { id }, select: { id: true, projectId: true, status: true, name: true } });
    if (!release) return NextResponse.json({ error: "Release not found" }, { status: 404 });

    if (release.status === "RELEASED" || release.status === "CANCELLED") {
      return NextResponse.json({ error: `Cannot edit a ${release.status.toLowerCase()} release` }, { status: 400 });
    }

    const authz = await requireProjectAccess(release.projectId, ["PROJECT_MANAGER", "SCRUM_MASTER"]);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    const body = await request.json();
    const parsed = releaseUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const actorId = authz.user?.id ?? authz.session?.user?.id;
    if (!actorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = parsed.data;
    const dataToUpdate: Record<string, unknown> = { updatedById: actorId };
    if (data.name !== undefined) dataToUpdate.name = data.name;
    if (data.version !== undefined) dataToUpdate.version = data.version;
    if (data.description !== undefined) dataToUpdate.description = data.description;
    if (data.startDate !== undefined) dataToUpdate.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.targetDate !== undefined) dataToUpdate.targetDate = data.targetDate ? new Date(data.targetDate) : null;

    const updated = await prisma.release.update({
      where: { id },
      data: dataToUpdate as any,
      include: {
        createdBy: { select: { id: true, name: true, email: true, image: true } },
        updatedBy: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    const changedFields = Object.keys(dataToUpdate).filter(k => k !== "updatedById").join(", ");
    await prisma.auditLog.create({
      data: { actorId, entityType: "RELEASE", entityId: id, action: "UPDATE_RELEASE", details: `Updated release "${updated.name}" fields: ${changedFields}`, projectId: updated.projectId },
    });

    return NextResponse.json({ release: updated });
  } catch (error) {
    return handleApiError(error, "PUT /api/releases/[id]");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const release = await prisma.release.findUnique({ where: { id }, select: { id: true, projectId: true, name: true, status: true, archivedAt: true } });
    if (!release || release.archivedAt) return NextResponse.json({ error: "Release not found" }, { status: 404 });

    if (release.status === "RELEASED") {
      return NextResponse.json({ error: "Cannot delete a released release" }, { status: 400 });
    }

    const authz = await requireProjectAccess(release.projectId);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    const isPmOrScrum = authz.member && ["PROJECT_MANAGER", "SCRUM_MASTER"].includes(authz.member.roleInProject);
    const isGlobalAdmin = ["SUPER_ADMIN", "ADMIN"].includes(authz.user?.role ?? "");

    if (!isPmOrScrum && !isGlobalAdmin) {
      return NextResponse.json({ error: "Insufficient permissions to delete release" }, { status: 403 });
    }

    const actorId = authz.user?.id ?? authz.session?.user?.id;

    await prisma.$transaction([
      prisma.task.updateMany({ where: { releaseId: id }, data: { releaseId: null } }),
      prisma.release.update({ where: { id }, data: { archivedAt: new Date(), updatedById: actorId } }),
    ]);

    await prisma.auditLog.create({
      data: { actorId, entityType: "RELEASE", entityId: id, action: "DELETE_RELEASE", details: `Soft-deleted release "${release.name}"`, projectId: release.projectId },
    });

    return NextResponse.json({ message: "Release deleted successfully" });
  } catch (error) {
    return handleApiError(error, "DELETE /api/releases/[id]");
  }
}

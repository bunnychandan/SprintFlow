import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";
import { epicUpdateSchema } from "@/lib/validations";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const epic = await prisma.epic.findFirst({
      where: { id, archivedAt: null },
      include: {
        owner: { select: { id: true, name: true, email: true, image: true } },
        project: { select: { id: true, name: true, code: true, color: true, status: true } },
        _count: { select: { tasks: true } },
      },
    });

    if (!epic) return NextResponse.json({ error: "Epic not found" }, { status: 404 });

    const authz = await requireProjectAccess(epic.projectId);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    return NextResponse.json({ epic });
  } catch (error) {
    return handleApiError(error, "GET /api/epics/[id]");
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const epic = await prisma.epic.findFirst({ where: { id, archivedAt: null } });
    if (!epic) return NextResponse.json({ error: "Epic not found" }, { status: 404 });

    if (epic.status === "COMPLETED" || epic.status === "CANCELLED") {
      return NextResponse.json({ error: `Cannot edit a ${epic.status.toLowerCase()} epic` }, { status: 400 });
    }

    const authz = await requireProjectAccess(epic.projectId, ["PROJECT_MANAGER", "SCRUM_MASTER"]);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    const body = await request.json();
    const parsed = epicUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const actorId = authz.user?.id ?? authz.session?.user?.id;
    if (!actorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = parsed.data;

    const dataToUpdate: Record<string, unknown> = {};
    if (data.title !== undefined) dataToUpdate.title = data.title;
    if (data.description !== undefined) dataToUpdate.description = data.description;
    if (data.status !== undefined) dataToUpdate.status = data.status;
    if (data.priority !== undefined) dataToUpdate.priority = data.priority;
    if (data.color !== undefined) dataToUpdate.color = data.color;
    if (data.ownerId !== undefined) dataToUpdate.ownerId = data.ownerId;
    if (data.startDate !== undefined) dataToUpdate.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.targetDate !== undefined) dataToUpdate.targetDate = data.targetDate ? new Date(data.targetDate) : null;

    if (data.status === "COMPLETED") {
      (dataToUpdate as any).completedAt = new Date();
    }

    const updated = await prisma.epic.update({
      where: { id },
      data: dataToUpdate as any,
      include: {
        owner: { select: { id: true, name: true, email: true, image: true } },
        project: { select: { id: true, name: true, code: true, color: true } },
      },
    });

    const changedFields = Object.keys(dataToUpdate).filter(k => k !== "completedAt").join(", ");
    await prisma.auditLog.create({
      data: { actorId, entityType: "EPIC", entityId: id, action: "UPDATE_EPIC", details: `Updated epic "${updated.title}" fields: ${changedFields}`, projectId: updated.projectId },
    });

    return NextResponse.json({ epic: updated });
  } catch (error) {
    return handleApiError(error, "PUT /api/epics/[id]");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const epic = await prisma.epic.findFirst({ where: { id, archivedAt: null } });
    if (!epic) return NextResponse.json({ error: "Epic not found" }, { status: 404 });

    const authz = await requireProjectAccess(epic.projectId);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    const isPmOrScrum = authz.member && ["PROJECT_MANAGER", "SCRUM_MASTER"].includes(authz.member.roleInProject);
    const isOwner = epic.ownerId === authz.user?.id;
    const isGlobalAdmin = ["SUPER_ADMIN", "ADMIN"].includes(authz.user?.role ?? "");

    if (!isPmOrScrum && !isOwner && !isGlobalAdmin) {
      return NextResponse.json({ error: "Insufficient permissions to delete epic" }, { status: 403 });
    }

    const actorId = authz.user?.id ?? authz.session?.user?.id;

    await prisma.$transaction([
      prisma.task.updateMany({ where: { epicId: id }, data: { epicId: null } }),
      prisma.epic.update({ where: { id }, data: { archivedAt: new Date() } }),
    ]);

    await prisma.auditLog.create({
      data: { actorId, entityType: "EPIC", entityId: id, action: "DELETE_EPIC", details: `Soft-deleted epic "${epic.title}"`, projectId: epic.projectId },
    });

    return NextResponse.json({ message: "Epic deleted successfully" });
  } catch (error) {
    return handleApiError(error, "DELETE /api/epics/[id]");
  }
}

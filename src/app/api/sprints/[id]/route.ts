import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";
import { sprintUpdateSchema } from "@/lib/validations";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const sprint = await prisma.sprint.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, code: true, color: true, status: true, visibility: true } },
        createdBy: { select: { id: true, name: true, email: true, image: true, role: true } },
        updatedBy: { select: { id: true, name: true, email: true, image: true } },
        tasks: {
          orderBy: { createdAt: "desc" },
          include: {
            assignee: { select: { id: true, name: true, email: true, image: true } },
            reporter: { select: { id: true, name: true, email: true, image: true } },
          },
        },
      },
    });

    if (!sprint || sprint.deletedAt) return NextResponse.json({ error: "Sprint not found" }, { status: 404 });

    const authz = await requireProjectAccess(sprint.projectId);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    return NextResponse.json({ sprint });
  } catch (error) {
    return handleApiError(error, "GET /api/sprints/[id]");
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const sprintExists = await prisma.sprint.findUnique({ where: { id }, select: { id: true, projectId: true, status: true, name: true } });
    if (!sprintExists) return NextResponse.json({ error: "Sprint not found" }, { status: 404 });

    if (sprintExists.status === "COMPLETED" || sprintExists.status === "CANCELLED") {
      return NextResponse.json({ error: `Cannot edit a ${sprintExists.status.toLowerCase()} sprint` }, { status: 400 });
    }

    const authz = await requireProjectAccess(sprintExists.projectId, ["PROJECT_MANAGER", "SCRUM_MASTER"]);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    const body = await request.json();
    const parsed = sprintUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const actorId = authz.user?.id ?? authz.session?.user?.id;
    const data = parsed.data;

    const updateData: Record<string, unknown> = { updatedById: actorId };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.goal !== undefined) updateData.goal = data.goal;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;

    const sprint = await prisma.sprint.update({ where: { id }, data: updateData });

    await prisma.auditLog.create({
      data: { actorId, entityType: "SPRINT", entityId: id, action: "UPDATE_SPRINT", details: `Updated sprint ${sprint.name}` },
    });

    return NextResponse.json({ sprint });
  } catch (error) {
    return handleApiError(error, "PUT /api/sprints/[id]");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const sprint = await prisma.sprint.findUnique({ where: { id }, select: { id: true, projectId: true, status: true, name: true } });
    if (!sprint) return NextResponse.json({ error: "Sprint not found" }, { status: 404 });

    if (sprint.status === "ACTIVE") {
      return NextResponse.json({ error: "Cannot delete an active sprint. Cancel it first." }, { status: 400 });
    }

    const authz = await requireProjectAccess(sprint.projectId, ["PROJECT_MANAGER", "SCRUM_MASTER"]);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    const actorId = authz.user?.id ?? authz.session?.user?.id;

    await prisma.$transaction([
      prisma.task.updateMany({ where: { sprintId: id }, data: { sprintId: null } }),
      prisma.sprint.update({ where: { id }, data: { deletedAt: new Date(), updatedById: actorId } }),
      prisma.auditLog.create({ data: { actorId, entityType: "SPRINT", entityId: id, action: "DELETE_SPRINT", details: `Deleted sprint ${sprint.name}` } }),
    ]);

    return NextResponse.json({ message: "Sprint deleted successfully" });
  } catch (error) {
    return handleApiError(error, "DELETE /api/sprints/[id]");
  }
}

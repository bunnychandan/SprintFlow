import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";
import { projectUpdateSchema } from "@/lib/validations";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authz = await requireProjectAccess(id);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    const sessionUserId = authz.user?.id;

    const project = await prisma.project.findFirst({
      where: { id, deletedAt: null },
      include: {
        owner: { select: { id: true, name: true, email: true, image: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true, image: true, role: true, department: true, designation: true } } },
        },
        sprints: { orderBy: { createdAt: "desc" } },
        tasks: {
          orderBy: { createdAt: "desc" },
          include: {
            assignee: { select: { id: true, name: true, email: true, image: true } },
            reporter: { select: { id: true, name: true, email: true, image: true } },
          },
        },
      },
    });

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    let isFavorited = false;
    if (sessionUserId) {
      const fav = await prisma.projectFavorite.findUnique({
        where: { projectId_userId: { projectId: id, userId: sessionUserId } },
      });
      isFavorited = !!fav;
    }

    return NextResponse.json({ project: { ...project, isFavorited } });
  } catch (error) {
    return handleApiError(error, "GET /api/projects/[id]");
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authz = await requireProjectAccess(id, ["PROJECT_MANAGER", "SCRUM_MASTER"]);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    const body = await request.json();
    const parsed = projectUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const actorId = authz.user?.id ?? authz.session?.user?.id;
    const data = parsed.data;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.visibility !== undefined && { visibility: data.visibility }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.startDate !== undefined && { startDate: data.startDate ? new Date(data.startDate) : null }),
        ...(data.targetDate !== undefined && { targetDate: data.targetDate ? new Date(data.targetDate) : null }),
      },
    });

    await prisma.auditLog.create({
      data: { actorId, entityType: "PROJECT", entityId: project.id, action: "UPDATE_PROJECT", details: `Updated project settings for ${project.name}` },
    });

    await prisma.notification.createMany({
      data: {
        recipientId: project.ownerId,
        actorId,
        projectId: project.id,
        type: "PROJECT_UPDATED",
        title: "Project Updated",
        message: `Project "${project.name}" settings were updated.`,
        channel: "IN_APP",
      },
    });

    return NextResponse.json({ project });
  } catch (error) {
    return handleApiError(error, "PUT /api/projects/[id]");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authz = await requireProjectAccess(id, ["PROJECT_MANAGER"]);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    const actorId = authz.user?.id ?? authz.session?.user?.id;
    const project = await prisma.project.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: actorId },
    });

    await prisma.auditLog.create({
      data: { actorId, entityType: "PROJECT", entityId: id, action: "DELETE_PROJECT", details: `Soft-deleted project ${project.name}` },
    });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    return handleApiError(error, "DELETE /api/projects/[id]");
  }
}

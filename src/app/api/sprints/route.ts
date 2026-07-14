import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, requireProjectAccess } from "@/lib/authz";
import { sprintCreateSchema } from "@/lib/validations";
import { parsePagination, paginationMeta } from "@/lib/api-utils";
import { notifySprintMembers } from "@/lib/sprint/notifications";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: Request) {
  try {
    const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    const userId = authz.user?.id;
    const userRole = authz.user?.role;
    const { skip, take, page, pageSize } = parsePagination(request);
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const projectId = searchParams.get("projectId");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: Record<string, unknown> = { deletedAt: null };

    if (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN") {
      const userProjects = await prisma.projectMember.findMany({
        where: { userId },
        select: { projectId: true },
      });
      where.projectId = { in: userProjects.map((p) => p.projectId) };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { goal: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) where.status = status;
    if (projectId) where.projectId = projectId;

    const validSort = ["createdAt", "updatedAt", "name", "startDate", "endDate", "status"];
    const orderField = validSort.includes(sortBy) ? sortBy : "createdAt";
    const orderDir = sortOrder === "asc" ? "asc" : "desc";

    const [sprints, total] = await Promise.all([
      prisma.sprint.findMany({
        where,
        skip,
        take,
        orderBy: { [orderField]: orderDir },
        include: {
          project: { select: { id: true, name: true, code: true, color: true } },
          createdBy: { select: { id: true, name: true, email: true, image: true } },
          tasks: {
            where: { deletedAt: null },
            select: { status: true, storyPoints: true },
          },
          _count: { select: { tasks: true } },
        },
      }),
      prisma.sprint.count({ where }),
    ]);

    const sprintsWithStats = sprints.map((sprint) => {
      const tasks = sprint.tasks;
      const completedTasks = tasks.filter((t) => t.status === "DONE").length;
      const totalStoryPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
      const completedStoryPoints = tasks
        .filter((t) => t.status === "DONE")
        .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

      const { tasks: _tasks, ...sprintData } = sprint;
      return {
        ...sprintData,
        completedTasks,
        totalStoryPoints,
        completedStoryPoints,
      };
    });

    return NextResponse.json({
      sprints: sprintsWithStats,
      pagination: paginationMeta(total, { skip, take, page, pageSize }),
    });
  } catch (error) {
    return handleApiError(error, "GET /api/sprints");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = sprintCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const authz = await requireProjectAccess(data.projectId, ["PROJECT_MANAGER", "SCRUM_MASTER"]);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    const actorId = authz.user?.id ?? authz.session?.user?.id;
    if (!actorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sprint = await prisma.sprint.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        goal: data.goal ?? null,
        status: data.status ?? "PLANNING",
        createdById: actorId,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    await prisma.auditLog.create({
      data: { actorId, entityType: "SPRINT", entityId: sprint.id, action: "CREATE_SPRINT", details: `Created sprint ${sprint.name}` },
    });

    await notifySprintMembers({
      projectId: sprint.projectId,
      sprintId: sprint.id,
      actorId,
      type: "SPRINT_STARTED",
      title: "Sprint Created",
      message: `Sprint "${sprint.name}" has been created.`,
      excludeActor: true,
    });

    return NextResponse.json({ sprint }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "POST /api/sprints");
  }
}

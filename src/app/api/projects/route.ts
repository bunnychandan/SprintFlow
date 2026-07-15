import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { projectCreateSchema } from "@/lib/validations";
import { parsePagination, paginationMeta, searchParams, validatedOrderBy, searchFilter } from "@/lib/api-utils";
import { notifyProjectMembers } from "@/lib/project/notifications";
import { handleApiError } from "@/lib/api-error-handler";

const projectInclude = {
  owner: { select: { id: true, name: true, email: true, image: true } },
  members: {
    include: { user: { select: { id: true, name: true, email: true, image: true, role: true } } },
  },
  _count: { select: { tasks: true, sprints: true, members: true } },
};

export async function GET(request: Request) {
  try {
    const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    const sp = searchParams(request);
    const { skip, take, page, pageSize } = parsePagination(request);
    const userId = authz.user?.id;
    const userRole = authz.user?.role;

    const where: Record<string, unknown> = {
      deletedAt: null,
      ...(userRole !== "SUPER_ADMIN" && userRole !== "ADMIN"
        ? { members: { some: { userId } } }
        : {}),
    };

    const status = sp.get("status");
    const visibility = sp.get("visibility");
    if (status) where.status = status;
    if (visibility) where.visibility = visibility;

    where.OR = searchFilter(sp.get("search"), ["name", "code", "description"]);

    const orderBy = validatedOrderBy(sp.get("sortBy"), sp.get("sortOrder"), ["createdAt", "updatedAt", "name", "status"]);

    const [projects, total] = await Promise.all([
      prisma.project.findMany({ where, skip, take, orderBy, include: projectInclude }),
      prisma.project.count({ where }),
    ]);

    let favorites: Set<string> = new Set();
    if (userId) {
      const favs = await prisma.projectFavorite.findMany({
        where: { userId },
        select: { projectId: true },
      });
      favorites = new Set(favs.map((f) => f.projectId));
    }

    const projectsWithFav = projects.map((p) => ({ ...p, isFavorited: favorites.has(p.id) }));

    return NextResponse.json({ projects: projectsWithFav, pagination: paginationMeta(total, { skip, take, page, pageSize }) });
  } catch (error) {
    return handleApiError(error, "GET /api/projects");
  }
}

export async function POST(request: Request) {
  try {
    const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    const body = await request.json();
    const parsed = projectCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const actorId = authz.user?.id ?? authz.session?.user?.id;
    if (!actorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = parsed.data;

    const project = await prisma.project.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description ?? null,
        visibility: data.visibility,
        color: data.color,
        startDate: data.startDate ? new Date(data.startDate) : null,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        ownerId: actorId,
        createdById: actorId,
      },
    });

    await prisma.projectMember.create({
      data: { projectId: project.id, userId: actorId, roleInProject: "PROJECT_MANAGER" },
    });

    await prisma.auditLog.create({
      data: { actorId, entityType: "PROJECT", entityId: project.id, action: "CREATE_PROJECT", details: `Created project ${project.name}` },
    });

    await notifyProjectMembers({
      projectId: project.id,
      actorId,
      type: "PROJECT_CREATED",
      title: "New Project Created",
      message: `Project "${project.name}" has been created.`,
      excludeActor: true,
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "POST /api/projects");
  }
}

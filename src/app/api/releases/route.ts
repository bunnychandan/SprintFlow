import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, requireProjectAccess } from "@/lib/authz";
import { releaseCreateSchema } from "@/lib/validations";
import { parsePagination, paginationMeta } from "@/lib/api-utils";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: Request) {
  try {
    const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    const { searchParams } = new URL(request.url);
    const userId = authz.user?.id;
    const userRole = authz.user?.role;
    const { skip, take, page, pageSize } = parsePagination(request);

    const search = searchParams.get("search");
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: Record<string, unknown> = { archivedAt: null };

    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { version: { contains: search, mode: "insensitive" } },
      ];
    }

    if (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN") {
      where.project = { members: { some: { userId } } };
    }

    const validSort = ["createdAt", "updatedAt", "name", "status", "targetDate", "version"];
    const orderField = validSort.includes(sortBy) ? sortBy : "createdAt";
    const orderDir = sortOrder === "asc" ? "asc" : "desc";

    const [releases, total] = await Promise.all([
      prisma.release.findMany({
        where: where as any,
        skip,
        take,
        orderBy: { [orderField]: orderDir },
        include: {
          createdBy: { select: { id: true, name: true, email: true, image: true } },
          project: { select: { id: true, name: true, code: true, color: true } },
          _count: { select: { tasks: true } },
        },
      }),
      prisma.release.count({ where: where as any }),
    ]);

    return NextResponse.json({ releases, pagination: paginationMeta(total, { skip, take, page, pageSize }) });
  } catch (error) {
    return handleApiError(error, "GET /api/releases");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = releaseCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const authz = await requireProjectAccess(data.projectId, ["PROJECT_MANAGER", "SCRUM_MASTER"]);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    const actorId = authz.user?.id ?? authz.session?.user?.id;
    if (!actorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const release = await prisma.release.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        version: data.version ?? null,
        description: data.description ?? null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        createdById: actorId,
      },
    });

    await prisma.auditLog.create({
      data: { actorId, entityType: "RELEASE", entityId: release.id, action: "CREATE_RELEASE", details: `Created release "${release.name}"`, projectId: release.projectId },
    });

    return NextResponse.json({ release }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "POST /api/releases");
  }
}

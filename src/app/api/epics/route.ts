import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, requireProjectAccess } from "@/lib/authz";
import { epicCreateSchema } from "@/lib/validations";
import { parsePagination, paginationMeta, searchParams, validatedOrderBy, searchFilter } from "@/lib/api-utils";
import { handleApiError } from "@/lib/api-error-handler";

const epicInclude = {
  owner: { select: { id: true, name: true, email: true, image: true } },
  project: { select: { id: true, name: true, code: true, color: true } },
  _count: { select: { tasks: true } },
};

export async function GET(request: Request) {
  try {
    const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    const sp = searchParams(request);
    const userId = authz.user?.id;
    const userRole = authz.user?.role;
    const { skip, take, page, pageSize } = parsePagination(request);

    const where: Record<string, unknown> = { archivedAt: null };

    for (const field of ["projectId", "status", "priority", "ownerId"]) {
      const val = sp.get(field);
      if (val) where[field] = val;
    }

    where.OR = searchFilter(sp.get("search"), ["title", "description"]);

    if (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN") {
      where.project = { members: { some: { userId } } };
    }

    const orderBy = validatedOrderBy(sp.get("sortBy"), sp.get("sortOrder"), ["createdAt", "updatedAt", "title", "status", "priority", "targetDate"]);

    const [epics, total] = await Promise.all([
      prisma.epic.findMany({ where: where as any, skip, take, orderBy, include: epicInclude }),
      prisma.epic.count({ where: where as any }),
    ]);

    return NextResponse.json({ epics, pagination: paginationMeta(total, { skip, take, page, pageSize }) });
  } catch (error) {
    return handleApiError(error, "GET /api/epics");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = epicCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const authz = await requireProjectAccess(data.projectId, ["PROJECT_MANAGER", "SCRUM_MASTER"]);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    const actorId = authz.user?.id ?? authz.session?.user?.id;
    if (!actorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const epic = await prisma.epic.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        description: data.description ?? null,
        priority: data.priority as any,
        color: data.color,
        ownerId: data.ownerId,
        startDate: data.startDate ? new Date(data.startDate) : null,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
      },
    });

    await prisma.auditLog.create({
      data: { actorId, entityType: "EPIC", entityId: epic.id, action: "CREATE_EPIC", details: `Created epic "${epic.title}"`, projectId: epic.projectId },
    });

    return NextResponse.json({ epic }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "POST /api/epics");
  }
}

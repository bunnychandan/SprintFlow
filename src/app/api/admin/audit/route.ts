import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import { parsePagination, paginationMeta } from "@/lib/api-utils";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const pagination = parsePagination(request);
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const action = searchParams.get("action") || "";
  const entityType = searchParams.get("entityType") || "";
  const actorId = searchParams.get("actorId") || "";
  const success = searchParams.get("success") || "";
  const projectId = searchParams.get("projectId") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";

  const allowedSortFields = ["createdAt", "action", "entityType", "entityId"];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const order = sortOrder === "asc" ? "asc" : "desc";

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { action: { contains: search, mode: "insensitive" } },
      { entityType: { contains: search, mode: "insensitive" } },
      { entityId: { contains: search, mode: "insensitive" } },
      { details: { contains: search, mode: "insensitive" } },
      { actor: { name: { contains: search, mode: "insensitive" } } },
      { actor: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (action) where.action = action;
  if (entityType) where.entityType = entityType;
  if (actorId) where.actorId = actorId;
  if (success === "true") where.success = true;
  else if (success === "false") where.success = false;
  if (projectId) where.projectId = projectId;

  if (dateFrom || dateTo) {
    const createdAt: Record<string, Date> = {};
    if (dateFrom) createdAt.gte = new Date(dateFrom);
    if (dateTo) createdAt.lte = new Date(dateTo);
    where.createdAt = createdAt;
  }

  if (auth.user?.role !== "SUPER_ADMIN") {
    const managedProjectIds = (await prisma.projectMember.findMany({
      where: { userId: auth.user!.id, roleInProject: "PROJECT_MANAGER" },
      select: { projectId: true },
    })).map((m) => m.projectId);

    const selfActionIds = (await prisma.auditLog.findMany({
      where: { actorId: auth.user!.id },
      select: { entityId: true },
      distinct: ["entityId"],
    })).map((l) => l.entityId);

    const adminWhere: Record<string, unknown>[] = [
      { actorId: auth.user!.id },
    ];
    if (managedProjectIds.length > 0) {
      adminWhere.push({ projectId: { in: managedProjectIds } });
    }
    if (selfActionIds.length > 0) {
      adminWhere.push({ entityType: "USER", entityId: { in: selfActionIds } });
    }

    if (Array.isArray(where.OR) && where.OR.length > 0) {
      where.AND = [{ OR: where.OR }, { OR: adminWhere }];
      delete where.OR;
    } else {
      where.OR = adminWhere;
    }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: where as any,
      include: {
        actor: { select: { id: true, name: true, email: true, image: true, role: true } },
      },
      orderBy: { [sortField]: order },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.auditLog.count({ where: where as any }),
  ]);

  await prisma.auditLog.create({
    data: {
      actorId: auth.user!.id,
      entityType: "AUDIT",
      entityId: `list:${pagination.page}`,
      action: "VIEW_AUDIT_LOG",
      details: `Viewed audit log listing (page ${pagination.page})`,
    },
  });

  return NextResponse.json({ logs, pagination: paginationMeta(total, pagination) });
}

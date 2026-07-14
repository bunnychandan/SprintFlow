import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import { userCreateSchema } from "@/lib/validations";
import { parsePagination, paginationMeta } from "@/lib/api-utils";
import type { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  const authz = await requireAdmin();
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const { searchParams } = new URL(request.url);
  const { skip, take, page, pageSize } = parsePagination(request);
  const search = searchParams.get("search")?.trim();
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") || "desc") as Prisma.SortOrder;
  const role = searchParams.get("role");
  const isActive = searchParams.get("isActive");
  const department = searchParams.get("department");

  const where: Prisma.UserWhereInput = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { department: { contains: search, mode: "insensitive" } },
      { designation: { contains: search, mode: "insensitive" } },
    ];
  }
  if (role) where.role = role as any;
  if (isActive === "true") where.isActive = true;
  if (isActive === "false") where.isActive = false;
  if (department) where.department = { contains: department, mode: "insensitive" };

  const allowedSortFields = ["name", "email", "role", "createdAt", "lastLoginAt", "department", "designation"];
  const orderBy: Prisma.UserOrderByWithRelationInput = allowedSortFields.includes(sortBy)
    ? { [sortBy]: sortOrder }
    : { createdAt: "desc" };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isActive: true,
        department: true,
        designation: true,
        lastLoginAt: true,
        deletedAt: true,
        createdAt: true,
        _count: { select: { projects: true, tasksAssigned: true, tasksReported: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ users, pagination: paginationMeta(total, { skip, take, page, pageSize }) });
}

export async function POST(request: Request) {
  const authz = await requireAdmin();
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const body = await request.json();
  const parsed = userCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const email = data.email.toLowerCase().trim();
  const actorId = authz.user?.id ?? authz.session?.user?.id;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
  }

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email,
        name: data.name ?? email,
        role: data.role,
        isActive: true,
        department: data.department ?? null,
        designation: data.designation ?? null,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId,
        entityType: "USER",
        entityId: created.id,
        action: "CREATE_USER",
        details: `Created user ${created.email} with role ${created.role}${data.department ? ` in ${data.department}` : ""}`,
      },
    });

    return created;
  });

  return NextResponse.json({ message: "User created", user }, { status: 201 });
}

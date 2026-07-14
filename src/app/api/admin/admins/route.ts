import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { z } from "zod";
import { defaultAdminPermissions } from "@/lib/constants";
import { parsePagination, paginationMeta } from "@/lib/api-utils";
import type { Prisma } from "@prisma/client";

const adminCreateSchema = z.object({
  email: z.string().email("Valid email is required"),
  name: z.string().max(200).optional(),
  department: z.string().max(200).optional(),
  designation: z.string().max(200).optional(),
  isActive: z.boolean().optional().default(true),
  permissions: z.record(z.string(), z.boolean()).optional(),
});

const adminUpdateSchema = z.object({
  name: z.string().max(200).optional(),
  department: z.string().max(200).nullable().optional(),
  designation: z.string().max(200).nullable().optional(),
  isActive: z.boolean().optional(),
  image: z.string().max(500).nullable().optional(),
  permissions: z.record(z.string(), z.boolean()).optional(),
});

export async function GET(request: Request) {
  const authz = await requireRole(["SUPER_ADMIN"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const { searchParams } = new URL(request.url);
  const { skip, take, page, pageSize } = parsePagination(request);
  const search = searchParams.get("search")?.trim();
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") || "desc") as Prisma.SortOrder;
  const role = searchParams.get("role");
  const isActive = searchParams.get("isActive");

  const where: Prisma.UserWhereInput = {
    OR: [{ role: "SUPER_ADMIN" }, { role: "ADMIN" }],
  };
  if (search) {
    where.AND = [
      {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { department: { contains: search, mode: "insensitive" } },
        ],
      },
    ];
  }
  if (role) where.role = role as any;
  if (isActive === "true") where.isActive = true;
  if (isActive === "false") where.isActive = false;

  const allowedSortFields = ["name", "email", "role", "createdAt", "lastLoginAt", "department"];
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
        id: true, name: true, email: true, image: true, role: true,
        isActive: true, department: true, designation: true,
        lastLoginAt: true, deletedAt: true, createdAt: true,
        permissions: true,
        _count: { select: { projects: true, tasksAssigned: true, tasksReported: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const adminsWithStats = await (async () => {
    const userIds = users.map((u) => u.id);
    const allProjectMembers = await prisma.projectMember.findMany({
      where: { userId: { in: userIds }, roleInProject: "PROJECT_MANAGER" },
      select: { userId: true, projectId: true },
    });

    const managedProjectsByUser = new Map<string, string[]>();
    for (const pm of allProjectMembers) {
      const list = managedProjectsByUser.get(pm.userId) ?? [];
      list.push(pm.projectId);
      managedProjectsByUser.set(pm.userId, list);
    }

    const allManagedProjectIds = [...new Set(allProjectMembers.map((pm) => pm.projectId))];
    const managedUserCounts = allManagedProjectIds.length > 0
      ? await prisma.projectMember.groupBy({
          by: ["projectId"],
          where: { projectId: { in: allManagedProjectIds }, userId: { notIn: userIds } },
          _count: { userId: true },
        })
      : [];

    const managedUsersByProject = new Map(managedUserCounts.map((g) => [g.projectId, g._count.userId]));

    return users.map((u) => {
      const projectIds = managedProjectsByUser.get(u.id) ?? [];
      const managedUsers = projectIds.reduce((sum, pid) => sum + (managedUsersByProject.get(pid) ?? 0), 0);
      return { ...u, managedProjects: projectIds.length, managedUsers };
    });
  })();

  return NextResponse.json({
    admins: adminsWithStats,
    pagination: paginationMeta(total, { skip, take, page, pageSize }),
  });
}

export async function POST(request: Request) {
  const authz = await requireRole(["SUPER_ADMIN"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const body = await request.json();
  const parsed = adminCreateSchema.safeParse(body);
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

  const [user] = await prisma.$transaction([
    prisma.user.create({
      data: {
        email,
        name: data.name ?? email,
        role: "ADMIN",
        isActive: data.isActive,
        department: data.department ?? null,
        designation: data.designation ?? null,
        permissions: data.permissions ?? defaultAdminPermissions(),
      },
      select: {
        id: true, name: true, email: true, role: true, isActive: true,
        department: true, designation: true, permissions: true, createdAt: true,
      },
    }),
    prisma.auditLog.create({
      data: {
        actorId,
        entityType: "USER",
        entityId: email,
        action: "CREATE_ADMIN",
        details: `Created admin ${email}${data.department ? ` in ${data.department}` : ""}`,
      },
    }),
  ]);

  return NextResponse.json({ message: "Admin created", admin: user }, { status: 201 });
}

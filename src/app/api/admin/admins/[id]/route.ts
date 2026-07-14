import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { z } from "zod";

const adminUpdateSchema = z.object({
  name: z.string().max(200).optional(),
  department: z.string().max(200).nullable().optional(),
  designation: z.string().max(200).nullable().optional(),
  isActive: z.boolean().optional(),
  image: z.string().max(500).nullable().optional(),
  permissions: z.record(z.string(), z.boolean()).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authz = await requireRole(["SUPER_ADMIN"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, image: true, role: true,
      isActive: true, department: true, designation: true,
      lastLoginAt: true, deletedAt: true, createdAt: true, updatedAt: true,
      permissions: true,
      _count: { select: { projects: true, tasksAssigned: true, tasksReported: true } },
    },
  });
  if (!user) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

  const managedProjects = await prisma.projectMember.findMany({
    where: { userId: id, roleInProject: "PROJECT_MANAGER" },
    include: { project: { select: { id: true, name: true, code: true, status: true } } },
  });

  const managedProjectIds = managedProjects.map((mp) => mp.project.id);
  const managedUsers = managedProjectIds.length > 0
    ? await prisma.projectMember.groupBy({
        by: ["userId"],
        where: { projectId: { in: managedProjectIds }, userId: { not: id } },
      })
    : [];

  const [openTasks, completedTasks, recentActivity, recentAuditLogs, notifications] = await Promise.all([
    prisma.task.count({
      where: { projectId: { in: managedProjectIds }, deletedAt: null, NOT: { status: "DONE" } },
    }),
    prisma.task.count({
      where: { projectId: { in: managedProjectIds }, deletedAt: null, status: "DONE" },
    }),
    prisma.activityLog.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.auditLog.findMany({
      where: { actorId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { actor: { select: { name: true, image: true } } },
    }),
    prisma.notification.findMany({
      where: { recipientId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const sprintCount = await prisma.sprint.count({
    where: { projectId: { in: managedProjectIds } },
  });

  const completedSprints = await prisma.sprint.count({
    where: { projectId: { in: managedProjectIds }, status: "COMPLETED" },
  });

  return NextResponse.json({
    admin: {
      ...user,
      managedProjects: managedProjects.map((mp) => mp.project),
      managedUsersCount: managedUsers.length,
      openTasks,
      completedTasks,
      totalSprints: sprintCount,
      completedSprints,
      recentActivity,
      recentAuditLogs,
      notifications,
    },
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authz = await requireRole(["SUPER_ADMIN"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const body = await request.json();
  const parsed = adminUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const actorId = authz.user?.id ?? authz.session?.user?.id;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

  if (actorId === id && data.isActive === false) {
    return NextResponse.json({ error: "You cannot deactivate your own account" }, { status: 400 });
  }

  if (data.isActive === false && target.role === "SUPER_ADMIN") {
    const superAdminCount = await prisma.user.count({ where: { role: "SUPER_ADMIN", deletedAt: null } });
    if (superAdminCount <= 1) {
      return NextResponse.json({ error: "Cannot deactivate the last SUPER_ADMIN" }, { status: 400 });
    }
  }

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.department !== undefined) updateData.department = data.department;
  if (data.designation !== undefined) updateData.designation = data.designation;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.image !== undefined) updateData.image = data.image;
  if (data.permissions !== undefined) updateData.permissions = data.permissions;

  const changedFields = Object.keys(updateData).join(", ");

  const [user] = await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true, name: true, email: true, role: true, isActive: true,
        department: true, designation: true, image: true, permissions: true, updatedAt: true,
      },
    }),
    prisma.auditLog.create({
      data: {
        actorId,
        entityType: "USER",
        entityId: id,
        action: "UPDATE_ADMIN",
        details: `Updated admin ${target.email}: ${changedFields}`,
      },
    }),
  ]);

  return NextResponse.json({ admin: user });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authz = await requireRole(["SUPER_ADMIN"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const actorId = authz.user?.id ?? authz.session?.user?.id;

  if (actorId === id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

  if (target.role === "SUPER_ADMIN") {
    const superAdminCount = await prisma.user.count({ where: { role: "SUPER_ADMIN", deletedAt: null } });
    if (superAdminCount <= 1) {
      return NextResponse.json({ error: "Cannot delete the last SUPER_ADMIN" }, { status: 400 });
    }
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    }),
    prisma.auditLog.create({
      data: {
        actorId,
        entityType: "USER",
        entityId: id,
        action: "DELETE_ADMIN",
        details: `Soft-deleted admin ${target.email}`,
      },
    }),
  ]);

  return NextResponse.json({ message: "Admin deleted successfully" });
}

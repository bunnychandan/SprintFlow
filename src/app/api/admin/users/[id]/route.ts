import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { userUpdateSchema } from "@/lib/validations";
import type { Prisma } from "@prisma/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
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
      updatedAt: true,
      _count: { select: { projects: true, tasksAssigned: true, tasksReported: true } },
    },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const [projects, recentActivity, recentAuditLogs, notifications] = await Promise.all([
    prisma.projectMember.findMany({
      where: { userId: id },
      include: { project: { select: { id: true, name: true, code: true, status: true } } },
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

  const sprintParticipation = await prisma.sprint.count({
    where: { tasks: { some: { assigneeId: id } } },
  });

  return NextResponse.json({
    user,
    projects,
    recentActivity,
    recentAuditLogs,
    notifications,
    sprintParticipation,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const body = await request.json();
  const parsed = userUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const actorId = authz.user?.id ?? authz.session?.user?.id;
  const actorRole = authz.user?.role;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (data.role && actorRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Only SUPER_ADMIN can change roles" }, { status: 403 });
  }

  if (data.role && data.role !== target.role) {
    if (target.role === "SUPER_ADMIN") {
      const superAdminCount = await prisma.user.count({ where: { role: "SUPER_ADMIN", deletedAt: null } });
      if (superAdminCount <= 1) {
        return NextResponse.json({ error: "Cannot demote the last SUPER_ADMIN" }, { status: 400 });
      }
    }
  }

  if (actorId === id && data.isActive === false) {
    return NextResponse.json({ error: "You cannot deactivate your own account" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (data.role !== undefined) updateData.role = data.role;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.name !== undefined) updateData.name = data.name;
  if (data.department !== undefined) updateData.department = data.department;
  if (data.designation !== undefined) updateData.designation = data.designation;
  if (data.image !== undefined) updateData.image = data.image;

  const changedFields = Object.keys(updateData).join(", ");

  const [user] = await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true, name: true, email: true, role: true, isActive: true,
        department: true, designation: true, image: true, updatedAt: true,
      },
    }),
    prisma.auditLog.create({
      data: {
        actorId,
        entityType: "USER",
        entityId: id,
        action: "UPDATE_USER",
        details: `Updated user ${target.email}: ${changedFields}`,
      },
    }),
  ]);

  return NextResponse.json({ user });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const actorId = authz.user?.id ?? authz.session?.user?.id;

  if (actorId === id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

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
        action: "DELETE_USER",
        details: `Soft-deleted user ${target.email}`,
      },
    }),
  ]);

  return NextResponse.json({ message: "User deleted successfully" });
}

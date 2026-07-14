import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { bulkUserActionSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const actorId = authz.user?.id ?? authz.session?.user?.id;
  const actorRole = authz.user?.role;

  const body = await request.json();
  const parsed = bulkUserActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { userIds, action, role } = parsed.data;

  if (userIds.includes(actorId!) && (action === "deactivate" || action === "delete")) {
    return NextResponse.json({ error: "You cannot perform this action on yourself" }, { status: 400 });
  }

  if (action === "updateRole" && actorRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Only SUPER_ADMIN can update roles" }, { status: 403 });
  }

  const targetUsers = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true, role: true },
  });

  if (targetUsers.length !== userIds.length) {
    return NextResponse.json({ error: "One or more users not found" }, { status: 404 });
  }

  if (action === "delete") {
    const superAdminTargets = targetUsers.filter((u) => u.role === "SUPER_ADMIN");
    if (superAdminTargets.length > 0) {
      const remaining = await prisma.user.count({
        where: { role: "SUPER_ADMIN", deletedAt: null, id: { notIn: userIds } },
      });
      if (remaining < 1) {
        return NextResponse.json({ error: "Cannot delete the last SUPER_ADMIN" }, { status: 400 });
      }
    }
  }

  let updatedCount = 0;

  if (action === "activate") {
    const result = await prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { isActive: true, deletedAt: null },
    });
    updatedCount = result.count;
  } else if (action === "deactivate") {
    const result = await prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { isActive: false },
    });
    updatedCount = result.count;
  } else if (action === "delete") {
    const result = await prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { deletedAt: new Date(), isActive: false },
    });
    updatedCount = result.count;
  } else if (action === "restore") {
    const result = await prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { deletedAt: null, isActive: true },
    });
    updatedCount = result.count;
  } else if (action === "updateRole" && role) {
    const result = await prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { role: role as any },
    });
    updatedCount = result.count;
  }

  await prisma.auditLog.create({
    data: {
      actorId,
      entityType: "USER",
      entityId: userIds.join(","),
      action: `BULK_${action.toUpperCase()}`,
      details: `Bulk ${action} on ${updatedCount} user(s)${role ? ` to role ${role}` : ""}`,
    },
  });

  return NextResponse.json({ message: `Bulk ${action} completed`, updatedCount });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { z } from "zod";

const bulkAdminActionSchema = z.object({
  adminIds: z.array(z.string().min(1)).min(1, "At least one admin ID is required"),
  action: z.enum(["activate", "deactivate", "delete", "restore", "updatePermissions"]),
  permissions: z.record(z.string(), z.boolean()).optional(),
});

export async function POST(request: Request) {
  const authz = await requireRole(["SUPER_ADMIN"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const actorId = authz.user?.id ?? authz.session?.user?.id;

  const body = await request.json();
  const parsed = bulkAdminActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { adminIds, action, permissions } = parsed.data;

  if (adminIds.includes(actorId!) && (action === "deactivate" || action === "delete")) {
    return NextResponse.json({ error: "You cannot perform this action on yourself" }, { status: 400 });
  }

  const targetUsers = await prisma.user.findMany({
    where: { id: { in: adminIds } },
    select: { id: true, email: true, role: true },
  });

  if (targetUsers.length !== adminIds.length) {
    return NextResponse.json({ error: "One or more admins not found" }, { status: 404 });
  }

  if (action === "delete") {
    const superAdminTargets = targetUsers.filter((u) => u.role === "SUPER_ADMIN");
    if (superAdminTargets.length > 0) {
      const remaining = await prisma.user.count({
        where: { role: "SUPER_ADMIN", deletedAt: null, id: { notIn: adminIds } },
      });
      if (remaining < 1) {
        return NextResponse.json({ error: "Cannot delete the last SUPER_ADMIN" }, { status: 400 });
      }
    }
  }

  let updatedCount = 0;

  if (action === "activate") {
    const result = await prisma.user.updateMany({
      where: { id: { in: adminIds } },
      data: { isActive: true, deletedAt: null },
    });
    updatedCount = result.count;
  } else if (action === "deactivate") {
    const result = await prisma.user.updateMany({
      where: { id: { in: adminIds } },
      data: { isActive: false },
    });
    updatedCount = result.count;
  } else if (action === "delete") {
    const result = await prisma.user.updateMany({
      where: { id: { in: adminIds } },
      data: { deletedAt: new Date(), isActive: false },
    });
    updatedCount = result.count;
  } else if (action === "restore") {
    const result = await prisma.user.updateMany({
      where: { id: { in: adminIds } },
      data: { deletedAt: null, isActive: true },
    });
    updatedCount = result.count;
  } else if (action === "updatePermissions" && permissions) {
    const results = await Promise.all(
      adminIds.map((adminId) =>
        prisma.user.update({
          where: { id: adminId },
          data: { permissions },
          select: { id: true },
        })
      ),
    );
    updatedCount = results.length;
  }

  await prisma.auditLog.create({
    data: {
      actorId,
      entityType: "USER",
      entityId: adminIds.join(","),
      action: `BULK_ADMIN_${action.toUpperCase()}`,
      details: `Bulk ${action} on ${updatedCount} admin(s)`,
    },
  });

  return NextResponse.json({ message: `Bulk ${action} completed`, updatedCount });
}

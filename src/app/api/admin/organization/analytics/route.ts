import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/authz";
import { getOrCreateOrganization } from "@/lib/org";

export async function GET() {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

  const org = await getOrCreateOrganization();

  const [
    totalUsers, activeUsers, totalAdmins, totalProjects, totalInvitations,
    totalAuditEvents, totalHolidays, totalFeatureFlags,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: { in: ["SUPER_ADMIN", "ADMIN"] }, isActive: true } }),
    prisma.project.count({ where: { deletedAt: null } }),
    prisma.invitation.count(),
    prisma.auditLog.count(),
    prisma.holiday.count({ where: { organizationId: org.id } }),
    prisma.featureFlag.count({ where: { organizationId: org.id } }),
  ]);

  const orgAge = Math.floor((Date.now() - org.createdAt.getTime()) / 86400000);

  return NextResponse.json({
    totalUsers,
    activeUsers,
    totalAdmins,
    totalProjects,
    totalInvitations,
    totalAuditEvents,
    totalHolidays,
    totalFeatureFlags,
    orgAgeDays: orgAge,
    orgCreatedAt: org.createdAt,
    storageUsed: null,
    storageLimit: null,
  });
}

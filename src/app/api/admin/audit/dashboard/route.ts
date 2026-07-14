import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/authz";

export async function GET() {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const [
    totalEvents,
    eventsToday,
    eventsThisWeek,
    failedOperations,
    activeAdmins,
    mostActiveUsers,
    mostCommonActions,
    topModifiedEntities,
  ] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.auditLog.count({ where: { createdAt: { gte: startOfWeek } } }),
    prisma.auditLog.count({ where: { success: false } }),
    prisma.user.count({ where: { role: { in: ["SUPER_ADMIN", "ADMIN"] }, isActive: true } }),
    prisma.auditLog.groupBy({
      by: ["actorId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }).then(async (groups) => {
      const userIds = groups.map((g) => g.actorId).filter(Boolean) as string[];
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
      });
      const userMap = new Map(users.map((u) => [u.id, u]));
      return groups
        .filter((g) => g.actorId && userMap.has(g.actorId))
        .map((g) => ({
          id: g.actorId!,
          name: userMap.get(g.actorId!)?.name ?? null,
          email: userMap.get(g.actorId!)?.email ?? "",
          count: g._count.id,
        }));
    }),
    prisma.auditLog.groupBy({
      by: ["action"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }).then((groups) => groups.map((g) => ({ action: g.action, count: g._count.id }))),
    prisma.auditLog.groupBy({
      by: ["entityType"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }).then((groups) => groups.map((g) => ({ entityType: g.entityType, count: g._count.id }))),
  ]);

  return NextResponse.json({
    totalEvents,
    eventsToday,
    eventsThisWeek,
    failedOperations,
    activeAdmins,
    mostActiveUsers,
    mostCommonActions,
    topModifiedEntities,
  });
}

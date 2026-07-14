import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "24h";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "50");

  let dateFrom: Date;
  switch (period) {
    case "7d": dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); break;
    case "30d": dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); break;
    default: dateFrom = new Date(Date.now() - 24 * 60 * 60 * 1000); break;
  }

  const [snapshots, total] = await Promise.all([
    prisma.systemHealthSnapshot.findMany({
      where: { timestamp: { gte: dateFrom } },
      orderBy: { timestamp: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.systemHealthSnapshot.count({
      where: { timestamp: { gte: dateFrom } },
    }),
  ]);

  return NextResponse.json({
    snapshots: snapshots.map((s) => ({
      id: s.id,
      timestamp: s.timestamp.toISOString(),
      overallStatus: s.overallStatus,
      databaseStatus: s.databaseStatus,
      apiStatus: s.apiStatus,
      appUptime: s.appUptime,
      memoryUsageMB: s.memoryUsageMB,
      avgApiResponseMs: s.avgApiResponseMs,
      errorCount: s.errorCount,
      totalRequests: s.totalRequests,
      successRate: s.successRate,
    })),
    total,
  });
}

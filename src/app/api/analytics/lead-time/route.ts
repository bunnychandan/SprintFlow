import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) return NextResponse.json({ error: "projectId is required" }, { status: 400 });

  const authz = await requireProjectAccess(projectId);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const doneTasks = await prisma.task.findMany({
    where: { projectId, deletedAt: null, status: "DONE" },
    select: { createdAt: true, updatedAt: true, storyPoints: true },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  const leadTimes = doneTasks
    .map((t) => Math.max(0, Math.ceil((t.updatedAt.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60 * 24))))
    .filter((d) => d > 0);

  const avg = leadTimes.length > 0 ? Math.round(leadTimes.reduce((s, v) => s + v, 0) / leadTimes.length) : 0;
  const sorted = [...leadTimes].sort((a, b) => a - b);
  const median = sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : 0;
  const p95 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.95)] : 0;

  const maxVal = Math.max(...leadTimes, 1);
  const bucketSize = Math.max(1, Math.ceil(maxVal / 10));
  const distribution: Array<{ label: string; value: number }> = [];
  for (let i = 0; i < maxVal; i += bucketSize) {
    const start = i;
    const end = i + bucketSize - 1;
    const count = leadTimes.filter((d) => d >= start && d <= end).length;
    distribution.push({ label: end === maxVal - 1 ? `>${start}d` : `${start}-${end}d`, value: count });
  }

  return NextResponse.json({ average: avg, median, p95, distribution });
}

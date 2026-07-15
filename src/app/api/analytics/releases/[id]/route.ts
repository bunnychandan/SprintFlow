import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const release = await prisma.release.findUnique({ where: { id } });
  if (!release || release.archivedAt) return NextResponse.json({ error: "Release not found" }, { status: 404 });

  const authz = await requireProjectAccess(release.projectId);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const tasks = await prisma.task.findMany({
    where: { releaseId: id, deletedAt: null },
    select: { status: true, storyPoints: true, dueDate: true },
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const blockedTasks = tasks.filter((t) => t.status === "BLOCKED").length;
  const totalPoints = tasks.reduce((s, t) => s + (t.storyPoints ?? 0), 0);
  const completedPoints = tasks.filter((t) => t.status === "DONE").reduce((s, t) => s + (t.storyPoints ?? 0), 0);
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const taskDistribution = Object.entries(
    tasks.reduce<Record<string, number>>((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {})
  ).map(([status, count]) => ({ status, count }));

  const daysUntilTarget = release.targetDate ? Math.max(0, Math.ceil((new Date(release.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;

  const kpis = [
    { label: "Total Tasks", value: totalTasks, color: "text-blue-500" },
    { label: "Completed", value: completedTasks, color: "text-emerald-500" },
    { label: "Blocked", value: blockedTasks, color: "text-red-500" },
    { label: "Completion", value: `${completionPct}%`, color: "text-violet-500" },
    { label: "Total Points", value: totalPoints, color: "text-indigo-500" },
    { label: "Points Done", value: completedPoints, color: "text-emerald-500" },
    { label: "Days to Target", value: daysUntilTarget ?? "-", color: "text-cyan-500" },
  ];

  return NextResponse.json({
    releaseId: id,
    releaseName: release.name,
    version: release.version,
    kpis,
    taskDistribution,
    completionPct,
    totalPoints,
    completedPoints,
    daysUntilTarget,
  });
}

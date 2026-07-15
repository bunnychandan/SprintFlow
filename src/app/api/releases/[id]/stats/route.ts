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
    take: 500,
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const blockedTasks = tasks.filter((t) => t.status === "BLOCKED").length;
  const overdueTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE").length;
  const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
  const completedPoints = tasks.filter((t) => t.status === "DONE").reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);

  const byStatus = tasks.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    totalTasks,
    completedTasks,
    blockedTasks,
    overdueTasks,
    totalPoints,
    completedPoints,
    completionPct: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
  });
}

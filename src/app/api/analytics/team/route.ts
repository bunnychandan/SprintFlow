import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function GET(request: Request) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const taskWhere: Record<string, unknown> = { deletedAt: null };
  if (projectId) taskWhere.projectId = projectId;
  if (from || to) {
    taskWhere.createdAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  const tasks = await prisma.task.findMany({
    where: taskWhere as any,
    select: { status: true, storyPoints: true, assigneeId: true, assignee: { select: { id: true, name: true, email: true, image: true } } },
    take: 500,
  });

  const userMap = new Map<string, { userId: string; name: string | null; email: string; image: string | null; completedTasks: number; completedPoints: number; avgCycleTime: number; tasksInProgress: number; velocityTrend: number[] }>();

  for (const t of tasks) {
    if (!t.assigneeId) continue;
    const existing = userMap.get(t.assigneeId) || {
      userId: t.assigneeId,
      name: t.assignee?.name || null,
      email: t.assignee?.email || "",
      image: t.assignee?.image || null,
      completedTasks: 0,
      completedPoints: 0,
      avgCycleTime: 0,
      tasksInProgress: 0,
      velocityTrend: [],
    };
    if (t.status === "DONE") {
      existing.completedTasks++;
      existing.completedPoints += t.storyPoints ?? 0;
    }
    if (t.status === "IN_PROGRESS") existing.tasksInProgress++;
    userMap.set(t.assigneeId, existing);
  }

  return NextResponse.json(Array.from(userMap.values()));
}

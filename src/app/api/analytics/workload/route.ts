import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function GET(request: Request) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  const taskWhere: Record<string, unknown> = { deletedAt: null };
  if (projectId) taskWhere.projectId = projectId;

  const tasks = await prisma.task.findMany({
    where: taskWhere as any,
    select: { status: true, storyPoints: true, assigneeId: true, dueDate: true, assignee: { select: { id: true, name: true, email: true, image: true } } },
    take: 500,
  });

  const userMap = new Map<string, { userId: string; name: string | null; email: string; image: string | null; taskCount: number; storyPoints: number; completedCount: number; inProgressCount: number; overdueCount: number; capacity: number }>();

  for (const t of tasks) {
    if (!t.assigneeId) continue;
    const existing = userMap.get(t.assigneeId) || {
      userId: t.assigneeId,
      name: t.assignee?.name || null,
      email: t.assignee?.email || "",
      image: t.assignee?.image || null,
      taskCount: 0,
      storyPoints: 0,
      completedCount: 0,
      inProgressCount: 0,
      overdueCount: 0,
      capacity: 40,
    };
    existing.taskCount++;
    existing.storyPoints += t.storyPoints ?? 0;
    if (t.status === "DONE") existing.completedCount++;
    if (t.status === "IN_PROGRESS") existing.inProgressCount++;
    if (t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE" && t.status !== "CANCELLED") existing.overdueCount++;
    userMap.set(t.assigneeId, existing);
  }

  return NextResponse.json({ data: Array.from(userMap.values()) });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess, requireRole } from "@/lib/authz";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (projectId) {
    const authz = await requireProjectAccess(projectId);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });
  } else {
    const authz = await requireRole(["SUPER_ADMIN", "ADMIN"]);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });
  }

  const where: Record<string, unknown> = { deletedAt: null };
  if (projectId) where.projectId = projectId;

  const tasks = await prisma.task.findMany({
    where: where as any,
    select: { status: true, createdAt: true, projectId: true },
    orderBy: { createdAt: "asc" },
    take: 500,
  });

  const dateMap = new Map<string, { todo: number; inProgress: number; inReview: number; done: number; blocked: number; backlog: number }>();

  for (const t of tasks) {
    const dateKey = t.createdAt.toISOString().split("T")[0];
    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, { todo: 0, inProgress: 0, inReview: 0, done: 0, blocked: 0, backlog: 0 });
    }
    const entry = dateMap.get(dateKey)!;
    if (t.status === "BACKLOG" || t.status === "TODO") entry.todo++;
    else if (t.status === "IN_PROGRESS") entry.inProgress++;
    else if (t.status === "IN_REVIEW" || t.status === "QA_TESTING") entry.inReview++;
    else if (t.status === "DONE") entry.done++;
    else if (t.status === "BLOCKED") entry.blocked++;
    else if (t.status === "REOPENED") entry.todo++;
  }

  const data = Array.from(dateMap.entries()).slice(-30).map(([date, counts]) => ({ date, ...counts }));

  return NextResponse.json({ data });
}

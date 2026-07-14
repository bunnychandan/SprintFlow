import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, requireProjectAccess } from "@/lib/authz";

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

  const where: Record<string, unknown> = { status: "COMPLETED", deletedAt: null };
  if (projectId) where.projectId = projectId;

  const sprints = await prisma.sprint.findMany({
    where: where as any,
    orderBy: { endDate: "desc" },
    take: 12,
    include: { tasks: { where: { deletedAt: null }, select: { storyPoints: true, status: true } } },
  });

  const data = sprints.reverse().map((s) => {
    const committed = s.tasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
    const completed = s.tasks.filter((t) => t.status === "DONE").reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
    return { sprint: s.name, sprintId: s.id, completedPoints: completed, committedPoints: committed, completionPct: committed > 0 ? Math.round((completed / committed) * 100) : 0 };
  });

  return NextResponse.json(data);
}

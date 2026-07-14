import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const epic = await prisma.epic.findFirst({ where: { id, archivedAt: null } });
  if (!epic) return NextResponse.json({ error: "Epic not found" }, { status: 404 });

  const authz = await requireProjectAccess(epic.projectId);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const [tasks, history] = await Promise.all([
    prisma.task.findMany({
      where: { epicId: id, deletedAt: null },
      select: { id: true, title: true, status: true, priority: true, storyPoints: true, dueDate: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.auditLog.findMany({
      where: { entityType: "EPIC", entityId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { actor: { select: { id: true, name: true, image: true } } },
    }),
  ]);

  const events = [
    {
      date: epic.createdAt.toISOString(),
      type: "created" as const,
      title: "Epic created",
      description: `Epic "${epic.title}" was created`,
    },
    ...history.map((h) => ({
      date: h.createdAt.toISOString(),
      type: "activity" as const,
      title: h.action.replace(/_/g, " "),
      description: h.details,
      user: h.actor,
    })),
    ...tasks.map((t) => ({
      date: t.createdAt.toISOString(),
      type: "task" as const,
      title: `Task added: ${t.title}`,
      description: `${t.status} - ${t.storyPoints ?? 0} SP`,
      taskId: t.id,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json({ events, epic: { startDate: epic.startDate?.toISOString() ?? null, targetDate: epic.targetDate?.toISOString() ?? null } });
}

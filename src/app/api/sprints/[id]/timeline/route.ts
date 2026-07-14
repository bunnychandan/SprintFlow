import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const sprint = await prisma.sprint.findUnique({ where: { id } });
  if (!sprint) return NextResponse.json({ error: "Sprint not found" }, { status: 404 });

  const authz = await requireProjectAccess(sprint.projectId);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const auditLogs = await prisma.auditLog.findMany({
    where: { entityType: "SPRINT", entityId: id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: { select: { name: true, image: true } } },
  });

  const taskActivityLogs = await prisma.auditLog.findMany({
    where: { entityType: "TASK", metadata: { path: ["sprintId"], equals: id } },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: { select: { name: true, image: true } } },
  });

  const events = [
    ...auditLogs.map((log) => ({
      id: log.id,
      date: log.createdAt.toISOString(),
      action: log.action,
      description: log.details || log.action,
      user: log.actor,
      type: getEventType(log.action),
    })),
    ...taskActivityLogs.map((log) => ({
      id: log.id,
      date: log.createdAt.toISOString(),
      action: log.action,
      description: log.details || log.action,
      user: log.actor,
      type: "task_added" as const,
    })),
  ];

  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json(events);
}

function getEventType(action: string): "created" | "started" | "completed" | "cancelled" | "task_added" | "task_removed" | "points_updated" | "updated" {
  if (action.includes("CREATE_SPRINT")) return "created";
  if (action.includes("START_SPRINT")) return "started";
  if (action.includes("COMPLETE_SPRINT")) return "completed";
  if (action.includes("CANCEL_SPRINT")) return "cancelled";
  if (action.includes("CREATE_TASK")) return "task_added";
  if (action.includes("REMOVE_TASK") || action.includes("DELETE_TASK")) return "task_removed";
  if (action.includes("STORY_POINTS") || action.includes("UPDATE_TASK")) return "points_updated";
  return "updated";
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authz = await requireProjectAccess(id);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const project = await prisma.project.findFirst({ where: { id, deletedAt: null } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const [auditLogs, activityLogs] = await Promise.all([
    prisma.auditLog.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { actor: { select: { name: true, image: true } } },
    }),
    prisma.activityLog.findMany({
      where: { entityType: "PROJECT", entityId: id },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { name: true, image: true } } },
    }),
  ]);

  const events = [
    ...auditLogs.map((log) => ({
      id: log.id,
      date: log.createdAt.toISOString(),
      action: log.action,
      description: log.details || log.action,
      user: log.actor,
      type: getEventType(log.action),
    })),
    ...activityLogs.map((log) => ({
      id: log.id,
      date: log.createdAt.toISOString(),
      action: log.action,
      description: log.action,
      user: log.user,
      type: "updated" as const,
    })),
  ];

  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json(events);
}

function getEventType(action: string): "created" | "updated" | "archived" | "milestone" | "sprint" | "task" | "member" {
  if (action.includes("CREATE")) return "created";
  if (action.includes("ARCHIVE")) return "archived";
  if (action.includes("SPRINT")) return "sprint";
  if (action.includes("TASK") || action.includes("COMMENT")) return "task";
  if (action.includes("MEMBER") || action.includes("ADD") || action.includes("REMOVE")) return "member";
  if (action.includes("RESTORE") || action.includes("DELETE")) return "updated";
  return "updated";
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function GET(request: Request) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER", "SCRUM_MASTER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const actorId = authz.user?.id ?? authz.session?.user?.id;

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "json";
  const type = searchParams.get("type") || "dashboard";
  const entityId = searchParams.get("entityId");

  let data: Record<string, unknown> = {};

  if (type === "dashboard") {
    const [projects, tasks] = await Promise.all([
      prisma.project.count({ where: { deletedAt: null } }),
      prisma.task.count({ where: { deletedAt: null } }),
    ]);
    data = { totalProjects: projects, totalTasks: tasks, exportedAt: new Date().toISOString() };
  } else if (type === "project" && entityId) {
    const tasks = await prisma.task.findMany({ where: { projectId: entityId, deletedAt: null }, select: { title: true, status: true, priority: true, type: true, storyPoints: true, createdAt: true } });
    data = { projectId: entityId, tasks, exportedAt: new Date().toISOString() };
  } else if (type === "sprint" && entityId) {
    const tasks = await prisma.task.findMany({ where: { sprintId: entityId, deletedAt: null }, select: { title: true, status: true, storyPoints: true, createdAt: true } });
    data = { sprintId: entityId, tasks, exportedAt: new Date().toISOString() };
  } else if (type === "velocity") {
    const sprints = await prisma.sprint.findMany({ where: { status: "COMPLETED", deletedAt: null }, orderBy: { endDate: "desc" }, take: 12, include: { tasks: { where: { deletedAt: null }, select: { storyPoints: true, status: true } } } });
    data = { velocity: sprints.map((s) => ({ name: s.name, committed: s.tasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0), completed: s.tasks.filter((t) => t.status === "DONE").reduce((sum, t) => sum + (t.storyPoints ?? 0), 0) })), exportedAt: new Date().toISOString() };
  } else {
    data = { message: "Export type not supported", type, exportedAt: new Date().toISOString() };
  }

  if (actorId) {
    await prisma.auditLog.create({
      data: { actorId, entityType: "ANALYTICS", entityId: entityId || "all", action: `EXPORT_${type.toUpperCase()}`, details: `Exported ${type} analytics as ${format}`, success: true },
    });
  }

  if (format === "csv") {
    const headers = Object.keys(data).join(",");
    const values = Object.values(data).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
    return new NextResponse(`${headers}\n${values}`, {
      headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="${type}-analytics.csv"` },
    });
  }

  return NextResponse.json(data);
}

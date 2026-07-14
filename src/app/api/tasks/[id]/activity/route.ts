import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";
import { parsePagination, paginationMeta } from "@/lib/api-utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const task = await prisma.task.findFirst({ where: { id, deletedAt: null }, select: { id: true, projectId: true } });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const authz = await requireProjectAccess(task.projectId);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const { skip, take, page, pageSize } = parsePagination(request);

  const [comments, history, workLogs, totalComments, totalHistory, totalWorkLogs] = await Promise.all([
    prisma.comment.findMany({
      where: { taskId: id },
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, name: true, email: true, image: true } } },
    }),
    prisma.taskHistory.findMany({
      where: { taskId: id },
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, image: true } } },
    }),
    prisma.workLog.findMany({
      where: { taskId: id },
      skip,
      take,
      orderBy: { loggedAt: "desc" },
      include: { user: { select: { id: true, name: true, image: true } } },
    }),
    prisma.comment.count({ where: { taskId: id } }),
    prisma.taskHistory.count({ where: { taskId: id } }),
    prisma.workLog.count({ where: { taskId: id } }),
  ]);

  const activity = [
    ...history.map((h: any) => ({ ...h, type: "history" as const })),
    ...comments.map((c: any) => ({ ...c, field: null, type: "comment" as const })),
    ...workLogs.map((w: any) => ({ ...w, field: null, type: "worklog" as const })),
  ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalItems = totalComments + totalHistory + totalWorkLogs;

  return NextResponse.json({ activity, pagination: paginationMeta(totalItems, { skip, take, page, pageSize }) });
}

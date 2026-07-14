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

  const [history, total] = await Promise.all([
    prisma.taskHistory.findMany({
      where: { taskId: id },
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, image: true } } },
    }),
    prisma.taskHistory.count({ where: { taskId: id } }),
  ]);

  return NextResponse.json({ history, pagination: paginationMeta(total, { skip, take, page, pageSize }) });
}

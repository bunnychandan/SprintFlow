import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";
import { parsePagination, paginationMeta } from "@/lib/api-utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;

  const authz = await requireProjectAccess(projectId);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const { skip, take, page, pageSize } = parsePagination(request);
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const epicId = searchParams.get("epicId");

  const where: Record<string, unknown> = {
    projectId,
    deletedAt: null,
    backlogOrder: { not: null },
    sprintId: null,
  };

  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (epicId) where.epicId = epicId;

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where: where as any,
      skip,
      take,
      orderBy: { backlogOrder: "asc" },
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        epic: { select: { id: true, title: true, color: true } },
        release: { select: { id: true, name: true, version: true } },
        _count: { select: { comments: true, attachments: true } },
      },
    }),
    prisma.task.count({ where: where as any }),
  ]);

  return NextResponse.json({ tasks, pagination: paginationMeta(total, { skip, take, page, pageSize }) });
}

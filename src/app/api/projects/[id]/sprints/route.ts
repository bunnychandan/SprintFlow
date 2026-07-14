import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";
import { parsePagination, paginationMeta } from "@/lib/api-utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authz = await requireProjectAccess(id);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const { skip, take, page, pageSize } = parsePagination(request);
  const where = { projectId: id };

  const [sprints, total] = await Promise.all([
    prisma.sprint.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
    prisma.sprint.count({ where }),
  ]);

  return NextResponse.json({ sprints, pagination: paginationMeta(total, { skip, take, page, pageSize }) });
}

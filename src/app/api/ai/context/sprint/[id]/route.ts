import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
  if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

  const { id } = await params;
  const sprint = await prisma.sprint.findFirst({
    where: { id },
    select: { id: true, name: true, goal: true, status: true, startDate: true, endDate: true, project: { select: { name: true, code: true } }, _count: { select: { tasks: true } } },
  });

  if (!sprint) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ sprint: { ...sprint, startDate: sprint.startDate?.toISOString() || null, endDate: sprint.endDate?.toISOString() || null } });
}

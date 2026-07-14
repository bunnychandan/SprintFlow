import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authz = await requireAdmin();
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const { id } = await params;

  const user = await prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true, email: true, name: true, image: true, role: true,
      department: true, designation: true, isActive: true,
      allocations: {
        select: { id: true, projectId: true, allocation: true, role: true, startDate: true, endDate: true, notes: true, project: { select: { name: true, code: true } } },
      },
    },
  });

  if (!user) return NextResponse.json({ error: "Resource not found" }, { status: 404 });

  return NextResponse.json({
    ...user,
    totalAllocation: user.allocations.reduce((sum, a) => sum + a.allocation, 0),
    allocations: user.allocations.map((a) => ({
      id: a.id,
      userId: user.id,
      projectId: a.projectId,
      projectName: a.project.name,
      projectCode: a.project.code,
      allocation: a.allocation,
      role: a.role,
      startDate: a.startDate.toISOString(),
      endDate: a.endDate?.toISOString() || null,
      notes: a.notes,
    })),
  });
}

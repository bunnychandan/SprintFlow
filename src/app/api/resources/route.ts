import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function GET(request: Request) {
  const authz = await requireAdmin();
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const department = searchParams.get("department");
  const role = searchParams.get("role");
  const isActive = searchParams.get("isActive");
  const projectId = searchParams.get("projectId");

  const where: Record<string, unknown> = { deletedAt: null };
  if (search) where.OR = [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }];
  if (department) where.department = department;
  if (role) where.role = role;
  if (isActive !== null) where.isActive = isActive === "true";

  const users = await prisma.user.findMany({
    where: where as any,
    select: {
      id: true, email: true, name: true, image: true, role: true,
      department: true, designation: true, isActive: true,
      allocations: {
        select: { id: true, projectId: true, allocation: true, role: true, startDate: true, endDate: true, notes: true, project: { select: { name: true, code: true } } },
      },
    },
    orderBy: { name: "asc" },
    take: 200,
  });

  const resources = users.map((u) => ({
    ...u,
    totalAllocation: u.allocations.reduce((sum, a) => sum + a.allocation, 0),
    allocations: u.allocations.map((a) => ({
      id: a.id,
      userId: u.id,
      projectId: a.projectId,
      projectName: a.project.name,
      projectCode: a.project.code,
      allocation: a.allocation,
      role: a.role,
      startDate: a.startDate.toISOString(),
      endDate: a.endDate?.toISOString() || null,
      notes: a.notes,
    })),
  }));

  if (projectId) {
    return NextResponse.json(resources.filter((r) => r.allocations.some((a) => a.projectId === projectId)));
  }

  return NextResponse.json(resources);
}

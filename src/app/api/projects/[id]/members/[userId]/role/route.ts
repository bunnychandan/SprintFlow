import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";
import { z } from "zod";

const roleSchema = z.object({
  role: z.enum(["PROJECT_MANAGER", "SCRUM_MASTER", "DEVELOPER", "TESTER", "BUSINESS_ANALYST", "VIEWER"]),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id, userId } = await params;
  const authz = await requireProjectAccess(id, ["PROJECT_MANAGER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const actorId = authz.user?.id ?? authz.session?.user?.id;
  if (!actorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (userId === actorId) {
    return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = roleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: id, userId } },
  });
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const updated = await prisma.projectMember.update({
    where: { projectId_userId: { projectId: id, userId } },
    data: { roleInProject: parsed.data.role },
    include: { user: { select: { id: true, name: true, email: true, image: true, role: true } } },
  });

  await prisma.auditLog.create({
    data: { actorId, entityType: "PROJECT", entityId: id, action: "UPDATE_MEMBER_ROLE", details: `Changed role of user ${updated.user.name || updated.user.email} to ${parsed.data.role}` },
  });

  return NextResponse.json({ member: updated });
}

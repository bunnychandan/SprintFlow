import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";
import { memberAddSchema } from "@/lib/validations";
import { ProjectRole } from "@prisma/client";
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

  const [members, total] = await Promise.all([
    prisma.projectMember.findMany({
      where,
      skip,
      take,
      include: { user: { select: { id: true, name: true, email: true, image: true, role: true, department: true, designation: true } } },
    }),
    prisma.projectMember.count({ where }),
  ]);

  return NextResponse.json({ members, pagination: paginationMeta(total, { skip, take, page, pageSize }) });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authz = await requireProjectAccess(id, ["PROJECT_MANAGER", "SCRUM_MASTER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const body = await request.json();
  const parsed = memberAddSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const projectRole = parsed.data.role as ProjectRole;
  const actorId = authz.user?.id ?? authz.session?.user?.id;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "No user found with this email. Create the user first in Admin Console." }, { status: 404 });
  }

  const member = await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: id, userId: user.id } },
    update: { roleInProject: projectRole },
    create: { projectId: id, userId: user.id, roleInProject: projectRole },
  });

  await prisma.auditLog.create({
    data: { actorId, entityType: "PROJECT", entityId: id, action: "ADD_MEMBER", details: `Added user ${email} to project with role ${projectRole}` },
  });

  const project = await prisma.project.findUnique({ where: { id }, select: { name: true } });

  await prisma.notification.create({
    data: {
      recipientId: user.id,
      actorId,
      projectId: id,
      type: "USER_JOINED",
      title: "Added to Project",
      message: `You have been added to project "${project?.name || id}" with role ${projectRole}.`,
      channel: "IN_APP",
    },
  });

  return NextResponse.json({ member, user }, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authz = await requireProjectAccess(id, ["PROJECT_MANAGER", "SCRUM_MASTER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

  const actorId = authz.user?.id ?? authz.session?.user?.id;

  const removedMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: id, userId } },
    include: { user: { select: { name: true } } },
  });

  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId: id, userId } },
  });

  await prisma.auditLog.create({
    data: { actorId, entityType: "PROJECT", entityId: id, action: "REMOVE_MEMBER", details: `Removed user ID ${userId} from project` },
  });

  if (removedMember && userId !== actorId) {
    const project = await prisma.project.findUnique({ where: { id }, select: { name: true } });
    await prisma.notification.create({
      data: {
        recipientId: userId,
        actorId,
        projectId: id,
        type: "PROJECT_UPDATED",
        title: "Removed from Project",
        message: `You have been removed from project "${project?.name || id}".`,
        channel: "IN_APP",
      },
    });
  }

  return NextResponse.json({ message: "Member removed successfully" });
}

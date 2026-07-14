import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";
import { sprintStartSchema } from "@/lib/validations";
import { notifySprintMembers } from "@/lib/sprint/notifications";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const sprint = await prisma.sprint.findFirst({ where: { id, deletedAt: null } });
  if (!sprint) return NextResponse.json({ error: "Sprint not found" }, { status: 404 });

  if (sprint.status === "COMPLETED" || sprint.status === "CANCELLED") {
    return NextResponse.json({ error: `Cannot start a ${sprint.status.toLowerCase()} sprint` }, { status: 400 });
  }

  if (sprint.status === "ACTIVE") {
    return NextResponse.json({ error: "Sprint is already active" }, { status: 400 });
  }

  const authz = await requireProjectAccess(sprint.projectId, ["PROJECT_MANAGER", "SCRUM_MASTER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const actorId = authz.user?.id ?? authz.session?.user?.id;
  if (!actorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = sprintStartSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { goal, startDate, endDate } = parsed.data;

  const { updated } = await prisma.$transaction(async (tx) => {
    const existingActive = await tx.sprint.findFirst({
      where: { projectId: sprint.projectId, status: "ACTIVE", deletedAt: null, id: { not: id } },
    });
    if (existingActive) {
      throw new Error(`Another active sprint "${existingActive.name}" already exists in this project. Complete or cancel it first.`);
    }

    const updated = await tx.sprint.update({
      where: { id },
      data: {
        status: "ACTIVE",
        goal: goal ?? sprint.goal,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        updatedById: actorId,
      },
    });

    await tx.auditLog.create({
      data: { actorId, entityType: "SPRINT", entityId: id, action: "START_SPRINT", details: `Started sprint ${sprint.name}` },
    });

    return { updated };
  });

  await notifySprintMembers({
    projectId: sprint.projectId,
    sprintId: id,
    actorId,
    type: "SPRINT_STARTED",
    title: "Sprint Started",
    message: `Sprint "${sprint.name}" has started.`,
    excludeActor: true,
  });

  return NextResponse.json({ sprint: updated });
}

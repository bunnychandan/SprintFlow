import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";
import { sprintCancelSchema } from "@/lib/validations";
import { notifySprintMembers } from "@/lib/sprint/notifications";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const sprint = await prisma.sprint.findFirst({ where: { id, deletedAt: null } });
  if (!sprint) return NextResponse.json({ error: "Sprint not found" }, { status: 404 });

  if (sprint.status === "COMPLETED" || sprint.status === "CANCELLED") {
    return NextResponse.json({ error: `Cannot cancel a ${sprint.status.toLowerCase()} sprint` }, { status: 400 });
  }

  const authz = await requireProjectAccess(sprint.projectId, ["PROJECT_MANAGER", "SCRUM_MASTER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const actorId = authz.user?.id ?? authz.session?.user?.id;
  if (!actorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = sprintCancelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { updated } = await prisma.$transaction(async (tx) => {
    await tx.task.updateMany({
      where: { sprintId: id, deletedAt: null },
      data: { sprintId: null },
    });

    const updated = await tx.sprint.update({
      where: { id },
      data: { status: "CANCELLED", updatedById: actorId },
    });

    await tx.auditLog.create({
      data: { actorId, entityType: "SPRINT", entityId: id, action: "CANCEL_SPRINT", details: `Cancelled sprint ${sprint.name}${parsed.data.reason ? `: ${parsed.data.reason}` : ""}` },
    });

    return { updated };
  });

  await notifySprintMembers({
    projectId: sprint.projectId,
    sprintId: id,
    actorId,
    type: "SPRINT_COMPLETED",
    title: "Sprint Cancelled",
    message: `Sprint "${sprint.name}" has been cancelled.`,
    excludeActor: true,
  });

  return NextResponse.json({ sprint: updated });
}

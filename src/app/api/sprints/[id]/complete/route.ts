import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";
import { sprintCompleteSchema } from "@/lib/validations";
import { notifySprintMembers } from "@/lib/sprint/notifications";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const sprint = await prisma.sprint.findFirst({ where: { id, deletedAt: null } });
  if (!sprint) return NextResponse.json({ error: "Sprint not found" }, { status: 404 });

  if (sprint.status !== "ACTIVE") {
    return NextResponse.json({ error: "Only active sprints can be completed" }, { status: 400 });
  }

  const authz = await requireProjectAccess(sprint.projectId, ["PROJECT_MANAGER", "SCRUM_MASTER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const actorId = authz.user?.id ?? authz.session?.user?.id;
  if (!actorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = sprintCompleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { forceComplete } = parsed.data;

  let updated: any;

  try {
    const result = await prisma.$transaction(async (tx) => {
      if (!forceComplete) {
        const incompleteMandatory = await tx.task.count({
          where: { sprintId: id, status: { not: "DONE" }, deletedAt: null },
        });
        if (incompleteMandatory > 0) {
          throw new Error(`INCOMPLETE_TASKS:${incompleteMandatory}`);
        }
      }

      await tx.task.updateMany({
        where: { sprintId: id, status: { not: "DONE" }, deletedAt: null },
        data: { sprintId: null },
      });

      const updated = await tx.sprint.update({
        where: { id },
        data: { status: "COMPLETED", updatedById: actorId },
      });

      await tx.auditLog.create({
        data: { actorId, entityType: "SPRINT", entityId: id, action: "COMPLETE_SPRINT", details: forceComplete ? `Force-completed sprint ${sprint.name}` : `Completed sprint ${sprint.name}` },
      });

      return { updated };
    });
    updated = result.updated;
  } catch (error: any) {
    if (error?.message?.startsWith("INCOMPLETE_TASKS:")) {
      const count = parseInt(error.message.split(":")[1], 10);
      return NextResponse.json({
        error: `${count} task(s) are not completed. Use forceComplete to complete anyway.`,
        incompleteTasks: count,
      }, { status: 400 });
    }
    throw error;
  }

  await notifySprintMembers({
    projectId: sprint.projectId,
    sprintId: id,
    actorId,
    type: "SPRINT_COMPLETED",
    title: "Sprint Completed",
    message: `Sprint "${sprint.name}" has been completed.`,
    excludeActor: true,
  });

  return NextResponse.json({ sprint: updated });
}

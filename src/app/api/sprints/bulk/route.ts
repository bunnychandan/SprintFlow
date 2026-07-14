import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { bulkSprintActionSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const actorId = authz.user?.id ?? authz.session?.user?.id;
  if (!actorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = bulkSprintActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { ids, action, forceComplete } = parsed.data;
  let count = 0;

  switch (action) {
    case "complete":
      for (const id of ids) {
        const sprint = await prisma.sprint.findUnique({ where: { id } });
        if (sprint && sprint.status === "ACTIVE") {
          if (!forceComplete) {
            const incomplete = await prisma.task.count({
              where: { sprintId: id, status: { not: "DONE" }, deletedAt: null },
            });
            if (incomplete > 0) continue;
          }
          await prisma.task.updateMany({
            where: { sprintId: id, status: { not: "DONE" }, deletedAt: null },
            data: { sprintId: null },
          });
          await prisma.sprint.update({ where: { id }, data: { status: "COMPLETED", updatedById: actorId } });
          count++;
        }
      }
      break;
    case "cancel":
      const cancelResult = await prisma.sprint.updateMany({
        where: { id: { in: ids }, status: { in: ["PLANNING", "ACTIVE"] } },
        data: { status: "CANCELLED", updatedById: actorId },
      });
      count = cancelResult.count;
      await prisma.task.updateMany({
        where: { sprintId: { in: ids }, deletedAt: null },
        data: { sprintId: null },
      });
      break;
    case "delete":
      const deleteResult = await prisma.sprint.updateMany({
        where: { id: { in: ids }, status: { not: "ACTIVE" } },
        data: { deletedAt: new Date(), updatedById: actorId },
      });
      count = deleteResult.count;
      break;
  }

  await prisma.auditLog.create({
    data: {
      actorId,
      entityType: "SPRINT",
      entityId: ids.join(","),
      action: `BULK_${action.toUpperCase()}_SPRINTS`,
      details: `Applied "${action}" to ${count} sprint(s)`,
      metadata: { sprintIds: ids, affectedCount: count },
    },
  });

  return NextResponse.json({ message: `Applied "${action}" to ${count} sprint(s)`, affectedCount: count });
}

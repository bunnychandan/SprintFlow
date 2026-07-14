import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { z } from "zod";

const bulkActionSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  action: z.enum(["archive", "restore", "delete", "activate"]),
});

export async function POST(request: Request) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const actorId = authz.user?.id ?? authz.session?.user?.id;
  if (!actorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = bulkActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { ids, action } = parsed.data;
  let count = 0;

  switch (action) {
    case "archive":
      const archiveResult = await prisma.project.updateMany({
        where: { id: { in: ids }, deletedAt: null, status: { not: "ARCHIVED" } },
        data: { status: "ARCHIVED", archivedAt: new Date() },
      });
      count = archiveResult.count;
      break;
    case "restore":
      const restoreResult = await prisma.project.updateMany({
        where: { id: { in: ids }, deletedAt: null, status: "ARCHIVED" },
        data: { status: "ACTIVE", archivedAt: null },
      });
      count = restoreResult.count;
      break;
    case "delete":
      const deleteResult = await prisma.project.updateMany({
        where: { id: { in: ids }, deletedAt: null },
        data: { deletedAt: new Date() },
      });
      count = deleteResult.count;
      break;
    case "activate":
      const activateResult = await prisma.project.updateMany({
        where: { id: { in: ids }, deletedAt: null },
        data: { status: "ACTIVE" },
      });
      count = activateResult.count;
      break;
  }

  await prisma.auditLog.create({
    data: {
      actorId,
      entityType: "PROJECT",
      entityId: ids.join(","),
      action: `BULK_${action.toUpperCase()}_PROJECTS`,
      details: `Applied "${action}" to ${count} project(s)`,
      metadata: { projectIds: ids, affectedCount: count },
    },
  });

  return NextResponse.json({ message: `Applied "${action}" to ${count} project(s)`, affectedCount: count });
}

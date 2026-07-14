import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/authz";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.systemAlert.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Alert not found" }, { status: 404 });

  const updateData: Record<string, unknown> = {};
  if (body.status === "RESOLVED") {
    updateData.status = "RESOLVED";
    updateData.resolvedAt = new Date();
    updateData.resolvedBy = auth.user?.id;
  }

  const actorId = auth.user?.id;

  const [alert] = await prisma.$transaction(async (tx) => {
    const updated = await tx.systemAlert.update({
      where: { id },
      data: updateData,
    });
    if (actorId) {
      await tx.auditLog.create({
        data: {
          actorId,
          entityType: "SYSTEM_ALERT",
          entityId: id,
          action: "RESOLVE_ALERT",
          details: `Resolved alert: ${existing.title}`,
          success: true,
        },
      });
    }
    return [updated];
  });

  return NextResponse.json(alert);
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/authz";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

  const { id } = await params;

  const holiday = await prisma.holiday.findUnique({ where: { id } });
  if (!holiday) {
    return NextResponse.json({ error: "Holiday not found" }, { status: 404 });
  }

  await prisma.holiday.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      actorId: auth.user!.id,
      entityType: "ORGANIZATION",
      entityId: holiday.organizationId,
      action: "DELETE_HOLIDAY",
      details: `Deleted holiday: ${holiday.name}`,
    },
  });

  return NextResponse.json({ success: true });
}

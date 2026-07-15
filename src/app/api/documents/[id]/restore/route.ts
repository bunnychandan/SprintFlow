import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
  if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

  const { id } = await params;
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [updated] = await prisma.$transaction([
    prisma.document.update({
      where: { id },
      data: { status: "DRAFT", archivedAt: null, updatedById: authz.user!.id },
    }),
    prisma.auditLog.create({ data: { actorId: authz.user!.id, entityType: "DOCUMENT", entityId: id, action: "RESTORE", success: true } }),
  ]);

  return NextResponse.json({ id: updated.id, status: updated.status });
}

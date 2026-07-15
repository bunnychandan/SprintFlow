import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
  if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

  const { id } = await params;
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const reviewerId = body.reviewerId || null;

  const [updated] = await prisma.$transaction([
    prisma.document.update({
      where: { id },
      data: { status: "PUBLISHED", publishedAt: new Date(), reviewerId, updatedById: authz.user!.id },
    }),
    prisma.auditLog.create({ data: { actorId: authz.user!.id, entityType: "DOCUMENT", entityId: id, action: "PUBLISH", success: true } }),
  ]);

  return NextResponse.json({ id: updated.id, status: updated.status, publishedAt: updated.publishedAt?.toISOString() || null });
}

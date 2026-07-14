import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const reviewerId = body.reviewerId || null;

  const [updated] = await prisma.$transaction([
    prisma.document.update({
      where: { id },
      data: { status: "PUBLISHED", publishedAt: new Date(), reviewerId, updatedById: session.user.id },
    }),
    prisma.auditLog.create({ data: { actorId: session.user.id, entityType: "DOCUMENT", entityId: id, action: "PUBLISH", success: true } }),
  ]);

  return NextResponse.json({ id: updated.id, status: updated.status, publishedAt: updated.publishedAt?.toISOString() || null });
}

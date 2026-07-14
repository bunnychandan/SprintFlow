import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  if (auth.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Only SUPER_ADMIN can extend invitations" }, { status: 403 });
  }

  const { id } = await params;

  let body: { expiresAt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const invitation = await prisma.invitation.findUnique({ where: { id } });
  if (!invitation) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }

  if (invitation.status !== "PENDING" && invitation.status !== "EXPIRED") {
    return NextResponse.json({ error: `Cannot extend an invitation with status ${invitation.status}` }, { status: 400 });
  }

  let newExpiresAt: Date;
  if (body.expiresAt) {
    const parsed = new Date(body.expiresAt);
    if (isNaN(parsed.getTime())) {
      return NextResponse.json({ error: "Invalid expiration date" }, { status: 400 });
    }
    newExpiresAt = parsed;
  } else {
    newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  if (newExpiresAt <= new Date()) {
    return NextResponse.json({ error: "Expiration date must be in the future" }, { status: 400 });
  }

  const [updated] = await prisma.$transaction([
    prisma.invitation.update({
      where: { id },
      data: {
        expiresAt: newExpiresAt,
        status: "PENDING",
      },
      include: { sender: { select: { id: true, name: true, email: true } } },
    }),
    prisma.auditLog.create({
      data: {
        actorId: auth.user!.id,
        entityType: "INVITATION",
        entityId: id,
        action: "EXTEND_INVITATION",
        details: `Extended invitation for ${invitation.email} to ${newExpiresAt.toISOString()}`,
      },
    }),
  ]);

  return NextResponse.json({ invitation: updated });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import { sendInvitationEmail } from "@/lib/email/invitation-email";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  if (auth.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Only SUPER_ADMIN can resend invitations" }, { status: 403 });
  }

  const { id } = await params;

  const invitation = await prisma.invitation.findUnique({ where: { id } });
  if (!invitation) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }

  if (invitation.status === "ACCEPTED") {
    return NextResponse.json({ error: "Cannot resend an accepted invitation" }, { status: 400 });
  }

  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const newToken = crypto.randomUUID();

  const [updated] = await prisma.$transaction([
    prisma.invitation.update({
      where: { id },
      data: {
        token: newToken,
        expiresAt: newExpiresAt,
        status: "PENDING",
        revokedAt: null,
        cancelledAt: null,
      },
      include: { sender: { select: { id: true, name: true, email: true } } },
    }),
    prisma.auditLog.create({
      data: {
        actorId: auth.user!.id,
        entityType: "INVITATION",
        entityId: id,
        action: "RESEND_INVITATION",
        details: `Resent invitation to ${invitation.email}`,
      },
    }),
  ]);

  try {
    await sendInvitationEmail({
      to: invitation.email,
      inviterName: auth.session?.user?.name ?? auth.session?.user?.email ?? "An admin",
      type: invitation.type,
      token: newToken,
      expiresAt: newExpiresAt,
    });
  } catch (e) {
    console.error("Failed to resend invitation email:", e);
  }

  return NextResponse.json({ invitation: updated });
}

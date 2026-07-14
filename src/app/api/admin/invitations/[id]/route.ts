import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

  const { id } = await params;

  const invitation = await prisma.invitation.findUnique({
    where: { id },
    include: {
      sender: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  if (!invitation) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }

  const auditLogs = await prisma.auditLog.findMany({
    where: { entityType: "INVITATION", entityId: id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { actor: { select: { name: true, email: true } } },
  });

  const linkedUser = invitation.acceptedAt
    ? await prisma.user.findUnique({
        where: { email: invitation.email },
        select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      })
    : null;

  return NextResponse.json({
    invitation,
    auditLogs,
    linkedUser,
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  if (auth.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Only SUPER_ADMIN can manage invitations" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "revoke";

  const { id } = await params;

  const invitation = await prisma.invitation.findUnique({ where: { id } });
  if (!invitation) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }

  if (invitation.status !== "PENDING") {
    return NextResponse.json({ error: `Cannot ${action} an invitation with status ${invitation.status}` }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  let auditAction: string;
  let auditDetail: string;

  switch (action) {
    case "revoke":
      updateData.status = "REVOKED";
      updateData.revokedAt = new Date();
      auditAction = "REVOKE_INVITATION";
      auditDetail = `Revoked invitation for ${invitation.email}`;
      break;
    case "cancel":
      updateData.status = "CANCELLED";
      updateData.cancelledAt = new Date();
      auditAction = "CANCEL_INVITATION";
      auditDetail = `Cancelled invitation for ${invitation.email}`;
      break;
    default:
      return NextResponse.json({ error: "Invalid action. Use 'revoke' or 'cancel'." }, { status: 400 });
  }

  const [updated] = await prisma.$transaction([
    prisma.invitation.update({
      where: { id },
      data: updateData,
      include: { sender: { select: { id: true, name: true, email: true } } },
    }),
    prisma.auditLog.create({
      data: {
        actorId: auth.user!.id,
        entityType: "INVITATION",
        entityId: id,
        action: auditAction,
        details: auditDetail,
      },
    }),
  ]);

  return NextResponse.json({ invitation: updated });
}

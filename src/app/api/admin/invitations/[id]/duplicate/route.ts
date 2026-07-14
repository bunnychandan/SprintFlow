import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import { sendInvitationEmail } from "@/lib/email/invitation-email";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  if (auth.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Only SUPER_ADMIN can duplicate invitations" }, { status: 403 });
  }

  const { id } = await params;

  const original = await prisma.invitation.findUnique({ where: { id } });
  if (!original) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email: original.email } });
  if (existingUser) {
    return NextResponse.json({ error: "This email already has an active account" }, { status: 409 });
  }

  const activeInvitation = await prisma.invitation.findFirst({
    where: { email: original.email, status: "PENDING", expiresAt: { gt: new Date() } },
  });
  if (activeInvitation) {
    return NextResponse.json({ error: "A pending invitation already exists for this email" }, { status: 409 });
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const newToken = crypto.randomUUID();

  const duplicate = await prisma.invitation.create({
    data: {
      email: original.email,
      type: original.type,
      projectId: original.projectId,
      role: original.role,
      department: original.department,
      designation: original.designation,
      expiresAt,
      senderId: auth.user!.id,
      token: newToken,
      status: "PENDING",
    },
    include: { sender: { select: { id: true, name: true, email: true } } },
  });

  await prisma.auditLog.create({
    data: {
      actorId: auth.user!.id,
      entityType: "INVITATION",
      entityId: duplicate.id,
      action: "DUPLICATE_INVITATION",
      details: `Duplicated invitation for ${original.email} (from original ${original.id})`,
    },
  });

  try {
    await sendInvitationEmail({
      to: original.email,
      inviterName: auth.session?.user?.name ?? auth.session?.user?.email ?? "An admin",
      type: duplicate.type,
      token: newToken,
      expiresAt,
    });
  } catch (e) {
    console.error("Failed to send duplicate invitation email:", e);
  }

  return NextResponse.json({ invitation: duplicate }, { status: 201 });
}

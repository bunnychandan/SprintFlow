import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  if (auth.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Only SUPER_ADMIN can perform bulk actions" }, { status: 403 });
  }

  let body: { action?: string; ids?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { action, ids } = body;
  if (!action || !ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "action and ids are required" }, { status: 400 });
  }

  const validActions = ["revoke", "cancel", "resend", "delete"];
  if (!validActions.includes(action)) {
    return NextResponse.json({ error: `Invalid action. Must be one of: ${validActions.join(", ")}` }, { status: 400 });
  }

  const invitations = await prisma.invitation.findMany({
    where: { id: { in: ids } },
  });

  if (invitations.length !== ids.length) {
    return NextResponse.json({ error: "Some invitations were not found" }, { status: 404 });
  }

  const now = new Date();
  let count = 0;

  for (const invitation of invitations) {
    if (action === "delete") {
      await prisma.invitation.delete({ where: { id: invitation.id } });
      await prisma.auditLog.create({
        data: {
          actorId: auth.user!.id,
          entityType: "INVITATION",
          entityId: invitation.id,
          action: "DELETE_INVITATION",
          details: `Deleted invitation for ${invitation.email}`,
        },
      });
      count++;
      continue;
    }

    if (invitation.status !== "PENDING") continue;

    let updateData: Record<string, unknown>;
    let auditAction: string;

    switch (action) {
      case "revoke":
        updateData = { status: "REVOKED", revokedAt: now };
        auditAction = "REVOKE_INVITATION";
        break;
      case "cancel":
        updateData = { status: "CANCELLED", cancelledAt: now };
        auditAction = "CANCEL_INVITATION";
        break;
      case "resend":
        updateData = { token: crypto.randomUUID(), expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), status: "PENDING", revokedAt: null, cancelledAt: null };
        auditAction = "RESEND_INVITATION";
        break;
      default:
        continue;
    }

    await prisma.invitation.update({
      where: { id: invitation.id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        actorId: auth.user!.id,
        entityType: "INVITATION",
        entityId: invitation.id,
        action: auditAction,
        details: `Bulk ${action} for invitation ${invitation.email}`,
      },
    });

    count++;
  }

  return NextResponse.json({
    message: `Successfully processed ${count} invitation(s)`,
    count,
  });
}

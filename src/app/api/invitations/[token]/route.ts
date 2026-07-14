import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-error-handler";

function json(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, { status });
}

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;

    if (!token) {
      return json({ error: "Token is required" }, 400);
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { sender: { select: { name: true, email: true } } },
    });

    if (!invitation) {
      return json({ error: "Invalid or expired invitation" }, 404);
    }

    if (invitation.status !== "PENDING") {
      const statusMap: Record<string, string> = {
        ACCEPTED: "This invitation has already been accepted",
        EXPIRED: "This invitation has expired",
        REVOKED: "This invitation has been revoked",
        CANCELLED: "This invitation has been cancelled",
      };
      return json({
        error: statusMap[invitation.status] ?? "This invitation is no longer valid",
        status: invitation.status,
      }, 410);
    }

    if (invitation.expiresAt < new Date()) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });
      return json({ error: "This invitation has expired", status: "EXPIRED" }, 410);
    }

    const existingUser = await prisma.user.findUnique({ where: { email: invitation.email } });
    if (existingUser) {
      if (existingUser.deletedAt) {
        return json({ error: "This email is associated with a deleted account" }, 410);
      }
      return json({ error: "An account with this email already exists" }, 409);
    }

    return json({
      valid: true,
      email: invitation.email,
      type: invitation.type,
      inviterName: invitation.sender.name ?? invitation.sender.email,
    });
  } catch (error) {
    return handleApiError(error, "GET /api/invitations/[token]");
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;

    if (!token) {
      return json({ error: "Token is required" }, 400);
    }

    const invitation = await prisma.invitation.findUnique({ where: { token } });
    if (!invitation) {
      return json({ error: "Invalid or expired invitation" }, 404);
    }

    if (invitation.status !== "PENDING") {
      return json({ error: `Invitation is ${invitation.status.toLowerCase()}` }, 410);
    }

    if (invitation.expiresAt < new Date()) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });
      return json({ error: "Invitation has expired" }, 410);
    }

    const existingUser = await prisma.user.findUnique({ where: { email: invitation.email } });
    if (existingUser) {
      return json({ error: "An account with this email already exists" }, 409);
    }

    const user = await prisma.user.create({
      data: {
        email: invitation.email,
        name: invitation.email.split("@")[0],
        role: invitation.type === "ADMIN" ? "ADMIN" : "USER",
        department: invitation.department,
        designation: invitation.designation,
        isActive: true,
        lastLoginAt: new Date(),
      },
    });

    if (invitation.projectId) {
      await prisma.projectMember.create({
        data: {
          userId: user.id,
          projectId: invitation.projectId,
          roleInProject: invitation.role,
        },
      });
    }

    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        entityType: "INVITATION",
        entityId: invitation.id,
        action: "ACCEPT_INVITATION",
        details: `Invitation accepted by ${invitation.email}. User ${user.id} created with role ${user.role}.`,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        entityType: "USER",
        entityId: user.id,
        action: "OAUTH_SIGNUP",
        details: `User created via invitation with role ${user.role}`,
      },
    });

    return json({ success: true, email: invitation.email });
  } catch (error) {
    return handleApiError(error, "POST /api/invitations/[token]");
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { handleApiError } from "@/lib/api-error-handler";

const notificationInclude = {
  actor: { select: { id: true, name: true, email: true, image: true } },
  project: { select: { id: true, name: true, code: true } },
  task: { select: { id: true, title: true } },
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    const recipientId = authz.user?.id ?? authz.session?.user?.id;
    if (!recipientId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const notification = await prisma.notification.findUnique({
      where: { id },
      include: notificationInclude,
    });

    if (!notification) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (notification.recipientId !== recipientId) {
      const role = authz.user?.role;
      if (role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    return NextResponse.json(notification);
  } catch (error) {
    return handleApiError(error, "GET /api/notifications/[id]");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    const recipientId = authz.user?.id ?? authz.session?.user?.id;
    if (!recipientId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isOwner = notification.recipientId === recipientId;
    const isSuperAdmin = authz.user?.role === "SUPER_ADMIN";
    if (!isOwner && !isSuperAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await prisma.notification.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        actorId: recipientId,
        entityType: "NOTIFICATION",
        entityId: id,
        action: "DELETE_NOTIFICATION",
        details: "Deleted a notification",
        success: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "DELETE /api/notifications/[id]");
  }
}

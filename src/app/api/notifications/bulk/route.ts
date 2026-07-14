import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function POST(request: Request) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const recipientId = authz.user?.id ?? authz.session?.user?.id;
  if (!recipientId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { ids, action } = body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids must be a non-empty array" }, { status: 400 });
  }

  if (action === "read") {
    const result = await prisma.notification.updateMany({
      where: { id: { in: ids }, recipientId },
      data: { isRead: true, readAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        actorId: recipientId,
        entityType: "NOTIFICATION",
        entityId: "bulk",
        action: "BULK_READ_NOTIFICATIONS",
        details: `Marked ${result.count} notifications as read`,
        success: true,
      },
    });

    return NextResponse.json({ count: result.count });
  }

  if (action === "delete") {
    const result = await prisma.notification.deleteMany({
      where: { id: { in: ids }, recipientId },
    });

    await prisma.auditLog.create({
      data: {
        actorId: recipientId,
        entityType: "NOTIFICATION",
        entityId: "bulk",
        action: "BULK_DELETE_NOTIFICATIONS",
        details: `Deleted ${result.count} notifications`,
        success: true,
      },
    });

    return NextResponse.json({ count: result.count });
  }

  return NextResponse.json({ error: "Invalid action. Use 'read' or 'delete'." }, { status: 400 });
}

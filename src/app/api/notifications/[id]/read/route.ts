import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

const notificationInclude = {
  actor: { select: { id: true, name: true, email: true, image: true } },
  project: { select: { id: true, name: true, code: true } },
  task: { select: { id: true, title: true } },
};

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const recipientId = authz.user?.id ?? authz.session?.user?.id;
  if (!recipientId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (notification.recipientId !== recipientId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { isRead: true, readAt: new Date() },
    include: notificationInclude,
  });

  return NextResponse.json(updated);
}

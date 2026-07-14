import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function PUT() {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const recipientId = authz.user?.id ?? authz.session?.user?.id;
  if (!recipientId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await prisma.notification.updateMany({
    where: { recipientId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });

  return NextResponse.json({ count: result.count });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function GET() {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const recipientId = authz.user?.id ?? authz.session?.user?.id;
  if (!recipientId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const count = await prisma.notification.count({
    where: { recipientId, isRead: false },
  });

  return NextResponse.json({ count });
}

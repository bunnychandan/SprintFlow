import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

  const where: Record<string, unknown> = {};

  if (auth.user?.role !== "SUPER_ADMIN") {
    where.actorId = auth.user!.id;
  }

  const logs = await prisma.auditLog.findMany({
    where: where as any,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      actor: { select: { id: true, name: true, email: true, image: true, role: true } },
    },
  });

  return NextResponse.json({ logs });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireSuperAdmin } from "@/lib/authz";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "50");
  const status = searchParams.get("status");
  const severity = searchParams.get("severity");
  const source = searchParams.get("source");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (severity) where.severity = severity;
  if (source) where.source = source;

  const [alerts, total] = await Promise.all([
    prisma.systemAlert.findMany({
      where,
      orderBy: { timestamp: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.systemAlert.count({ where }),
  ]);

  return NextResponse.json({ alerts, total });
}

export async function POST(request: Request) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

  const body = await request.json();
  const alert = await prisma.systemAlert.create({
    data: {
      title: body.title,
      description: body.description,
      severity: body.severity || "INFO",
      source: body.source || "manual",
      status: "ACTIVE",
    },
  });

  const actorId = auth.user?.id;
  if (actorId) {
    await prisma.auditLog.create({
      data: {
        actorId,
        entityType: "SYSTEM_ALERT",
        entityId: alert.id,
        action: "CREATE_ALERT",
        details: `Created alert: ${alert.title}`,
        success: true,
      },
    });
  }

  return NextResponse.json(alert, { status: 201 });
}

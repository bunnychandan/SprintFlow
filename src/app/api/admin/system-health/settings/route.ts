import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/authz";

export async function GET() {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

  const org = await prisma.organization.findFirst();
  if (!org) return NextResponse.json({ error: "No organization found" }, { status: 404 });

  let config = await prisma.monitoringConfiguration.findUnique({
    where: { organizationId: org.id },
  });

  if (!config) {
    config = await prisma.monitoringConfiguration.create({
      data: { organizationId: org.id },
    });
  }

  return NextResponse.json(config);
}

export async function PUT(request: Request) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

  const org = await prisma.organization.findFirst();
  if (!org) return NextResponse.json({ error: "No organization found" }, { status: 404 });

  const body = await request.json();
  const allowedFields = [
    "healthCheckInterval", "alertThresholdWarning", "alertThresholdCritical",
    "pollingFrequency", "logRetention", "monitoringEnabled",
    "apiResponseThreshold", "errorRateThreshold", "memoryThresholdMB", "diskThresholdPercent",
  ];

  const updateData: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) updateData[field] = body[field];
  }

  const config = await prisma.monitoringConfiguration.upsert({
    where: { organizationId: org.id },
    update: updateData,
    create: { organizationId: org.id, ...updateData },
  });

  const actorId = auth.user?.id;
  if (actorId) {
    await prisma.auditLog.create({
      data: {
        actorId,
        entityType: "MONITORING_CONFIG",
        entityId: config.id,
        action: "UPDATE_MONITORING_SETTINGS",
        details: "Updated monitoring configuration",
        metadata: { changes: updateData } as any,
        success: true,
      },
    });
  }

  return NextResponse.json(config);
}

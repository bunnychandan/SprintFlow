import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/authz";
import { getOrCreateOrganization } from "@/lib/org";

export async function GET() {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

  const org = await getOrCreateOrganization();
  const flags = await prisma.featureFlag.findMany({
    where: { organizationId: org.id },
    orderBy: { key: "asc" },
  });
  return NextResponse.json({ featureFlags: flags });
}

export async function PUT(request: Request) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

  const org = await getOrCreateOrganization();

  let body: { flags?: Array<{ key: string; enabled: boolean }> };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.flags || !Array.isArray(body.flags)) {
    return NextResponse.json({ error: "flags array is required" }, { status: 400 });
  }

  const flagsData = body.flags;

  await prisma.$transaction(async (tx) => {
    for (const flag of flagsData) {
      await tx.featureFlag.upsert({
        where: { organizationId_key: { organizationId: org.id, key: flag.key } },
        update: { enabled: flag.enabled },
        create: { organizationId: org.id, key: flag.key, label: flag.key, enabled: flag.enabled },
      });
    }
    await tx.auditLog.create({
      data: {
        actorId: auth.user!.id,
        entityType: "ORGANIZATION",
        entityId: org.id,
        action: "UPDATE_FEATURE_FLAGS",
        details: `Updated ${flagsData.length} feature flag(s)`,
      },
    });
  });

  const flags = await prisma.featureFlag.findMany({
    where: { organizationId: org.id },
    orderBy: { key: "asc" },
  });

  return NextResponse.json({ featureFlags: flags });
}

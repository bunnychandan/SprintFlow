import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/authz";
import { getOrCreateOrganization } from "@/lib/org";

export async function GET() {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

  const org = await getOrCreateOrganization();
  const branding = await prisma.brandingSetting.findUnique({ where: { organizationId: org.id } });
  return NextResponse.json({ branding });
}

export async function PUT(request: Request) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

  const org = await getOrCreateOrganization();

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const allowedFields = [
    "primaryColor", "secondaryColor", "accentColor",
    "logo", "darkModeLogo", "loginBackground", "favicon",
  ];

  const updateData: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) updateData[field] = body[field];
  }

  const branding = await prisma.brandingSetting.upsert({
    where: { organizationId: org.id },
    update: updateData,
    create: { organizationId: org.id, ...updateData },
  });

  await prisma.auditLog.create({
    data: {
      actorId: auth.user!.id,
      entityType: "ORGANIZATION",
      entityId: org.id,
      action: "UPDATE_ORG_BRANDING",
      details: `Updated organization branding (${Object.keys(updateData).join(", ")})`,
    },
  });

  return NextResponse.json({ branding });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/authz";
import { getFullOrganization, getOrCreateOrganization } from "@/lib/org";

export async function GET() {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

  const org = await getFullOrganization();
  return NextResponse.json({ organization: org });
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
    "name", "displayName", "logo", "favicon", "email", "supportEmail",
    "website", "phone", "address", "timezone", "currency", "locale",
    "dateFormat", "timeFormat", "fiscalYearStart",
  ];

  const updateData: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) updateData[field] = body[field];
  }

  const [updated] = await prisma.$transaction([
    prisma.organization.update({
      where: { id: org.id },
      data: updateData,
    }),
    prisma.auditLog.create({
      data: {
        actorId: auth.user!.id,
        entityType: "ORGANIZATION",
        entityId: org.id,
        action: "UPDATE_ORGANIZATION_PROFILE",
        details: `Updated organization profile (${Object.keys(updateData).join(", ")})`,
      },
    }),
  ]);

  return NextResponse.json({ organization: updated });
}

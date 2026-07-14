import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/authz";
import { getOrCreateOrganization } from "@/lib/org";

export async function GET() {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

  const org = await getOrCreateOrganization();
  const settings = await prisma.organizationSetting.findUnique({ where: { organizationId: org.id } });
  return NextResponse.json({ settings });
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
    "workingDays", "businessHourStart", "businessHourEnd", "lunchBreakStart", "lunchBreakEnd",
    "defaultSprintDays", "defaultProjectVisibility", "defaultTaskStatus", "defaultPriority",
    "defaultSprintLength", "invitationExpirationDays", "maxActiveInvitations",
    "autoExpireInvitations", "allowedDomains", "blockedDomains", "defaultInvitationType",
    "requireApproval", "maxUploadSize", "allowedFileTypes", "attachmentRetention",
    "storageProvider", "emailNotifications", "inAppNotifications", "digestFrequency",
    "projectNotifications", "sprintNotifications", "taskNotifications", "mentionNotifications",
  ];

  const updateData: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) updateData[field] = body[field];
  }

  const [settings] = await prisma.$transaction([
    prisma.organizationSetting.upsert({
      where: { organizationId: org.id },
      update: updateData,
      create: { organizationId: org.id, ...updateData },
    }),
    prisma.auditLog.create({
      data: {
        actorId: auth.user!.id,
        entityType: "ORGANIZATION",
        entityId: org.id,
        action: "UPDATE_ORG_SETTINGS",
        details: `Updated organization settings (${Object.keys(updateData).join(", ")})`,
      },
    }),
  ]);

  return NextResponse.json({ settings });
}

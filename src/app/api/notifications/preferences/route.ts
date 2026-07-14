import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function GET() {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const userId = authz.user?.id ?? authz.session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let prefs = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  if (!prefs) {
    prefs = await prisma.notificationPreference.create({
      data: { userId },
    });
  }

  return NextResponse.json(prefs);
}

export async function PUT(request: Request) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const userId = authz.user?.id ?? authz.session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const allowedFields = [
    "emailNotifications", "slackNotifications", "teamsNotifications", "pushNotifications",
    "digestFrequency",
    "taskAssigned", "taskUpdated", "taskCompleted", "taskComment", "taskMention",
    "sprintStarted", "sprintCompleted",
    "projectCreated", "projectUpdated", "projectArchived",
    "userInvited", "userJoined", "adminCreated",
    "systemAlert", "auditWarning", "securityEvent",
  ];

  const updateData: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) updateData[field] = body[field];
  }

  const prefs = await prisma.notificationPreference.upsert({
    where: { userId },
    update: updateData,
    create: { userId, ...updateData },
  });

  await prisma.auditLog.create({
    data: {
      actorId: userId,
      entityType: "NOTIFICATION_PREFERENCE",
      entityId: prefs.id,
      action: "UPDATE_NOTIFICATION_PREFERENCES",
      details: "Updated notification preferences",
      metadata: { changes: updateData } as any,
      success: true,
    },
  });

  return NextResponse.json(prefs);
}

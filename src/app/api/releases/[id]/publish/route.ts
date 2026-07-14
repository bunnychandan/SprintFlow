import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";
import type { NotificationType, NotificationChannel } from "@prisma/client";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const release = await prisma.release.findFirst({ where: { id, archivedAt: null } });
  if (!release) return NextResponse.json({ error: "Release not found" }, { status: 404 });

  if (release.status === "RELEASED") {
    return NextResponse.json({ error: "Release is already published" }, { status: 400 });
  }

  if (release.status === "CANCELLED") {
    return NextResponse.json({ error: "Cannot publish a cancelled release" }, { status: 400 });
  }

  const authz = await requireProjectAccess(release.projectId, ["PROJECT_MANAGER", "SCRUM_MASTER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const actorId = authz.user?.id ?? authz.session?.user?.id;
  if (!actorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const updated = await prisma.release.update({
    where: { id },
    data: { status: "RELEASED", releasedAt: new Date(), updatedById: actorId },
  });

  await prisma.auditLog.create({
    data: { actorId, entityType: "RELEASE", entityId: id, action: "PUBLISH_RELEASE", details: `Published release "${release.name}"`, projectId: release.projectId },
  });

  const members = await prisma.projectMember.findMany({
    where: { projectId: release.projectId, roleInProject: { in: ["PROJECT_MANAGER", "SCRUM_MASTER", "DEVELOPER", "TESTER"] } },
  });
  const notifications = members
    .filter((m) => m.userId !== actorId)
    .map((m) => ({
      recipientId: m.userId,
      actorId,
      projectId: release.projectId,
      type: "PROJECT_UPDATED" as NotificationType,
      title: "Release Published",
      message: `Release "${release.name}" has been published`,
      channel: "IN_APP" as NotificationChannel,
    }));

  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications });
  }

  return NextResponse.json({ release: updated });
}

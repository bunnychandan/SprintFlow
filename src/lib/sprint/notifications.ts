import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

export async function notifySprintMembers(params: {
  projectId: string;
  sprintId: string;
  actorId: string;
  type: NotificationType;
  title: string;
  message: string;
  excludeActor?: boolean;
}) {
  const { projectId, sprintId, actorId, type, title, message, excludeActor } = params;

  const members = await prisma.projectMember.findMany({
    where: { projectId },
    select: { userId: true },
  });

  const notificationData = members
    .filter((m) => !excludeActor || m.userId !== actorId)
    .map((m) => ({
      recipientId: m.userId,
      actorId,
      projectId,
      type,
      title,
      message,
      channel: "IN_APP" as const,
    }));

  if (notificationData.length === 0) return;

  await prisma.notification.createMany({ data: notificationData });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { parsePagination } from "@/lib/api-utils";
import { handleApiError } from "@/lib/api-error-handler";

const notificationInclude = {
  actor: { select: { id: true, name: true, email: true, image: true } },
  project: { select: { id: true, name: true, code: true } },
  task: { select: { id: true, title: true } },
};

export async function GET(request: Request) {
  try {
    const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    const recipientId = authz.user?.id ?? authz.session?.user?.id;
    if (!recipientId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const { skip, take, page, pageSize } = parsePagination(request, 20);

    const search = searchParams.get("search");
    const type = searchParams.get("type");
    const priority = searchParams.get("priority");
    const isRead = searchParams.get("isRead");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: Record<string, unknown> = { recipientId };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ];
    }
    if (type) where.type = type;
    if (priority) where.priority = priority;
    if (isRead === "true") where.isRead = true;
    else if (isRead === "false") where.isRead = false;

    const orderBy: Record<string, string> = { [sortBy]: sortOrder };

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: notificationInclude,
        orderBy,
        skip,
        take,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { recipientId, isRead: false } }),
    ]);

    return NextResponse.json({
      notifications,
      total,
      unreadCount,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return handleApiError(error, "GET /api/notifications");
  }
}

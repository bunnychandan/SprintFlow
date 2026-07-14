import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, requireProjectAccess } from "@/lib/authz";
import { taskCreateSchema } from "@/lib/validations";
import { parsePagination, paginationMeta } from "@/lib/api-utils";
import { notifyProjectMembers } from "@/lib/project/notifications";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: Request) {
  try {
    const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    const { searchParams } = new URL(request.url);
    const userId = authz.user?.id;
    const userRole = authz.user?.role;
    const { skip, take, page, pageSize } = parsePagination(request);

    const search = searchParams.get("search");
    const projectId = searchParams.get("projectId");
    const sprintId = searchParams.get("sprintId");
    const epicId = searchParams.get("epicId");
    const releaseId = searchParams.get("releaseId");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const type = searchParams.get("type");
    const assigneeId = searchParams.get("assigneeId");
    const reporterId = searchParams.get("reporterId");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: Record<string, unknown> = { deletedAt: null, archivedAt: null };

    if (projectId) where.projectId = projectId;
    if (sprintId) where.sprintId = sprintId;
    if (epicId) where.epicId = epicId;
    if (releaseId) where.releaseId = releaseId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (type) where.type = type;
    if (assigneeId) where.assigneeId = assigneeId;
    if (reporterId) where.reporterId = reporterId;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN") {
      where.project = { members: { some: { userId } } };
    }

    const validSort = ["createdAt", "updatedAt", "title", "status", "priority", "dueDate", "storyPoints"];
    const orderField = validSort.includes(sortBy) ? sortBy : "createdAt";
    const orderDir = sortOrder === "asc" ? "asc" : "desc";

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where: where as any,
        skip,
        take,
        orderBy: { [orderField]: orderDir },
        include: {
          reporter: { select: { id: true, name: true, email: true, image: true } },
          assignee: { select: { id: true, name: true, email: true, image: true } },
          project: { select: { id: true, name: true, code: true, color: true } },
          sprint: { select: { id: true, name: true, status: true } },
          epic: { select: { id: true, title: true, color: true, status: true } },
          release: { select: { id: true, name: true, version: true, status: true } },
          _count: { select: { comments: true, attachments: true, checklist: true, workLogs: true } },
        },
      }),
      prisma.task.count({ where: where as any }),
    ]);

    return NextResponse.json({ tasks, pagination: paginationMeta(total, { skip, take, page, pageSize }) });
  } catch (error) {
    return handleApiError(error, "GET /api/tasks");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = taskCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const authz = await requireProjectAccess(data.projectId, ["PROJECT_MANAGER", "SCRUM_MASTER", "DEVELOPER"]);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    const actorId = authz.user?.id ?? authz.session?.user?.id;
    if (!actorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (data.sprintId) {
      const sprint = await prisma.sprint.findUnique({ where: { id: data.sprintId } });
      if (sprint && sprint.projectId !== data.projectId) {
        return NextResponse.json({ error: "Sprint must belong to the same project" }, { status: 400 });
      }
    }

    if (data.epicId) {
      const epic = await prisma.epic.findFirst({ where: { id: data.epicId, archivedAt: null } });
      if (!epic) return NextResponse.json({ error: "Epic not found" }, { status: 404 });
      if (epic.projectId !== data.projectId) return NextResponse.json({ error: "Epic must belong to the same project" }, { status: 400 });
      if (epic.status === "COMPLETED" || epic.status === "CANCELLED") {
        return NextResponse.json({ error: `Cannot add tasks to a ${epic.status.toLowerCase()} epic` }, { status: 400 });
      }
    }

    if (data.releaseId) {
      const release = await prisma.release.findFirst({ where: { id: data.releaseId, archivedAt: null } });
      if (!release) return NextResponse.json({ error: "Release not found" }, { status: 404 });
      if (release.projectId !== data.projectId) return NextResponse.json({ error: "Release must belong to the same project" }, { status: 400 });
      if (release.status === "RELEASED" || release.status === "CANCELLED") {
        return NextResponse.json({ error: `Cannot add tasks to a ${release.status.toLowerCase()} release` }, { status: 400 });
      }
    }

    const estimateVal = data.originalEstimate ?? null;

    const task = await prisma.task.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        description: data.description ?? null,
        status: data.status as any,
        priority: data.priority as any,
        type: data.type as any,
        originalEstimate: estimateVal,
        timeRemaining: estimateVal,
        reporterId: actorId,
        assigneeId: data.assigneeId ?? null,
        sprintId: data.sprintId ?? null,
        epicId: data.epicId ?? null,
        releaseId: data.releaseId ?? null,
        storyPoints: data.storyPoints ?? null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        labels: (data.labels ?? null) as any,
      },
    });

    await prisma.auditLog.create({
      data: { actorId, entityType: "TASK", entityId: task.id, action: "CREATE_TASK", details: `Created task ${task.title}`, projectId: task.projectId },
    });

    if (data.assigneeId) {
      await prisma.notification.create({
        data: {
          recipientId: data.assigneeId,
          actorId,
          projectId: task.projectId,
          taskId: task.id,
          type: "TASK_ASSIGNED",
          title: "Task Assigned",
          message: `You have been assigned to task "${task.title}"`,
          channel: "IN_APP",
        },
      });
    }

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "POST /api/tasks");
  }
}

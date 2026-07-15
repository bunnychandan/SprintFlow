import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";
import { taskUpdateSchema } from "@/lib/validations";
import { createTaskHistory } from "@/lib/task/history";
import { handleApiError } from "@/lib/api-error-handler";

export const taskDetailInclude = {
  reporter: { select: { id: true, name: true, email: true, image: true } },
  assignee: { select: { id: true, name: true, email: true, image: true } },
  project: { select: { id: true, name: true, code: true, color: true, status: true } },
  sprint: { select: { id: true, name: true, status: true, startDate: true, endDate: true } },
  epic: { select: { id: true, title: true, color: true, status: true, priority: true } },
  release: { select: { id: true, name: true, version: true, status: true } },
  updatedBy: { select: { id: true, name: true, email: true, image: true } },
  comments: {
    orderBy: { createdAt: "asc" },
    include: { author: { select: { id: true, name: true, email: true, image: true } } },
  },
  attachments: {
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, image: true } } },
  },
  relationships: {
    include: { relatedTask: { select: { id: true, title: true, status: true, type: true } } },
  },
  relatedFrom: {
    include: { task: { select: { id: true, title: true, status: true, type: true } } },
  },
  checklist: { orderBy: { order: "asc" } },
  workLogs: {
    orderBy: { loggedAt: "desc" },
    include: { user: { select: { id: true, name: true, image: true } } },
  },
  history: {
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: { select: { id: true, name: true, image: true } } },
  },
} as const;

async function findTask(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: taskDetailInclude,
  });
}


export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const task = await findTask(id);
    if (!task || task.deletedAt) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const authz = await requireProjectAccess(task.projectId);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    return NextResponse.json({ task });
  } catch (error) {
    return handleApiError(error, "GET /api/tasks/[id]");
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const taskExists = await prisma.task.findUnique({ where: { id }, select: { id: true, projectId: true, status: true, epicId: true, releaseId: true, assigneeId: true, reporterId: true, title: true } });
    if (!taskExists) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    if (taskExists.status === "DONE" || taskExists.status === "CANCELLED") {
      return NextResponse.json({ error: `Cannot edit a ${taskExists.status.toLowerCase()} task unless reopening` }, { status: 400 });
    }

    const authz = await requireProjectAccess(taskExists.projectId);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    const body = await request.json();
    const parsed = taskUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const actorId = authz.user?.id ?? authz.session?.user?.id;
    if (!actorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = parsed.data;
    const dataToUpdate: Record<string, unknown> = { updatedById: actorId };
    const scalarFields = ["title", "description", "status", "priority", "type", "originalEstimate", "timeSpent", "timeRemaining", "assigneeId", "sprintId", "epicId", "releaseId", "backlogOrder", "storyPoints", "labels"];
    const dateFields = ["dueDate"];

    for (const field of scalarFields) {
      if ((data as any)[field] !== undefined) dataToUpdate[field] = (data as any)[field];
    }
    for (const field of dateFields) {
      if ((data as any)[field] !== undefined) dataToUpdate[field] = (data as any)[field] ? new Date((data as any)[field]) : null;
    }

    if (data.sprintId) {
      const sprint = await prisma.sprint.findUnique({ where: { id: data.sprintId }, select: { projectId: true } });
      if (sprint && sprint.projectId !== taskExists.projectId) {
        return NextResponse.json({ error: "Sprint must belong to the same project" }, { status: 400 });
      }
    }

    if (data.epicId !== undefined && data.epicId !== taskExists.epicId) {
      if (data.epicId) {
        const epic = await prisma.epic.findUnique({ where: { id: data.epicId }, select: { projectId: true, status: true } });
        if (!epic) return NextResponse.json({ error: "Epic not found" }, { status: 404 });
        if (epic.projectId !== taskExists.projectId) return NextResponse.json({ error: "Epic must belong to the same project" }, { status: 400 });
        if (epic.status === "COMPLETED" || epic.status === "CANCELLED") {
          return NextResponse.json({ error: `Cannot move tasks to a ${epic.status.toLowerCase()} epic` }, { status: 400 });
        }
      }
    }

    if (data.releaseId !== undefined && data.releaseId !== taskExists.releaseId) {
      if (data.releaseId) {
        const release = await prisma.release.findUnique({ where: { id: data.releaseId }, select: { projectId: true, status: true } });
        if (!release) return NextResponse.json({ error: "Release not found" }, { status: 404 });
        if (release.projectId !== taskExists.projectId) return NextResponse.json({ error: "Release must belong to the same project" }, { status: 400 });
        if (release.status === "RELEASED" || release.status === "CANCELLED") {
          return NextResponse.json({ error: `Cannot move tasks to a ${release.status.toLowerCase()} release` }, { status: 400 });
        }
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data: dataToUpdate,
      include: {
        assignee: { select: { id: true, name: true, email: true, image: true } },
        reporter: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    await createTaskHistory(taskExists as any, dataToUpdate, actorId, id);

    const changedFields = Object.keys(dataToUpdate).filter(k => k !== "updatedById").join(", ");
    await prisma.auditLog.create({
      data: { actorId, entityType: "TASK", entityId: id, action: "UPDATE_TASK", details: `Updated task ${task.title} fields: ${changedFields}`, projectId: task.projectId },
    });

    if (data.status === "DONE") {
      await prisma.notification.create({
        data: {
          recipientId: task.reporterId,
          actorId, projectId: task.projectId, taskId: id,
          type: "TASK_COMPLETED", title: "Task Completed",
          message: `Task "${task.title}" has been completed.`, channel: "IN_APP",
        },
      });
    }

    if (data.assigneeId !== undefined && data.assigneeId !== taskExists.assigneeId && data.assigneeId) {
      await prisma.notification.create({
        data: {
          recipientId: data.assigneeId, actorId, projectId: task.projectId, taskId: id,
          type: "TASK_ASSIGNED", title: "Task Assigned",
          message: `You have been assigned to task "${task.title}"`, channel: "IN_APP",
        },
      });
      if (taskExists.assigneeId) {
        await prisma.notification.create({
          data: {
            recipientId: taskExists.assigneeId, actorId, projectId: task.projectId, taskId: id,
            type: "TASK_UPDATED", title: "Task Reassigned",
            message: `Task "${task.title}" has been reassigned.`, channel: "IN_APP",
          },
        });
      }
    }

    return NextResponse.json({ task });
  } catch (error) {
    return handleApiError(error, "PUT /api/tasks/[id]");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const task = await prisma.task.findUnique({ where: { id }, select: { id: true, projectId: true, reporterId: true, title: true, deletedAt: true } });
    if (!task || task.deletedAt) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const authz = await requireProjectAccess(task.projectId);
    if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

    const isPmOrScrum = authz.member && ["PROJECT_MANAGER", "SCRUM_MASTER"].includes(authz.member.roleInProject);
    const isReporter = task.reporterId === authz.user?.id;
    const isGlobalAdmin = ["SUPER_ADMIN", "ADMIN"].includes(authz.user?.role ?? "");

    if (!isPmOrScrum && !isReporter && !isGlobalAdmin) {
      return NextResponse.json({ error: "Insufficient permissions to delete task" }, { status: 403 });
    }

    const actorId = authz.user?.id ?? authz.session?.user?.id;

    await prisma.task.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: actorId },
    });

    await prisma.auditLog.create({
      data: { actorId, entityType: "TASK", entityId: id, action: "DELETE_TASK", details: `Soft-deleted task ${task.title}`, projectId: task.projectId },
    });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    return handleApiError(error, "DELETE /api/tasks/[id]");
  }
}

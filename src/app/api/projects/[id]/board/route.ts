import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";

const STATUS_ORDER = ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "QA_TESTING", "BLOCKED", "DONE", "CANCELLED", "REOPENED"];

const STATUS_LABELS: Record<string, string> = {
  BACKLOG: "Backlog",
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  QA_TESTING: "QA Testing",
  BLOCKED: "Blocked",
  DONE: "Done",
  CANCELLED: "Cancelled",
  REOPENED: "Reopened",
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;

  const authz = await requireProjectAccess(projectId);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, boardType: true, sprints: { where: { status: "ACTIVE", deletedAt: null }, take: 1 } },
  });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const sprintId = searchParams.get("sprintId") || project.sprints[0]?.id || undefined;
  const search = searchParams.get("search");
  const assigneeId = searchParams.get("assigneeId");
  const priority = searchParams.get("priority");
  const labels = searchParams.get("labels");
  const taskType = searchParams.get("taskType");
  const reporterId = searchParams.get("reporterId");
  const onlyMyIssues = searchParams.get("onlyMyIssues");

  const where: Record<string, unknown> = { projectId, deletedAt: null, archivedAt: null };

  if (project.boardType === "SCRUM" && sprintId) {
    where.sprintId = sprintId;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (assigneeId) where.assigneeId = assigneeId;
  if (priority) where.priority = priority;
  if (labels) where.labels = { has: labels };
  if (taskType) where.type = taskType;
  if (reporterId) where.reporterId = reporterId;
  if (onlyMyIssues === "true") where.assigneeId = authz.user?.id;

  const tasks = await prisma.task.findMany({
    where: where as any,
    orderBy: { createdAt: "desc" },
    include: {
      assignee: { select: { id: true, name: true, email: true, image: true } },
      reporter: { select: { id: true, name: true, email: true, image: true } },
      _count: { select: { comments: true, attachments: true, checklist: true } },
    },
  });

  const boardTasks = await Promise.all(
    tasks.map(async (task) => {
      const checklistItems = await prisma.taskChecklist.findMany({
        where: { taskId: task.id },
        select: { isChecked: true },
      });
      return {
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        type: task.type,
        storyPoints: task.storyPoints,
        assigneeId: task.assigneeId,
        assignee: task.assignee,
        reporter: task.reporter,
        sprintId: task.sprintId,
        projectId: task.projectId,
        labels: task.labels as string[] | null,
        dueDate: task.dueDate?.toISOString() ?? null,
        order: 0,
        commentCount: task._count.comments,
        attachmentCount: task._count.attachments,
        checklistTotal: checklistItems.length,
        checklistDone: checklistItems.filter((c) => c.isChecked).length,
      };
    })
  );

  const preferences = await prisma.boardPreference.findUnique({
    where: { projectId_userId: { projectId, userId: authz.user?.id ?? "" } },
  });

  const columns = STATUS_ORDER.map((status) => ({
    id: status,
    status,
    label: STATUS_LABELS[status] || status,
    tasks: boardTasks.filter((t) => t.status === status),
    taskCount: boardTasks.filter((t) => t.status === status).length,
    collapsed: preferences?.collapsedColumns?.includes(status) ?? false,
    width: preferences?.columnWidths ? (preferences.columnWidths as Record<string, number>)[status] : undefined,
  }));

  const activeSprint = project.sprints[0] || null;

  return NextResponse.json({
    columns,
    totalTasks: tasks.length,
    boardType: project.boardType,
    activeSprint: activeSprint ? {
      id: activeSprint.id,
      name: activeSprint.name,
      status: activeSprint.status,
      startDate: activeSprint.startDate?.toISOString() ?? null,
      endDate: activeSprint.endDate?.toISOString() ?? null,
    } : null,
    preferences: {
      collapsedColumns: preferences?.collapsedColumns ?? [],
      columnWidths: preferences?.columnWidths ?? {},
      swimlane: preferences?.swimlane ?? "none",
      density: preferences?.density ?? "normal",
    },
  });
}

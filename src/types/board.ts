import type { SortDirection } from "./project";

export type BoardType = "SCRUM" | "KANBAN";
export type BoardSwimlane = "none" | "assignee" | "priority" | "epic" | "project" | "sprint" | "labels" | "reporter";
export type BoardDensity = "compact" | "normal" | "comfortable";

export interface BoardColumn {
  id: string;
  status: string;
  label: string;
  tasks: BoardTask[];
  taskCount: number;
  collapsed?: boolean;
  width?: number;
}

export interface BoardTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  type: string;
  storyPoints: number | null;
  assigneeId: string | null;
  assignee: { id: string; name: string | null; email: string; image: string | null } | null;
  reporter: { id: string; name: string | null; email: string; image: string | null };
  sprintId: string | null;
  projectId: string;
  labels: string[] | null;
  dueDate: string | null;
  order: number;
  commentCount: number;
  attachmentCount: number;
  checklistTotal: number;
  checklistDone: number;
  blockedReason?: string | null;
}

export interface BoardData {
  columns: BoardColumn[];
  swimlanes?: BoardSwimlane[];
  totalTasks: number;
  boardType: BoardType;
  activeSprint?: { id: string; name: string; status: string; startDate: string | null; endDate: string | null } | null;
  preferences: BoardPreferences;
}

export interface BoardPreferences {
  collapsedColumns: string[];
  columnWidths: Record<string, number>;
  swimlane: BoardSwimlane;
  density: BoardDensity;
}

export interface BoardFilters {
  search?: string;
  assigneeId?: string;
  priority?: string;
  sprintId?: string;
  labels?: string;
  taskType?: string;
  reporterId?: string;
  onlyMyIssues?: boolean;
}

export interface BoardStatistics {
  totalTasks: number;
  tasksPerStatus: Array<{ status: string; count: number }>;
  storyPointsRemaining: number;
  completedPoints: number;
  totalPoints: number;
  blockedTasks: number;
  overdueTasks: number;
  completionPct: number;
  velocity: number;
  daysRemaining: number | null;
}

export interface MoveTaskPayload {
  taskId: string;
  targetStatus: string;
  targetIndex?: number;
  targetSprintId?: string | null;
}

export interface ReorderTaskPayload {
  taskId: string;
  status: string;
  targetIndex: number;
}

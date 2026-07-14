import type { SortDirection } from "./project";

export interface SprintListItem {
  id: string;
  projectId: string;
  name: string;
  goal: string | null;
  status: string;
  createdById: string;
  updatedById: string | null;
  startDate: string | null;
  endDate: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  project: { id: string; name: string; code: string; color: string };
  createdBy: { id: string; name: string | null; email: string; image: string | null };
  _count?: { tasks: number };
  completedTasks?: number;
  totalStoryPoints?: number;
  completedStoryPoints?: number;
}

export interface SprintDetail extends SprintListItem {
  project: { id: string; name: string; code: string; color: string; status: string; visibility: string };
  createdBy: { id: string; name: string | null; email: string; image: string | null; role: string };
  updatedBy: { id: string; name: string | null; email: string; image: string | null } | null;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    type: string;
    assigneeId: string | null;
    reporterId: string;
    storyPoints: number | null;
    dueDate: string | null;
    createdAt: string;
    assignee: { id: string; name: string | null; email: string; image: string | null } | null;
    reporter: { id: string; name: string | null; email: string; image: string | null } | null;
  }>;
}

export interface SprintStatistics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
  completionPercentage: number;
  remainingDays: number;
  totalDays: number;
  elapsedDays: number;
  averageVelocity: number;
  taskDistribution: Array<{ status: string; count: number }>;
  priorityDistribution: Array<{ priority: string; count: number }>;
  assigneeDistribution: Array<{ userId: string; name: string | null; email: string; image: string | null; taskCount: number; completedCount: number; storyPoints: number }>;
  burndownData: Array<{ date: string; remainingTasks: number; remainingPoints: number; idealTasks: number; idealPoints: number }>;
  blockedByAssignee: Array<{ userId: string; name: string | null; email: string; image: string | null; count: number }>;
}

export interface SprintTimelineEvent {
  id: string;
  date: string;
  action: string;
  description: string;
  user: { name: string | null; image: string | null } | null;
  type: "created" | "started" | "completed" | "cancelled" | "task_added" | "task_removed" | "points_updated";
}

export interface SprintListResponse {
  sprints: SprintListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SprintListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  projectId?: string;
  sortBy?: string;
  sortOrder?: string;
}

export type SprintViewMode = "grid" | "table";

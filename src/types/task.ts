import type { SortDirection } from "./project";

export interface TaskListItem {
  id: string;
  projectId: string;
  sprintId: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  type: string;
  originalEstimate: number | null;
  timeSpent: number | null;
  timeRemaining: number | null;
  reporterId: string;
  assigneeId: string | null;
  updatedById: string | null;
  storyPoints: number | null;
  dueDate: string | null;
  labels: string[] | null;
  archivedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  project: { id: string; name: string; code: string; color: string };
  sprint: { id: string; name: string; status: string } | null;
  reporter: { id: string; name: string | null; email: string; image: string | null };
  assignee: { id: string; name: string | null; email: string; image: string | null } | null;
  _count?: { comments: number; attachments: number; checklist: number; workLogs: number };
}

export interface TaskDetail extends TaskListItem {
  project: { id: string; name: string; code: string; color: string; status: string };
  sprint: { id: string; name: string; status: string; startDate: string | null; endDate: string | null } | null;
  reporter: { id: string; name: string | null; email: string; image: string | null };
  assignee: { id: string; name: string | null; email: string; image: string | null } | null;
  updatedBy: { id: string; name: string | null; email: string; image: string | null } | null;
  comments: Array<{
    id: string; content: string; createdAt: string; updatedAt: string;
    author: { id: string; name: string | null; email: string; image: string | null };
  }>;
  attachments: Array<{
    id: string; fileName: string; fileUrl: string; fileSize: number | null; mimeType: string | null; createdAt: string;
    user: { id: string; name: string | null; image: string | null };
  }>;
  relationships: Array<{
    id: string; relatedTaskId: string; type: string;
    relatedTask: { id: string; title: string; status: string; type: string };
  }>;
  relatedFrom: Array<{
    id: string; taskId: string; type: string;
    task: { id: string; title: string; status: string; type: string };
  }>;
  checklist: Array<{
    id: string; title: string; isChecked: boolean; order: number;
  }>;
  workLogs: Array<{
    id: string; userId: string; description: string | null; timeSpent: number; loggedAt: string; createdAt: string;
    user: { id: string; name: string | null; image: string | null };
  }>;
  history: Array<{
    id: string; field: string; oldValue: string | null; newValue: string | null; createdAt: string;
    user: { id: string; name: string | null; image: string | null };
  }>;
}

export interface TaskListResponse {
  tasks: TaskListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TaskListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  priority?: string;
  type?: string;
  projectId?: string;
  sprintId?: string;
  assigneeId?: string;
  reporterId?: string;
  labels?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface TaskStatistics {
  totalTasks: number;
  openTasks: number;
  completedTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  totalStoryPoints: number;
  byStatus: Array<{ status: string; count: number }>;
  byPriority: Array<{ priority: string; count: number }>;
  byType: Array<{ type: string; count: number }>;
  byAssignee: Array<{ userId: string; name: string | null; email: string; image: string | null; count: number }>;
  avgCompletionTime: number;
}

export type TaskViewMode = "table" | "compact";

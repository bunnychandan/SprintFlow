export interface ProjectMemberItem {
  id: string;
  projectId: string;
  userId: string;
  roleInProject: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string;
    department?: string | null;
    designation?: string | null;
  };
}

export interface ProjectListItem {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: string;
  visibility: string;
  color: string;
  startDate: string | null;
  targetDate: string | null;
  archivedAt: string | null;
  ownerId: string;
  createdById: string;
  updatedById: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  owner: { id: string; name: string | null; email: string; image: string | null };
  members: ProjectMemberItem[];
  _count?: { tasks: number; sprints: number; members: number };
  isFavorited?: boolean;
}

export interface ProjectDetail extends ProjectListItem {
  sprints: Array<{
    id: string;
    name: string;
    goal: string | null;
    status: string;
    startDate: string | null;
    endDate: string | null;
    createdAt: string;
    tasks: Array<{
      id: string;
      title: string;
      status: string;
      priority: string;
      assignee: { id: string; name: string | null; image: string | null } | null;
      reporter: { id: string; name: string | null; image: string | null } | null;
    }>;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    type: string;
    assigneeId: string | null;
    reporterId: string;
    assignee: { id: string; name: string | null; image: string | null } | null;
    reporter: { id: string; name: string | null; image: string | null } | null;
    createdAt: string;
    dueDate: string | null;
    storyPoints: number | null;
  }>;
}

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  blockedTasks: number;
  totalSprints: number;
  activeSprints: number;
  totalMembers: number;
  completionPercentage: number;
  taskDistribution: Array<{ status: string; count: number }>;
  priorityDistribution: Array<{ priority: string; count: number }>;
  typeDistribution: Array<{ type: string; count: number }>;
  overdueTasks: number;
  tasksByAssignee: Array<{ userId: string; name: string | null; email: string; image: string | null; count: number }>;
}

export interface ProjectTimelineEvent {
  id: string;
  date: string;
  action: string;
  description: string;
  user: { name: string | null; image: string | null } | null;
  type: "created" | "updated" | "archived" | "milestone" | "sprint" | "task" | "member";
}

export interface ProjectFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
}

export interface ProjectListResponse {
  projects: ProjectListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProjectListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  visibility?: string;
  sortBy?: string;
  sortOrder?: string;
}

export type ProjectViewMode = "grid" | "table";
export type SortDirection = "asc" | "desc";

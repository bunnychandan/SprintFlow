import type { SortDirection } from "./project";

export type EpicStatus = "PLANNING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type EpicPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type ReleaseStatus = "PLANNING" | "ACTIVE" | "RELEASED" | "CANCELLED";
export type BacklogActionType = "SET_PRIORITY" | "SET_ASSIGNEE" | "SET_STATUS" | "SET_LABELS";
export type EpicViewMode = "grid" | "table";
export type ReleaseViewMode = "grid" | "table";

export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface EpicOwner {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export interface EpicProjectRef {
  id: string;
  name: string;
  code: string;
  color: string;
}

export interface EpicDetailProjectRef extends EpicProjectRef {
  status: string;
}

export interface EpicListItem {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  color: string;
  ownerId: string;
  startDate: string | null;
  targetDate: string | null;
  completedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  owner: EpicOwner;
  project: EpicProjectRef;
  _count?: { tasks: number };
}

export interface EpicDetail extends EpicListItem {
  project: EpicDetailProjectRef;
  _count: { tasks: number };
}

export interface EpicStatistics {
  totalTasks: number;
  completedTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
  completionPct: number;
  byStatus: Array<{ status: string; count: number }>;
  byPriority: Array<{ priority: string; count: number }>;
}

export interface EpicTimelineEvent {
  date: string;
  type: "created" | "activity" | "task";
  title: string;
  description: string;
  user?: { id: string; name: string | null; image: string | null } | null;
  taskId?: string;
}

export interface EpicTimelineResponse {
  events: EpicTimelineEvent[];
  epic: { startDate: string | null; targetDate: string | null };
}

export interface EpicListResponse {
  epics: EpicListItem[];
  pagination: Pagination;
}

export interface EpicListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  projectId?: string;
  status?: string;
  priority?: string;
  ownerId?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface CreateEpicPayload {
  projectId: string;
  title: string;
  description?: string | null;
  priority?: string;
  color?: string;
  ownerId: string;
  startDate?: string | null;
  targetDate?: string | null;
}

export interface UpdateEpicPayload {
  title?: string;
  description?: string | null;
  status?: string;
  priority?: string;
  color?: string;
  ownerId?: string;
  startDate?: string | null;
  targetDate?: string | null;
}

export interface ReleaseCreatedByRef {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export interface ReleaseProjectRef {
  id: string;
  name: string;
  code: string;
  color: string;
}

export interface ReleaseDetailProjectRef extends ReleaseProjectRef {
  status: string;
}

export interface ReleaseListItem {
  id: string;
  projectId: string;
  name: string;
  version: string | null;
  description: string | null;
  status: string;
  createdById: string;
  updatedById: string | null;
  startDate: string | null;
  targetDate: string | null;
  releasedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: ReleaseCreatedByRef;
  project: ReleaseProjectRef;
  _count?: { tasks: number };
}

export interface ReleaseDetail extends ReleaseListItem {
  project: ReleaseDetailProjectRef;
  updatedBy: ReleaseCreatedByRef | null;
  _count: { tasks: number };
}

export interface ReleaseStatistics {
  totalTasks: number;
  completedTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  totalPoints: number;
  completedPoints: number;
  completionPct: number;
  byStatus: Array<{ status: string; count: number }>;
}

export interface ReleaseListResponse {
  releases: ReleaseListItem[];
  pagination: Pagination;
}

export interface ReleaseListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  projectId?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface CreateReleasePayload {
  projectId: string;
  name: string;
  version?: string | null;
  description?: string | null;
  startDate?: string | null;
  targetDate?: string | null;
}

export interface UpdateReleasePayload {
  name?: string;
  version?: string | null;
  description?: string | null;
  startDate?: string | null;
  targetDate?: string | null;
}

export interface BacklogTask {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  type: string;
  assigneeId: string | null;
  reporterId: string;
  storyPoints: number | null;
  dueDate: string | null;
  backlogOrder: number | null;
  labels: string[] | null;
  createdAt: string;
  updatedAt: string;
  assignee: { id: string; name: string | null; image: string | null } | null;
  epic: { id: string; title: string; color: string } | null;
  release: { id: string; name: string; version: string | null } | null;
  _count?: { comments: number; attachments: number };
}

export interface BacklogResponse {
  tasks: BacklogTask[];
  pagination: Pagination;
}

export interface BacklogListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  priority?: string;
  epicId?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface BacklogReorderPayload {
  taskId: string;
  targetIndex: number;
}

export interface BacklogMovePayload {
  taskIds: string[];
  targetSprintId?: string | null;
  targetEpicId?: string | null;
  targetReleaseId?: string | null;
}

export interface BacklogBulkPayload {
  taskIds: string[];
  action: BacklogActionType;
  value: string | null;
}

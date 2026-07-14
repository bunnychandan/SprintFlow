import type { TaskListResponse, TaskDetail, TaskListParams, TaskStatistics } from "@/types/task";

export async function getTasks(params?: TaskListParams): Promise<TaskListResponse> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));
  if (params?.search) sp.set("search", params.search);
  if (params?.status) sp.set("status", params.status);
  if (params?.priority) sp.set("priority", params.priority);
  if (params?.type) sp.set("type", params.type);
  if (params?.projectId) sp.set("projectId", params.projectId);
  if (params?.sprintId) sp.set("sprintId", params.sprintId);
  if (params?.assigneeId) sp.set("assigneeId", params.assigneeId);
  if (params?.reporterId) sp.set("reporterId", params.reporterId);
  if (params?.labels) sp.set("labels", params.labels);
  if (params?.dueDateFrom) sp.set("dueDateFrom", params.dueDateFrom);
  if (params?.dueDateTo) sp.set("dueDateTo", params.dueDateTo);
  if (params?.sortBy) sp.set("sortBy", params.sortBy);
  if (params?.sortOrder) sp.set("sortOrder", params.sortOrder);
  const qs = sp.toString();
  const res = await fetch(`/api/tasks${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

export async function getTask(id: string): Promise<TaskDetail> {
  const res = await fetch(`/api/tasks/${id}`);
  if (!res.ok) throw new Error("Failed to fetch task");
  return res.json();
}

export async function createTask(data: {
  projectId: string; title: string; description?: string | null;
  status?: string; priority?: string; type?: string;
  assigneeId?: string | null; sprintId?: string | null;
  storyPoints?: number | null; originalEstimate?: number | null;
  dueDate?: string | null; labels?: string[];
}) {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create task");
  }
  return res.json();
}

export async function updateTask(id: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
}

export async function deleteTask(id: string) {
  const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete task");
  return res.json();
}

export async function archiveTask(id: string) {
  const res = await fetch(`/api/tasks/${id}/archive`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to archive task");
  return res.json();
}

export async function restoreTask(id: string) {
  const res = await fetch(`/api/tasks/${id}/restore`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to restore task");
  return res.json();
}

export async function bulkTaskAction(ids: string[], action: string, data?: Record<string, unknown>) {
  const res = await fetch("/api/tasks/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids, action, ...data }),
  });
  if (!res.ok) throw new Error("Failed to perform bulk action");
  return res.json();
}

export async function duplicateTask(id: string) {
  const res = await fetch(`/api/tasks/${id}/duplicate`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to duplicate task");
  return res.json();
}

export async function getTaskHistory(id: string): Promise<any[]> {
  const res = await fetch(`/api/tasks/${id}/history`);
  if (!res.ok) throw new Error("Failed to fetch task history");
  return res.json();
}

export async function getTaskActivity(id: string): Promise<any[]> {
  const res = await fetch(`/api/tasks/${id}/activity`);
  if (!res.ok) throw new Error("Failed to fetch task activity");
  return res.json();
}

export async function getTaskAttachments(id: string): Promise<any[]> {
  const res = await fetch(`/api/tasks/${id}/attachments`);
  if (!res.ok) throw new Error("Failed to fetch task attachments");
  return res.json();
}

export async function addTaskComment(id: string, content: string) {
  const res = await fetch(`/api/tasks/${id}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to add comment");
  return res.json();
}

export async function deleteTaskComment(taskId: string, commentId: string) {
  const res = await fetch(`/api/tasks/${taskId}/comments/${commentId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete comment");
  return res.json();
}

export async function logWork(taskId: string, data: { timeSpent: number; description?: string; loggedAt?: string }) {
  const res = await fetch(`/api/tasks/${taskId}/worklogs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to log work");
  return res.json();
}

export async function addChecklistItem(taskId: string, title: string) {
  const res = await fetch(`/api/tasks/${taskId}/checklist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to add checklist item");
  return res.json();
}

export async function updateChecklistItem(taskId: string, itemId: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/tasks/${taskId}/checklist/${itemId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update checklist item");
  return res.json();
}

export async function deleteChecklistItem(taskId: string, itemId: string) {
  const res = await fetch(`/api/tasks/${taskId}/checklist/${itemId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete checklist item");
  return res.json();
}

export async function addTaskRelationship(taskId: string, relatedTaskId: string, type: string) {
  const res = await fetch(`/api/tasks/${taskId}/relationships`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ relatedTaskId, type }),
  });
  if (!res.ok) throw new Error("Failed to add relationship");
  return res.json();
}

export async function deleteTaskRelationship(taskId: string, relationshipId: string) {
  const res = await fetch(`/api/tasks/${taskId}/relationships/${relationshipId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete relationship");
  return res.json();
}

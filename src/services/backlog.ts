import type { BacklogResponse, BacklogListParams } from "@/types/agile";

export async function getBacklog(projectId: string, params?: BacklogListParams): Promise<BacklogResponse> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));
  if (params?.search) sp.set("search", params.search);
  if (params?.status) sp.set("status", params.status);
  if (params?.priority) sp.set("priority", params.priority);
  if (params?.epicId) sp.set("epicId", params.epicId);
  if (params?.sortBy) sp.set("sortBy", params.sortBy);
  if (params?.sortOrder) sp.set("sortOrder", params.sortOrder);
  const qs = sp.toString();
  const res = await fetch(`/api/projects/${projectId}/backlog${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch backlog");
  return res.json();
}

export async function reorderBacklogTask(projectId: string, payload: { taskId: string; targetIndex: number }) {
  const res = await fetch(`/api/projects/${projectId}/backlog/reorder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to reorder backlog task");
  }
  return res.json();
}

export async function moveBacklogTasks(projectId: string, payload: { taskIds: string[]; targetSprintId?: string | null; targetEpicId?: string | null; targetReleaseId?: string | null }) {
  const res = await fetch(`/api/projects/${projectId}/backlog/move`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to move backlog tasks");
  }
  return res.json();
}

export async function bulkBacklogAction(projectId: string, payload: { taskIds: string[]; action: string; value: string | null }) {
  const res = await fetch(`/api/projects/${projectId}/backlog/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to perform bulk backlog action");
  }
  return res.json();
}

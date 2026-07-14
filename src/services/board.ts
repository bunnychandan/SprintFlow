import type { BoardData, BoardFilters, BoardStatistics, MoveTaskPayload, ReorderTaskPayload, BoardPreferences } from "@/types/board";

export async function getBoard(projectId: string, sprintId?: string, filters?: BoardFilters): Promise<BoardData> {
  const sp = new URLSearchParams();
  if (sprintId) sp.set("sprintId", sprintId);
  if (filters?.search) sp.set("search", filters.search);
  if (filters?.assigneeId) sp.set("assigneeId", filters.assigneeId);
  if (filters?.priority) sp.set("priority", filters.priority);
  if (filters?.sprintId) sp.set("sprintId", filters.sprintId);
  if (filters?.labels) sp.set("labels", filters.labels);
  if (filters?.taskType) sp.set("taskType", filters.taskType);
  if (filters?.reporterId) sp.set("reporterId", filters.reporterId);
  if (filters?.onlyMyIssues) sp.set("onlyMyIssues", "true");
  const qs = sp.toString();
  const res = await fetch(`/api/projects/${projectId}/board${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to load board");
  return res.json();
}

export async function moveTask(projectId: string, payload: MoveTaskPayload): Promise<void> {
  const res = await fetch(`/api/projects/${projectId}/board/move`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to move task");
  }
}

export async function reorderTask(projectId: string, payload: ReorderTaskPayload): Promise<void> {
  const res = await fetch(`/api/projects/${projectId}/board/reorder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to reorder task");
  }
}

export async function saveBoardPreferences(projectId: string, preferences: Partial<BoardPreferences>): Promise<BoardPreferences> {
  const res = await fetch(`/api/projects/${projectId}/board/preferences`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(preferences),
  });
  if (!res.ok) throw new Error("Failed to save preferences");
  return res.json();
}

export async function getBoardStatistics(projectId: string, sprintId?: string): Promise<BoardStatistics> {
  const sp = new URLSearchParams();
  if (sprintId) sp.set("sprintId", sprintId);
  const qs = sp.toString();
  const res = await fetch(`/api/projects/${projectId}/board/statistics${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to load board statistics");
  return res.json();
}

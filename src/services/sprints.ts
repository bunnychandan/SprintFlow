import type { SprintListResponse, SprintDetail, SprintListParams, SprintStatistics, SprintTimelineEvent } from "@/types/sprint";

export async function getSprints(params?: SprintListParams): Promise<SprintListResponse> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));
  if (params?.search) sp.set("search", params.search);
  if (params?.status) sp.set("status", params.status);
  if (params?.projectId) sp.set("projectId", params.projectId);
  if (params?.sortBy) sp.set("sortBy", params.sortBy);
  if (params?.sortOrder) sp.set("sortOrder", params.sortOrder);
  const qs = sp.toString();
  const res = await fetch(`/api/sprints${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch sprints");
  return res.json();
}

export async function getSprint(id: string): Promise<SprintDetail> {
  const res = await fetch(`/api/sprints/${id}`);
  if (!res.ok) throw new Error("Failed to fetch sprint");
  return res.json();
}

export async function createSprint(data: { projectId: string; name: string; goal?: string | null; startDate?: string | null; endDate?: string | null }) {
  const res = await fetch("/api/sprints", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create sprint");
  }
  return res.json();
}

export async function updateSprint(id: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/sprints/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update sprint");
  return res.json();
}

export async function deleteSprint(id: string) {
  const res = await fetch(`/api/sprints/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete sprint");
  return res.json();
}

export async function startSprint(id: string, data: { goal?: string | null; startDate: string; endDate: string }) {
  const res = await fetch(`/api/sprints/${id}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to start sprint");
  }
  return res.json();
}

export async function completeSprint(id: string, forceComplete?: boolean) {
  const res = await fetch(`/api/sprints/${id}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ forceComplete: !!forceComplete }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to complete sprint");
  }
  return res.json();
}

export async function cancelSprint(id: string, reason?: string) {
  const res = await fetch(`/api/sprints/${id}/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to cancel sprint");
  }
  return res.json();
}

export async function getSprintStatistics(id: string): Promise<SprintStatistics> {
  const res = await fetch(`/api/sprints/${id}/stats`);
  if (!res.ok) throw new Error("Failed to fetch sprint statistics");
  return res.json();
}

export async function getSprintTimeline(id: string): Promise<SprintTimelineEvent[]> {
  const res = await fetch(`/api/sprints/${id}/timeline`);
  if (!res.ok) throw new Error("Failed to fetch sprint timeline");
  return res.json();
}

export async function moveTask(id: string, taskId: string, targetSprintId: string | null) {
  const res = await fetch(`/api/sprints/${id}/move-task`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskId, targetSprintId }),
  });
  if (!res.ok) throw new Error("Failed to move task");
  return res.json();
}

export async function bulkSprintAction(ids: string[], action: string, forceComplete?: boolean) {
  const res = await fetch("/api/sprints/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids, action, forceComplete }),
  });
  if (!res.ok) throw new Error("Failed to perform bulk action");
  return res.json();
}

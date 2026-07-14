import type { EpicListResponse, EpicDetail, EpicStatistics, EpicTimelineResponse, EpicListParams } from "@/types/agile";

export async function getEpics(params?: EpicListParams): Promise<EpicListResponse> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));
  if (params?.search) sp.set("search", params.search);
  if (params?.projectId) sp.set("projectId", params.projectId);
  if (params?.status) sp.set("status", params.status);
  if (params?.priority) sp.set("priority", params.priority);
  if (params?.ownerId) sp.set("ownerId", params.ownerId);
  if (params?.sortBy) sp.set("sortBy", params.sortBy);
  if (params?.sortOrder) sp.set("sortOrder", params.sortOrder);
  const qs = sp.toString();
  const res = await fetch(`/api/epics${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch epics");
  return res.json();
}

export async function getEpic(id: string): Promise<EpicDetail> {
  const res = await fetch(`/api/epics/${id}`);
  if (!res.ok) throw new Error("Failed to fetch epic");
  return res.json();
}

export async function createEpic(data: { projectId: string; title: string; description?: string | null; priority?: string; color?: string; ownerId: string; startDate?: string | null; targetDate?: string | null }) {
  const res = await fetch("/api/epics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create epic");
  }
  return res.json();
}

export async function updateEpic(id: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/epics/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update epic");
  }
  return res.json();
}

export async function deleteEpic(id: string) {
  const res = await fetch(`/api/epics/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to delete epic");
  }
  return res.json();
}

export async function getEpicStatistics(id: string): Promise<EpicStatistics> {
  const res = await fetch(`/api/epics/${id}/stats`);
  if (!res.ok) throw new Error("Failed to fetch epic statistics");
  return res.json();
}

export async function getEpicTimeline(id: string): Promise<EpicTimelineResponse> {
  const res = await fetch(`/api/epics/${id}/timeline`);
  if (!res.ok) throw new Error("Failed to fetch epic timeline");
  return res.json();
}

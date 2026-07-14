import type { ReleaseListResponse, ReleaseDetail, ReleaseStatistics, ReleaseListParams } from "@/types/agile";

export async function getReleases(params?: ReleaseListParams): Promise<ReleaseListResponse> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));
  if (params?.search) sp.set("search", params.search);
  if (params?.projectId) sp.set("projectId", params.projectId);
  if (params?.status) sp.set("status", params.status);
  if (params?.sortBy) sp.set("sortBy", params.sortBy);
  if (params?.sortOrder) sp.set("sortOrder", params.sortOrder);
  const qs = sp.toString();
  const res = await fetch(`/api/releases${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch releases");
  return res.json();
}

export async function getRelease(id: string): Promise<ReleaseDetail> {
  const res = await fetch(`/api/releases/${id}`);
  if (!res.ok) throw new Error("Failed to fetch release");
  return res.json();
}

export async function createRelease(data: { projectId: string; name: string; version?: string | null; description?: string | null; startDate?: string | null; targetDate?: string | null }) {
  const res = await fetch("/api/releases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create release");
  }
  return res.json();
}

export async function updateRelease(id: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/releases/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update release");
  }
  return res.json();
}

export async function deleteRelease(id: string) {
  const res = await fetch(`/api/releases/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to delete release");
  }
  return res.json();
}

export async function publishRelease(id: string) {
  const res = await fetch(`/api/releases/${id}/publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to publish release");
  }
  return res.json();
}

export async function cancelRelease(id: string) {
  const res = await fetch(`/api/releases/${id}/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to cancel release");
  }
  return res.json();
}

export async function getReleaseStatistics(id: string): Promise<ReleaseStatistics> {
  const res = await fetch(`/api/releases/${id}/stats`);
  if (!res.ok) throw new Error("Failed to fetch release statistics");
  return res.json();
}

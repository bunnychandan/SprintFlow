import type { ProjectListResponse, ProjectDetail, ProjectListParams, ProjectStats, ProjectTimelineEvent, ProjectFile, ProjectMemberItem } from "@/types/project";

export async function getProjects(params?: ProjectListParams): Promise<ProjectListResponse> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));
  if (params?.search) sp.set("search", params.search);
  if (params?.status) sp.set("status", params.status);
  if (params?.visibility) sp.set("visibility", params.visibility);
  if (params?.sortBy) sp.set("sortBy", params.sortBy);
  if (params?.sortOrder) sp.set("sortOrder", params.sortOrder);
  const qs = sp.toString();
  const res = await fetch(`/api/projects${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export async function getProject(id: string): Promise<ProjectDetail> {
  const res = await fetch(`/api/projects/${id}`);
  if (!res.ok) throw new Error("Failed to fetch project");
  return res.json();
}

export async function createProject(data: { name: string; code: string; description?: string | null; visibility?: string; color?: string; startDate?: string | null; targetDate?: string | null }) {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create project");
  }
  return res.json();
}

export async function updateProject(id: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update project");
  return res.json();
}

export async function deleteProject(id: string) {
  const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete project");
  return res.json();
}

export async function archiveProject(id: string) {
  const res = await fetch(`/api/projects/${id}/archive`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to archive project");
  return res.json();
}

export async function restoreProject(id: string) {
  const res = await fetch(`/api/projects/${id}/restore`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to restore project");
  return res.json();
}

export async function getProjectStats(id: string): Promise<ProjectStats> {
  const res = await fetch(`/api/projects/${id}/stats`);
  if (!res.ok) throw new Error("Failed to fetch project stats");
  return res.json();
}

export async function getProjectTimeline(id: string): Promise<ProjectTimelineEvent[]> {
  const res = await fetch(`/api/projects/${id}/timeline`);
  if (!res.ok) throw new Error("Failed to fetch project timeline");
  return res.json();
}

export async function getProjectFiles(id: string): Promise<ProjectFile[]> {
  const res = await fetch(`/api/projects/${id}/files`);
  if (!res.ok) throw new Error("Failed to fetch project files");
  return res.json();
}

export async function getProjectMembers(id: string): Promise<ProjectMemberItem[]> {
  const res = await fetch(`/api/projects/${id}/members`);
  if (!res.ok) throw new Error("Failed to fetch project members");
  return res.json();
}

export async function addProjectMember(id: string, data: { email: string; role: string }) {
  const res = await fetch(`/api/projects/${id}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to add member");
  }
  return res.json();
}

export async function removeProjectMember(id: string, userId: string) {
  const res = await fetch(`/api/projects/${id}/members?userId=${userId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to remove member");
  return res.json();
}

export async function updateProjectMemberRole(id: string, userId: string, role: string) {
  const res = await fetch(`/api/projects/${id}/members/${userId}/role`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error("Failed to update member role");
  return res.json();
}

export async function transferProjectOwnership(id: string, newOwnerId: string) {
  const res = await fetch(`/api/projects/${id}/transfer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newOwnerId }),
  });
  if (!res.ok) throw new Error("Failed to transfer ownership");
  return res.json();
}

export async function bulkProjectAction(ids: string[], action: string) {
  const res = await fetch("/api/projects/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids, action }),
  });
  if (!res.ok) throw new Error("Failed to perform bulk action");
  return res.json();
}

export async function toggleProjectFavorite(id: string, favorite: boolean) {
  const res = await fetch(`/api/projects/${id}/favorite`, {
    method: favorite ? "POST" : "DELETE",
  });
  if (!res.ok) throw new Error("Failed to toggle favorite");
  return res.json();
}



import type { User } from "@prisma/client";

interface UserListResponse {
  users: (User & { _count: { projects: number; tasksAssigned: number; tasksReported: number } })[];
  pagination: { total: number; page: number; pageSize: number; totalPages: number };
}

interface UserDetailResponse {
  user: User & { _count: { projects: number; tasksAssigned: number; tasksReported: number } };
  projects: Array<{ project: { id: string; name: string; code: string; status: string }; roleInProject: string }>;
  recentActivity: Array<Record<string, unknown>>;
  recentAuditLogs: Array<Record<string, unknown>>;
  notifications: Array<Record<string, unknown>>;
  sprintParticipation: number;
}

export async function getUsers(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  role?: string;
  isActive?: string;
  department?: string;
}): Promise<UserListResponse> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));
  if (params?.search) sp.set("search", params.search);
  if (params?.sortBy) sp.set("sortBy", params.sortBy);
  if (params?.sortOrder) sp.set("sortOrder", params.sortOrder);
  if (params?.role) sp.set("role", params.role);
  if (params?.isActive) sp.set("isActive", params.isActive);
  if (params?.department) sp.set("department", params.department);

  const qs = sp.toString();
  const res = await fetch(`/api/admin/users${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function getUser(id: string): Promise<UserDetailResponse> {
  const res = await fetch(`/api/admin/users/${id}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export async function createUser(data: {
  email: string;
  name?: string;
  role?: string;
  department?: string;
  designation?: string;
}) {
  const res = await fetch("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create user");
  }
  return res.json();
}

export async function updateUser(
  id: string,
  data: {
    role?: string;
    isActive?: boolean;
    name?: string;
    department?: string | null;
    designation?: string | null;
    image?: string | null;
  }
) {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update user");
  }
  return res.json();
}

export async function deleteUser(id: string) {
  const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to delete user");
  }
  return res.json();
}

export async function bulkUserAction(
  userIds: string[],
  action: "activate" | "deactivate" | "delete" | "restore" | "updateRole",
  role?: string
) {
  const res = await fetch("/api/admin/users/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userIds, action, role }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Bulk action failed");
  }
  return res.json();
}

export async function exportUsers(params?: {
  format?: string;
  role?: string;
  isActive?: string;
}): Promise<Blob> {
  const sp = new URLSearchParams();
  if (params?.format) sp.set("format", params.format);
  if (params?.role) sp.set("role", params.role);
  if (params?.isActive) sp.set("isActive", params.isActive);

  const res = await fetch(`/api/admin/users/export?${sp.toString()}`);
  if (!res.ok) throw new Error("Export failed");
  return res.blob();
}

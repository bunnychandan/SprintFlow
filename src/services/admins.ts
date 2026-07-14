interface AdminListResponse {
  admins: Array<Record<string, unknown>>;
  pagination: { total: number; page: number; pageSize: number; totalPages: number };
}

export async function getAdmins(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  role?: string;
  isActive?: string;
}): Promise<AdminListResponse> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));
  if (params?.search) sp.set("search", params.search);
  if (params?.sortBy) sp.set("sortBy", params.sortBy);
  if (params?.sortOrder) sp.set("sortOrder", params.sortOrder);
  if (params?.role) sp.set("role", params.role);
  if (params?.isActive) sp.set("isActive", params.isActive);

  const qs = sp.toString();
  const res = await fetch(`/api/admin/admins${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch admins");
  return res.json();
}

export async function getAdmin(id: string) {
  const res = await fetch(`/api/admin/admins/${id}`);
  if (!res.ok) throw new Error("Failed to fetch admin");
  return res.json();
}

export async function createAdmin(data: {
  email: string;
  name?: string;
  department?: string;
  designation?: string;
  isActive?: boolean;
  permissions?: Record<string, boolean>;
}) {
  const res = await fetch("/api/admin/admins", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create admin");
  }
  return res.json();
}

export async function updateAdmin(
  id: string,
  data: {
    name?: string;
    department?: string | null;
    designation?: string | null;
    isActive?: boolean;
    image?: string | null;
    permissions?: Record<string, boolean>;
  }
) {
  const res = await fetch(`/api/admin/admins/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update admin");
  }
  return res.json();
}

export async function deleteAdmin(id: string) {
  const res = await fetch(`/api/admin/admins/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to delete admin");
  }
  return res.json();
}

export async function bulkAdminAction(
  adminIds: string[],
  action: "activate" | "deactivate" | "delete" | "restore" | "updatePermissions",
  permissions?: Record<string, boolean>
) {
  const res = await fetch("/api/admin/admins/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminIds, action, permissions }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Bulk action failed");
  }
  return res.json();
}

export async function exportAdmins(params?: {
  format?: string;
  role?: string;
  isActive?: string;
}): Promise<Blob> {
  const sp = new URLSearchParams();
  if (params?.format) sp.set("format", params.format);
  if (params?.role) sp.set("role", params.role);
  if (params?.isActive) sp.set("isActive", params.isActive);

  const res = await fetch(`/api/admin/admins/export?${sp.toString()}`);
  if (!res.ok) throw new Error("Export failed");
  return res.blob();
}

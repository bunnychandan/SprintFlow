export interface InvitationListResponse {
  invitations: Array<Record<string, unknown>>;
  pagination: { total: number; page: number; pageSize: number; totalPages: number };
}

export async function getInvitations(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
  type?: string;
}): Promise<InvitationListResponse> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));
  if (params?.search) sp.set("search", params.search);
  if (params?.sortBy) sp.set("sortBy", params.sortBy);
  if (params?.sortOrder) sp.set("sortOrder", params.sortOrder);
  if (params?.status) sp.set("status", params.status);
  if (params?.type) sp.set("type", params.type);

  const qs = sp.toString();
  const res = await fetch(`/api/admin/invitations${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch invitations");
  return res.json();
}

export async function getInvitation(id: string) {
  const res = await fetch(`/api/admin/invitations/${id}`);
  if (!res.ok) throw new Error("Failed to fetch invitation");
  return res.json();
}

export async function createInvitation(data: {
  email: string;
  type: string;
  department?: string;
  designation?: string;
  projectId?: string;
  role?: string;
  expiresAt?: string;
}) {
  const res = await fetch("/api/admin/invitations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create invitation");
  }
  return res.json();
}

export async function resendInvitation(id: string) {
  const res = await fetch(`/api/admin/invitations/${id}/resend`, { method: "POST" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to resend invitation");
  }
  return res.json();
}

export async function extendInvitation(id: string, expiresAt?: string) {
  const res = await fetch(`/api/admin/invitations/${id}/extend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ expiresAt }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to extend invitation");
  }
  return res.json();
}

export async function duplicateInvitation(id: string) {
  const res = await fetch(`/api/admin/invitations/${id}/duplicate`, { method: "POST" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to duplicate invitation");
  }
  return res.json();
}

export async function deleteInvitation(id: string, action: "revoke" | "cancel" = "revoke") {
  const res = await fetch(`/api/admin/invitations/${id}?action=${action}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update invitation");
  }
  return res.json();
}

export async function bulkInvitationAction(action: string, ids: string[]) {
  const res = await fetch("/api/admin/invitations/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ids }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Bulk action failed");
  }
  return res.json();
}

export async function exportInvitations(params?: { status?: string; type?: string }) {
  const sp = new URLSearchParams();
  if (params?.status) sp.set("status", params.status);
  if (params?.type) sp.set("type", params.type);

  const qs = sp.toString();
  const res = await fetch(`/api/admin/invitations/export${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to export invitations");

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invitations-export-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function validateInvitationToken(token: string) {
  const res = await fetch(`/api/invitations/${token}`);
  if (!res.ok) {
    if (res.status === 404 || res.status === 410) {
      const err = await res.json();
      return { valid: false, error: err.error, status: err.status };
    }
    throw new Error("Failed to validate invitation");
  }
  return res.json();
}

export async function acceptInvitation(token: string) {
  const res = await fetch(`/api/invitations/${token}`, { method: "POST" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to accept invitation");
  }
  return res.json();
}

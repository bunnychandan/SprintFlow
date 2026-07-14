export interface AuditListResponse {
  logs: Array<Record<string, unknown>>;
  pagination: { total: number; page: number; pageSize: number; totalPages: number };
}

export async function getAuditLogs(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  action?: string;
  entityType?: string;
  actorId?: string;
  success?: string;
  projectId?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<AuditListResponse> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));
  if (params?.search) sp.set("search", params.search);
  if (params?.sortBy) sp.set("sortBy", params.sortBy);
  if (params?.sortOrder) sp.set("sortOrder", params.sortOrder);
  if (params?.action) sp.set("action", params.action);
  if (params?.entityType) sp.set("entityType", params.entityType);
  if (params?.actorId) sp.set("actorId", params.actorId);
  if (params?.success) sp.set("success", params.success);
  if (params?.projectId) sp.set("projectId", params.projectId);
  if (params?.dateFrom) sp.set("dateFrom", params.dateFrom);
  if (params?.dateTo) sp.set("dateTo", params.dateTo);

  const qs = sp.toString();
  const res = await fetch(`/api/admin/audit${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch audit logs");
  return res.json();
}

export async function getAuditLog(id: string) {
  const res = await fetch(`/api/admin/audit/${id}`);
  if (!res.ok) throw new Error("Failed to fetch audit log");
  return res.json();
}

export async function getAuditDashboard() {
  const res = await fetch("/api/admin/audit/dashboard");
  if (!res.ok) throw new Error("Failed to fetch audit dashboard");
  return res.json();
}

export async function getAuditActivity(params?: { limit?: number }) {
  const sp = new URLSearchParams();
  if (params?.limit) sp.set("limit", String(params.limit));
  const qs = sp.toString();
  const res = await fetch(`/api/admin/audit/activity${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch activity feed");
  return res.json();
}

export async function exportAuditLogs(params?: {
  format?: string;
  search?: string;
  action?: string;
  entityType?: string;
  actorId?: string;
  success?: string;
  projectId?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const sp = new URLSearchParams();
  if (params?.format) sp.set("format", params.format);
  if (params?.search) sp.set("search", params.search);
  if (params?.action) sp.set("action", params.action);
  if (params?.entityType) sp.set("entityType", params.entityType);
  if (params?.actorId) sp.set("actorId", params.actorId);
  if (params?.success) sp.set("success", params.success);
  if (params?.projectId) sp.set("projectId", params.projectId);
  if (params?.dateFrom) sp.set("dateFrom", params.dateFrom);
  if (params?.dateTo) sp.set("dateTo", params.dateTo);

  const qs = sp.toString();
  const format = params?.format === "xlsx" ? "xlsx" : "csv";
  const res = await fetch(`/api/admin/audit/export?format=${format}${qs ? `&${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to export audit logs");

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.${format}`;
  a.click();
  URL.revokeObjectURL(url);
}

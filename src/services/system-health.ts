import type {
  SystemHealthDashboard,
  HealthHistoryResponse,
  DiagnosticsResult,
  MonitoringSettingsData,
  AlertListResponse,
  AlertItem,
} from "@/types/admin";

export async function getSystemHealthDashboard(): Promise<SystemHealthDashboard> {
  const res = await fetch("/api/admin/system-health");
  if (!res.ok) throw new Error("Failed to fetch system health dashboard");
  return res.json();
}

export async function getSystemHealthHistory(params?: {
  period?: string;
  page?: number;
  pageSize?: number;
}): Promise<HealthHistoryResponse> {
  const sp = new URLSearchParams();
  if (params?.period) sp.set("period", params.period);
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));
  const qs = sp.toString();
  const res = await fetch(`/api/admin/system-health/history${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch health history");
  return res.json();
}

export async function runDiagnostics(): Promise<DiagnosticsResult> {
  const res = await fetch("/api/admin/system-health/diagnostics", { method: "POST" });
  if (!res.ok) throw new Error("Failed to run diagnostics");
  return res.json();
}

export async function getMonitoringSettings(): Promise<MonitoringSettingsData> {
  const res = await fetch("/api/admin/system-health/settings");
  if (!res.ok) throw new Error("Failed to fetch monitoring settings");
  return res.json();
}

export async function updateMonitoringSettings(
  data: Partial<MonitoringSettingsData>
): Promise<MonitoringSettingsData> {
  const res = await fetch("/api/admin/system-health/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update monitoring settings");
  return res.json();
}

export async function getAlerts(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  severity?: string;
  source?: string;
}): Promise<AlertListResponse> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));
  if (params?.status) sp.set("status", params.status);
  if (params?.severity) sp.set("severity", params.severity);
  if (params?.source) sp.set("source", params.source);
  const qs = sp.toString();
  const res = await fetch(`/api/admin/system-health/alerts${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}

export async function createAlert(data: {
  title: string;
  description?: string;
  severity: string;
  source: string;
}): Promise<AlertItem> {
  const res = await fetch("/api/admin/system-health/alerts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create alert");
  return res.json();
}

export async function resolveAlert(id: string): Promise<AlertItem> {
  const res = await fetch(`/api/admin/system-health/alerts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "RESOLVED" }),
  });
  if (!res.ok) throw new Error("Failed to resolve alert");
  return res.json();
}

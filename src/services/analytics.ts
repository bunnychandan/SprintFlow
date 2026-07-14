import type { DashboardAnalytics, ProjectAnalytics, SprintAnalytics, ReleaseAnalytics, EpicAnalytics, VelocityDataPoint, BurndownChart, BurnupChart, CumulativeFlowChart, CycleTimeChart, LeadTimeChart, WorkloadChart, TeamPerformance, AnalyticsFilters, ExportPayload } from "@/types/analytics";

export async function getDashboardAnalytics(filters?: AnalyticsFilters): Promise<DashboardAnalytics> {
  const sp = new URLSearchParams();
  if (filters?.dateRange?.from) sp.set("from", filters.dateRange.from);
  if (filters?.dateRange?.to) sp.set("to", filters.dateRange.to);
  const qs = sp.toString();
  const res = await fetch(`/api/analytics/dashboard${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch dashboard analytics");
  return res.json();
}

export async function getProjectAnalytics(id: string, filters?: AnalyticsFilters): Promise<ProjectAnalytics> {
  const sp = new URLSearchParams();
  if (filters?.dateRange?.from) sp.set("from", filters.dateRange.from);
  if (filters?.dateRange?.to) sp.set("to", filters.dateRange.to);
  const qs = sp.toString();
  const res = await fetch(`/api/analytics/projects/${id}${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch project analytics");
  return res.json();
}

export async function getSprintAnalytics(id: string): Promise<SprintAnalytics> {
  const res = await fetch(`/api/analytics/sprints/${id}`);
  if (!res.ok) throw new Error("Failed to fetch sprint analytics");
  return res.json();
}

export async function getReleaseAnalytics(id: string): Promise<ReleaseAnalytics> {
  const res = await fetch(`/api/analytics/releases/${id}`);
  if (!res.ok) throw new Error("Failed to fetch release analytics");
  return res.json();
}

export async function getEpicAnalytics(id: string): Promise<EpicAnalytics> {
  const res = await fetch(`/api/analytics/epics/${id}`);
  if (!res.ok) throw new Error("Failed to fetch epic analytics");
  return res.json();
}

export async function getVelocity(filters?: AnalyticsFilters): Promise<VelocityDataPoint[]> {
  const sp = new URLSearchParams();
  if (filters?.projectId) sp.set("projectId", filters.projectId);
  const qs = sp.toString();
  const res = await fetch(`/api/analytics/velocity${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch velocity data");
  return res.json();
}

export async function getBurndown(sprintId?: string): Promise<BurndownChart | any[]> {
  const sp = new URLSearchParams();
  if (sprintId) sp.set("sprintId", sprintId);
  const qs = sp.toString();
  const res = await fetch(`/api/analytics/burndown${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch burndown data");
  return res.json();
}

export async function getBurnup(sprintId?: string): Promise<BurnupChart | any[]> {
  const sp = new URLSearchParams();
  if (sprintId) sp.set("sprintId", sprintId);
  const qs = sp.toString();
  const res = await fetch(`/api/analytics/burnup${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch burnup data");
  return res.json();
}

export async function getCycleTime(projectId: string): Promise<CycleTimeChart> {
  const res = await fetch(`/api/analytics/cycle-time?projectId=${projectId}`);
  if (!res.ok) throw new Error("Failed to fetch cycle time");
  return res.json();
}

export async function getLeadTime(projectId: string): Promise<LeadTimeChart> {
  const res = await fetch(`/api/analytics/lead-time?projectId=${projectId}`);
  if (!res.ok) throw new Error("Failed to fetch lead time");
  return res.json();
}

export async function getWorkload(filters?: AnalyticsFilters): Promise<WorkloadChart> {
  const sp = new URLSearchParams();
  if (filters?.projectId) sp.set("projectId", filters.projectId);
  const qs = sp.toString();
  const res = await fetch(`/api/analytics/workload${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch workload data");
  return res.json();
}

export async function getTeamAnalytics(filters?: AnalyticsFilters): Promise<TeamPerformance[]> {
  const sp = new URLSearchParams();
  if (filters?.projectId) sp.set("projectId", filters.projectId);
  if (filters?.dateRange?.from) sp.set("from", filters.dateRange.from);
  if (filters?.dateRange?.to) sp.set("to", filters.dateRange.to);
  const qs = sp.toString();
  const res = await fetch(`/api/analytics/team${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch team analytics");
  return res.json();
}

export async function getCumulativeFlow(projectId?: string): Promise<CumulativeFlowChart> {
  const sp = new URLSearchParams();
  if (projectId) sp.set("projectId", projectId);
  const qs = sp.toString();
  const res = await fetch(`/api/analytics/cumulative-flow${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch cumulative flow");
  return res.json();
}

export async function exportAnalytics(payload: ExportPayload) {
  const sp = new URLSearchParams();
  sp.set("format", payload.format);
  sp.set("type", payload.type);
  if (payload.entityId) sp.set("entityId", payload.entityId);
  const qs = sp.toString();
  const res = await fetch(`/api/analytics/export?${qs}`);
  if (!res.ok) throw new Error("Failed to export analytics");
  if (payload.format === "csv") return res.blob();
  return res.json();
}

import type { Deployment, Pipeline, DevOpsDashboard, DevOpsFilters, DevOpsStatistics, DevOpsTimelineEvent, PaginatedResult, ExportPayload } from "@/types/devops";

export async function getDashboard(): Promise<DevOpsDashboard> {
  const res = await fetch("/api/devops/dashboard");
  if (!res.ok) throw new Error("Failed to fetch devops dashboard");
  return res.json();
}

export async function getDeployments(filters?: DevOpsFilters): Promise<PaginatedResult<Deployment>> {
  const sp = new URLSearchParams();
  if (filters?.projectId) sp.set("projectId", filters.projectId);
  if (filters?.environment) sp.set("environment", filters.environment);
  if (filters?.status) sp.set("status", filters.status);
  if (filters?.search) sp.set("search", filters.search);
  if (filters?.dateFrom) sp.set("from", filters.dateFrom);
  if (filters?.dateTo) sp.set("to", filters.dateTo);
  if (filters?.page) sp.set("page", String(filters.page));
  if (filters?.pageSize) sp.set("pageSize", String(filters.pageSize));
  const qs = sp.toString();
  const res = await fetch(`/api/devops/deployments${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch deployments");
  return res.json();
}

export async function getDeployment(id: string): Promise<Deployment> {
  const res = await fetch(`/api/devops/deployments/${id}`);
  if (!res.ok) throw new Error("Failed to fetch deployment");
  return res.json();
}

export async function createDeployment(data: { projectId: string; version: string; environment: string; releaseId?: string; commitHash?: string; branch?: string }): Promise<Deployment> {
  const res = await fetch("/api/devops/deployments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create deployment");
  return res.json();
}

export async function updateDeployment(id: string, data: { version?: string; environment?: string; commitHash?: string; branch?: string }): Promise<Deployment> {
  const res = await fetch(`/api/devops/deployments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update deployment");
  return res.json();
}

export async function startDeployment(id: string): Promise<Deployment> {
  const res = await fetch(`/api/devops/deployments/${id}/start`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to start deployment");
  return res.json();
}

export async function cancelDeployment(id: string): Promise<Deployment> {
  const res = await fetch(`/api/devops/deployments/${id}/cancel`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to cancel deployment");
  return res.json();
}

export async function rollbackDeployment(id: string): Promise<Deployment> {
  const res = await fetch(`/api/devops/deployments/${id}/rollback`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to rollback deployment");
  return res.json();
}

export async function getPipelines(filters?: DevOpsFilters): Promise<Pipeline[]> {
  const sp = new URLSearchParams();
  if (filters?.projectId) sp.set("projectId", filters.projectId);
  if (filters?.status) sp.set("status", filters.status);
  if (filters?.search) sp.set("search", filters.search);
  const qs = sp.toString();
  const res = await fetch(`/api/devops/pipelines${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch pipelines");
  return res.json();
}

export async function getPipeline(id: string): Promise<Pipeline> {
  const res = await fetch(`/api/devops/pipelines/${id}`);
  if (!res.ok) throw new Error("Failed to fetch pipeline");
  return res.json();
}

export async function createPipeline(data: { projectId: string; name: string; provider?: string; configuration?: Record<string, unknown> }): Promise<Pipeline> {
  const res = await fetch("/api/devops/pipelines", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create pipeline");
  return res.json();
}

export async function updatePipeline(id: string, data: { name?: string; provider?: string; configuration?: Record<string, unknown> }): Promise<Pipeline> {
  const res = await fetch(`/api/devops/pipelines/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update pipeline");
  return res.json();
}

export async function runPipeline(id: string): Promise<Pipeline> {
  const res = await fetch(`/api/devops/pipelines/${id}/run`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to run pipeline");
  return res.json();
}

export async function getLogs(deploymentId: string): Promise<string[]> {
  const res = await fetch(`/api/devops/logs?deploymentId=${deploymentId}`);
  if (!res.ok) throw new Error("Failed to fetch logs");
  return res.json();
}

export async function exportData(payload: ExportPayload): Promise<Blob | unknown> {
  const sp = new URLSearchParams();
  sp.set("format", payload.format);
  sp.set("type", payload.type);
  const qs = sp.toString();
  const res = await fetch(`/api/devops/export?${qs}`);
  if (!res.ok) throw new Error("Failed to export data");
  if (payload.format === "csv") return res.blob();
  return res.json();
}

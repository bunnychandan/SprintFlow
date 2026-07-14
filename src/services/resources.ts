import type { Resource, ResourceAvailability, ResourceCapacity, ResourceAllocation, WorkloadSummary, TimeEntry, Timesheet, TimesheetApproval, CalendarEvent, Holiday, Leave, CapacityChart, UtilizationChart, ResourceReport, ResourceFilters } from "@/types/resources";

export async function getResources(filters?: ResourceFilters): Promise<Resource[]> {
  const sp = new URLSearchParams();
  if (filters?.search) sp.set("search", filters.search);
  if (filters?.department) sp.set("department", filters.department);
  if (filters?.role) sp.set("role", filters.role);
  if (filters?.isActive !== undefined) sp.set("isActive", String(filters.isActive));
  if (filters?.projectId) sp.set("projectId", filters.projectId);
  const qs = sp.toString();
  const res = await fetch(`/api/resources${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch resources");
  return res.json();
}

export async function getResource(id: string): Promise<Resource> {
  const res = await fetch(`/api/resources/${id}`);
  if (!res.ok) throw new Error("Failed to fetch resource");
  return res.json();
}

export async function getWorkload(projectId?: string): Promise<WorkloadSummary[]> {
  const sp = new URLSearchParams();
  if (projectId) sp.set("projectId", projectId);
  const qs = sp.toString();
  const res = await fetch(`/api/resources/workload${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch workload");
  return res.json();
}

export async function getCapacity(filters?: ResourceFilters): Promise<ResourceCapacity[]> {
  const sp = new URLSearchParams();
  if (filters?.dateFrom) sp.set("from", filters.dateFrom);
  if (filters?.dateTo) sp.set("to", filters.dateTo);
  if (filters?.projectId) sp.set("projectId", filters.projectId);
  const qs = sp.toString();
  const res = await fetch(`/api/resources/capacity${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch capacity");
  return res.json();
}

export async function getAvailability(filters?: ResourceFilters): Promise<ResourceAvailability[]> {
  const sp = new URLSearchParams();
  if (filters?.dateFrom) sp.set("from", filters.dateFrom);
  if (filters?.dateTo) sp.set("to", filters.dateTo);
  if (filters?.projectId) sp.set("projectId", filters.projectId);
  const qs = sp.toString();
  const res = await fetch(`/api/resources/availability${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch availability");
  return res.json();
}

export async function getCalendar(filters?: ResourceFilters): Promise<CalendarEvent[]> {
  const sp = new URLSearchParams();
  if (filters?.dateFrom) sp.set("from", filters.dateFrom);
  if (filters?.dateTo) sp.set("to", filters.dateTo);
  if (filters?.userId) sp.set("userId", filters.userId);
  const qs = sp.toString();
  const res = await fetch(`/api/resources/calendar${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch calendar");
  return res.json();
}

export async function getTimesheet(userId?: string, weekStart?: string): Promise<Timesheet[]> {
  const sp = new URLSearchParams();
  if (userId) sp.set("userId", userId);
  if (weekStart) sp.set("weekStart", weekStart);
  const qs = sp.toString();
  const res = await fetch(`/api/resources/timesheet${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch timesheet");
  return res.json();
}

export async function createTimeEntry(data: { taskId: string; description?: string; timeSpent: number; billable: boolean; loggedAt: string; timesheetId?: string }): Promise<TimeEntry> {
  const res = await fetch("/api/resources/timesheet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create time entry");
  return res.json();
}

export async function updateTimeEntry(id: string, data: { description?: string; timeSpent?: number; billable?: boolean; loggedAt?: string }): Promise<TimeEntry> {
  const res = await fetch(`/api/resources/timesheet/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update time entry");
  return res.json();
}

export async function deleteTimeEntry(id: string): Promise<void> {
  const res = await fetch(`/api/resources/timesheet/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete time entry");
}

export async function submitTimesheet(id: string): Promise<Timesheet> {
  const res = await fetch(`/api/resources/timesheet/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("Failed to submit timesheet");
  return res.json();
}

export async function approveTimesheet(id: string): Promise<Timesheet> {
  const res = await fetch(`/api/resources/timesheet/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("Failed to approve timesheet");
  return res.json();
}

export async function rejectTimesheet(id: string, reason: string): Promise<Timesheet> {
  const res = await fetch(`/api/resources/timesheet/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, reason }),
  });
  if (!res.ok) throw new Error("Failed to reject timesheet");
  return res.json();
}

export async function getReports(filters?: ResourceFilters): Promise<ResourceReport> {
  const sp = new URLSearchParams();
  if (filters?.dateFrom) sp.set("from", filters.dateFrom);
  if (filters?.dateTo) sp.set("to", filters.dateTo);
  if (filters?.projectId) sp.set("projectId", filters.projectId);
  const qs = sp.toString();
  const res = await fetch(`/api/resources/reports${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch reports");
  return res.json();
}

export async function exportReports(filters?: ResourceFilters & { format?: "csv" | "json" }): Promise<Blob | ResourceReport> {
  const sp = new URLSearchParams();
  if (filters?.dateFrom) sp.set("from", filters.dateFrom);
  if (filters?.dateTo) sp.set("to", filters.dateTo);
  if (filters?.projectId) sp.set("projectId", filters.projectId);
  if (filters?.format) sp.set("format", filters.format);
  const qs = sp.toString();
  const res = await fetch(`/api/resources/reports/export${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to export reports");
  if (filters?.format === "csv") return res.blob();
  return res.json();
}

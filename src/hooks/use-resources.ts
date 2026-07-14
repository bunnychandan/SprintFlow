"use client";

import { useState, useEffect, useCallback } from "react";
import { getResources, getResource, getWorkload, getCapacity, getAvailability, getCalendar, getTimesheet, createTimeEntry, updateTimeEntry, deleteTimeEntry, submitTimesheet, approveTimesheet, rejectTimesheet, getReports, exportReports } from "@/services/resources";
import type { Resource, ResourceAvailability, ResourceCapacity, WorkloadSummary, TimeEntry, Timesheet, CalendarEvent, ResourceReport, ResourceFilters } from "@/types/resources";

export function useResources(filters?: ResourceFilters) {
  const [data, setData] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getResources(filters);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load resources");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useResource(id: string | null) {
  const [data, setData] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await getResource(id);
      setData(result);
    } catch { setData(null); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useWorkload(projectId?: string) {
  const [data, setData] = useState<WorkloadSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getWorkload(projectId);
      setData(result);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [projectId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useCapacity(filters?: ResourceFilters) {
  const [data, setData] = useState<ResourceCapacity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getCapacity(filters);
      setData(result);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useAvailability(filters?: ResourceFilters) {
  const [data, setData] = useState<ResourceAvailability[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAvailability(filters);
      setData(result);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useCalendar(filters?: ResourceFilters) {
  const [data, setData] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getCalendar(filters);
      setData(result);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useTimesheet(userId?: string, weekStart?: string) {
  const [data, setData] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getTimesheet(userId, weekStart);
      setData(result);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [userId, weekStart]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useTimeEntryActions() {
  const [loading, setLoading] = useState(false);

  const create = useCallback(async (data: { taskId: string; description?: string; timeSpent: number; billable: boolean; loggedAt: string; timesheetId?: string }) => {
    setLoading(true);
    try { return await createTimeEntry(data); }
    finally { setLoading(false); }
  }, []);

  const update = useCallback(async (id: string, data: { description?: string; timeSpent?: number; billable?: boolean; loggedAt?: string }) => {
    setLoading(true);
    try { return await updateTimeEntry(id, data); }
    finally { setLoading(false); }
  }, []);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    try { await deleteTimeEntry(id); }
    finally { setLoading(false); }
  }, []);

  return { create, update, remove, loading };
}

export function useTimesheetActions() {
  const [loading, setLoading] = useState(false);

  const submit = useCallback(async (id: string) => {
    setLoading(true);
    try { return await submitTimesheet(id); }
    finally { setLoading(false); }
  }, []);

  const approve = useCallback(async (id: string) => {
    setLoading(true);
    try { return await approveTimesheet(id); }
    finally { setLoading(false); }
  }, []);

  const reject = useCallback(async (id: string, reason: string) => {
    setLoading(true);
    try { return await rejectTimesheet(id, reason); }
    finally { setLoading(false); }
  }, []);

  return { submit, approve, reject, loading };
}

export function useResourceReports(filters?: ResourceFilters) {
  const [data, setData] = useState<ResourceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getReports(filters);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useReportExport() {
  const [exporting, setExporting] = useState(false);

  const doExport = useCallback(async (filters?: ResourceFilters & { format?: "csv" | "json" }) => {
    setExporting(true);
    try {
      return await exportReports(filters);
    } finally {
      setExporting(false);
    }
  }, []);

  return { doExport, exporting };
}

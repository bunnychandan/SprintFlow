"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getDashboardAnalytics, getProjectAnalytics, getSprintAnalytics,
  getReleaseAnalytics, getEpicAnalytics, getVelocity, getBurndown,
  getBurnup, getCycleTime, getLeadTime, getWorkload, getTeamAnalytics,
  getCumulativeFlow, exportAnalytics,
} from "@/services/analytics";
import type {
  DashboardAnalytics, ProjectAnalytics, SprintAnalytics,
  ReleaseAnalytics, EpicAnalytics, VelocityDataPoint,
  BurndownChart, BurnupChart, CycleTimeChart, LeadTimeChart,
  WorkloadChart, TeamPerformance, CumulativeFlowChart,
  AnalyticsFilters, ExportPayload,
} from "@/types/analytics";

export function useDashboardAnalytics(filters?: AnalyticsFilters) {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDashboardAnalytics(filters);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useProjectAnalytics(id: string | null, filters?: AnalyticsFilters) {
  const [data, setData] = useState<ProjectAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await getProjectAnalytics(id, filters);
      setData(result);
    } catch { setData(null); }
    finally { setLoading(false); }
  }, [id, JSON.stringify(filters)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useSprintAnalytics(id: string | null) {
  const [data, setData] = useState<SprintAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await getSprintAnalytics(id);
      setData(result);
    } catch { setData(null); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useReleaseAnalytics(id: string | null) {
  const [data, setData] = useState<ReleaseAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await getReleaseAnalytics(id);
      setData(result);
    } catch { setData(null); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useEpicAnalytics(id: string | null) {
  const [data, setData] = useState<EpicAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await getEpicAnalytics(id);
      setData(result);
    } catch { setData(null); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useVelocity(filters?: AnalyticsFilters) {
  const [data, setData] = useState<VelocityDataPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getVelocity(filters);
      setData(result);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useBurndown(sprintId?: string) {
  const [data, setData] = useState<BurndownChart | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getBurndown(sprintId);
      setData(Array.isArray(result) ? null : result);
    } catch { setData(null); }
    finally { setLoading(false); }
  }, [sprintId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useBurnup(sprintId?: string) {
  const [data, setData] = useState<BurnupChart | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getBurnup(sprintId);
      setData(Array.isArray(result) ? null : result);
    } catch { setData(null); }
    finally { setLoading(false); }
  }, [sprintId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useCycleTime(projectId: string) {
  const [data, setData] = useState<CycleTimeChart | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const result = await getCycleTime(projectId);
      setData(result);
    } catch { setData(null); }
    finally { setLoading(false); }
  }, [projectId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useLeadTime(projectId: string) {
  const [data, setData] = useState<LeadTimeChart | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const result = await getLeadTime(projectId);
      setData(result);
    } catch { setData(null); }
    finally { setLoading(false); }
  }, [projectId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useWorkload(filters?: AnalyticsFilters) {
  const [data, setData] = useState<WorkloadChart | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getWorkload(filters);
      setData(result);
    } catch { setData(null); }
    finally { setLoading(false); }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useTeamAnalytics(filters?: AnalyticsFilters) {
  const [data, setData] = useState<TeamPerformance[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getTeamAnalytics(filters);
      setData(result);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useCumulativeFlow(projectId?: string) {
  const [data, setData] = useState<CumulativeFlowChart | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getCumulativeFlow(projectId);
      setData(result);
    } catch { setData(null); }
    finally { setLoading(false); }
  }, [projectId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useExportAnalytics() {
  const [exporting, setExporting] = useState(false);

  const doExport = useCallback(async (payload: ExportPayload) => {
    setExporting(true);
    try {
      return await exportAnalytics(payload);
    } finally {
      setExporting(false);
    }
  }, []);

  return { doExport, exporting };
}

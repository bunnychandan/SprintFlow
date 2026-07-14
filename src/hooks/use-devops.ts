"use client";

import { useState, useEffect, useCallback } from "react";
import { getDashboard, getDeployments, getDeployment, createDeployment, updateDeployment, startDeployment, cancelDeployment, rollbackDeployment, getPipelines, getPipeline, createPipeline, updatePipeline, runPipeline, getLogs, exportData } from "@/services/devops";
import type { Deployment, Pipeline, DevOpsDashboard, DevOpsFilters, PaginatedResult } from "@/types/devops";

export function useDashboard() {
  const [data, setData] = useState<DevOpsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDashboard();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useDeployments(filters?: DevOpsFilters) {
  const [data, setData] = useState<PaginatedResult<Deployment>>({ data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDeployments(filters);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load deployments");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useDeployment(id: string | null) {
  const [data, setData] = useState<Deployment | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await getDeployment(id);
      setData(result);
    } catch { setData(null); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useDeploymentActions() {
  const [loading, setLoading] = useState(false);

  const create = useCallback(async (data: { projectId: string; version: string; environment: string; releaseId?: string; commitHash?: string; branch?: string }) => {
    setLoading(true);
    try { return await createDeployment(data); }
    finally { setLoading(false); }
  }, []);

  const update = useCallback(async (id: string, data: { version?: string; environment?: string; commitHash?: string; branch?: string }) => {
    setLoading(true);
    try { return await updateDeployment(id, data); }
    finally { setLoading(false); }
  }, []);

  const start = useCallback(async (id: string) => {
    setLoading(true);
    try { return await startDeployment(id); }
    finally { setLoading(false); }
  }, []);

  const cancel = useCallback(async (id: string) => {
    setLoading(true);
    try { return await cancelDeployment(id); }
    finally { setLoading(false); }
  }, []);

  const rollback = useCallback(async (id: string) => {
    setLoading(true);
    try { return await rollbackDeployment(id); }
    finally { setLoading(false); }
  }, []);

  return { create, update, start, cancel, rollback, loading };
}

export function usePipelines(filters?: DevOpsFilters) {
  const [data, setData] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPipelines(filters);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load pipelines");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function usePipeline(id: string | null) {
  const [data, setData] = useState<Pipeline | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await getPipeline(id);
      setData(result);
    } catch { setData(null); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function usePipelineActions() {
  const [loading, setLoading] = useState(false);

  const create = useCallback(async (data: { projectId: string; name: string; provider?: string; configuration?: Record<string, unknown> }) => {
    setLoading(true);
    try { return await createPipeline(data); }
    finally { setLoading(false); }
  }, []);

  const update = useCallback(async (id: string, data: { name?: string; provider?: string; configuration?: Record<string, unknown> }) => {
    setLoading(true);
    try { return await updatePipeline(id, data); }
    finally { setLoading(false); }
  }, []);

  const run = useCallback(async (id: string) => {
    setLoading(true);
    try { return await runPipeline(id); }
    finally { setLoading(false); }
  }, []);

  return { create, update, run, loading };
}

export function useLogs(deploymentId: string | null) {
  const [data, setData] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!deploymentId) return;
    setLoading(true);
    try {
      const result = await getLogs(deploymentId);
      setData(result);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [deploymentId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

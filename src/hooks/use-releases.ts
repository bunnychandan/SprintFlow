"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getReleases, getRelease, createRelease, updateRelease, deleteRelease,
  publishRelease, cancelRelease, getReleaseStatistics,
} from "@/services/releases";
import type { ReleaseListResponse, ReleaseDetail, ReleaseStatistics, ReleaseListParams } from "@/types/agile";

export function useReleases(params?: ReleaseListParams) {
  const [data, setData] = useState<ReleaseListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getReleases(params);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load releases");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useRelease(id: string | null) {
  const [release, setRelease] = useState<ReleaseDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getRelease(id);
      setRelease(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load release");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  const update = useCallback(async (data: Record<string, unknown>) => {
    if (!id) return;
    const result = await updateRelease(id, data);
    setRelease((prev) => prev ? { ...prev, ...result.release } : prev);
    return result;
  }, [id]);

  const remove = useCallback(async () => {
    if (!id) return;
    await deleteRelease(id);
  }, [id]);

  const publish = useCallback(async () => {
    if (!id) return;
    const result = await publishRelease(id);
    setRelease((prev) => prev ? { ...prev, ...result.release } : prev);
    return result;
  }, [id]);

  const cancel = useCallback(async () => {
    if (!id) return;
    const result = await cancelRelease(id);
    setRelease((prev) => prev ? { ...prev, ...result.release } : prev);
    return result;
  }, [id]);

  return { release, loading, error, refetch: fetch, update, remove, publish, cancel };
}

export function useReleaseStatistics(id: string | null) {
  const [stats, setStats] = useState<ReleaseStatistics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await getReleaseStatistics(id);
      setStats(result);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { stats, loading, refetch: fetch };
}

export function useReleaseActions() {
  const create = useCallback(async (data: { projectId: string; name: string; version?: string | null; description?: string | null; startDate?: string | null; targetDate?: string | null }) => {
    return createRelease(data);
  }, []);

  return { create };
}

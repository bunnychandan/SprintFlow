"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getEpics, getEpic, createEpic, updateEpic, deleteEpic,
  getEpicStatistics, getEpicTimeline,
} from "@/services/epics";
import type { EpicListResponse, EpicDetail, EpicStatistics, EpicTimelineResponse, EpicListParams } from "@/types/agile";

export function useEpics(params?: EpicListParams) {
  const [data, setData] = useState<EpicListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getEpics(params);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load epics");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useEpic(id: string | null) {
  const [epic, setEpic] = useState<EpicDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getEpic(id);
      setEpic(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load epic");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  const update = useCallback(async (data: Record<string, unknown>) => {
    if (!id) return;
    const result = await updateEpic(id, data);
    setEpic((prev) => prev ? { ...prev, ...result.epic } : prev);
    return result;
  }, [id]);

  const remove = useCallback(async () => {
    if (!id) return;
    await deleteEpic(id);
  }, [id]);

  return { epic, loading, error, refetch: fetch, update, remove };
}

export function useEpicStatistics(id: string | null) {
  const [stats, setStats] = useState<EpicStatistics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await getEpicStatistics(id);
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

export function useEpicTimeline(id: string | null) {
  const [events, setEvents] = useState<EpicTimelineResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await getEpicTimeline(id);
      setEvents(result);
    } catch {
      setEvents(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { events, loading, refetch: fetch };
}

export function useEpicActions() {
  const create = useCallback(async (data: { projectId: string; title: string; description?: string | null; priority?: string; color?: string; ownerId: string; startDate?: string | null; targetDate?: string | null }) => {
    return createEpic(data);
  }, []);

  return { create };
}

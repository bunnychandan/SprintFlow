"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getSprints, getSprint, createSprint, updateSprint, deleteSprint,
  startSprint, completeSprint, cancelSprint, getSprintStatistics,
  getSprintTimeline, moveTask, bulkSprintAction,
} from "@/services/sprints";
import type { SprintListResponse, SprintDetail, SprintStatistics, SprintTimelineEvent, SprintListParams } from "@/types/sprint";

export function useSprints(params?: SprintListParams) {
  const [data, setData] = useState<SprintListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSprints(params);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load sprints");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useSprint(id: string | null) {
  const [sprint, setSprint] = useState<SprintDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getSprint(id);
      setSprint(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load sprint");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  const update = useCallback(async (data: Record<string, unknown>) => {
    if (!id) return;
    const result = await updateSprint(id, data);
    setSprint((prev) => prev ? { ...prev, ...result.sprint } : prev);
    return result;
  }, [id]);

  const remove = useCallback(async () => {
    if (!id) return;
    await deleteSprint(id);
  }, [id]);

  const start = useCallback(async (data: { goal?: string | null; startDate: string; endDate: string }) => {
    if (!id) return;
    const result = await startSprint(id, data);
    setSprint((prev) => prev ? { ...prev, ...result.sprint } : prev);
    return result;
  }, [id]);

  const complete = useCallback(async (forceComplete?: boolean) => {
    if (!id) return;
    const result = await completeSprint(id, forceComplete);
    setSprint((prev) => prev ? { ...prev, ...result.sprint } : prev);
    return result;
  }, [id]);

  const cancel = useCallback(async (reason?: string) => {
    if (!id) return;
    const result = await cancelSprint(id, reason);
    setSprint((prev) => prev ? { ...prev, ...result.sprint } : prev);
    return result;
  }, [id]);

  return { sprint, loading, error, refetch: fetch, update, remove, start, complete, cancel };
}

export function useSprintStatistics(id: string | null) {
  const [stats, setStats] = useState<SprintStatistics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await getSprintStatistics(id);
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

export function useSprintTimeline(id: string | null) {
  const [events, setEvents] = useState<SprintTimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await getSprintTimeline(id);
      setEvents(result);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { events, loading, refetch: fetch };
}

export function useSprintBacklog(id: string | null) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const sprint = await getSprint(id);
      setTasks(sprint.tasks || []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  const moveTaskToSprint = useCallback(async (taskId: string, targetSprintId: string | null) => {
    if (!id) return;
    await moveTask(id, taskId, targetSprintId);
    await fetch();
  }, [id, fetch]);

  return { tasks, loading, refetch: fetch, moveTask: moveTaskToSprint };
}

export function useSprintActions() {
  const create = useCallback(async (data: { projectId: string; name: string; goal?: string | null; startDate?: string | null; endDate?: string | null }) => {
    return createSprint(data);
  }, []);

  const bulkAction = useCallback(async (ids: string[], action: string, forceComplete?: boolean) => {
    return bulkSprintAction(ids, action, forceComplete);
  }, []);

  return { create, bulkAction };
}

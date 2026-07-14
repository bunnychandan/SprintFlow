"use client";

import { useState, useEffect, useCallback } from "react";
import { getBacklog, reorderBacklogTask, moveBacklogTasks, bulkBacklogAction } from "@/services/backlog";
import type { BacklogResponse, BacklogListParams } from "@/types/agile";

export function useBacklog(projectId: string, params?: BacklogListParams) {
  const [data, setData] = useState<BacklogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getBacklog(projectId, params);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load backlog");
    } finally {
      setLoading(false);
    }
  }, [projectId, JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useBacklogActions(projectId: string) {
  const reorder = useCallback(async (payload: { taskId: string; targetIndex: number }) => {
    return reorderBacklogTask(projectId, payload);
  }, [projectId]);

  const move = useCallback(async (payload: { taskIds: string[]; targetSprintId?: string | null; targetEpicId?: string | null; targetReleaseId?: string | null }) => {
    return moveBacklogTasks(projectId, payload);
  }, [projectId]);

  const bulk = useCallback(async (payload: { taskIds: string[]; action: string; value: string | null }) => {
    return bulkBacklogAction(projectId, payload);
  }, [projectId]);

  return { reorder, move, bulk };
}

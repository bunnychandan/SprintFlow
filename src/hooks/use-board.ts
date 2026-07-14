"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getBoard, moveTask, reorderTask, getBoardStatistics,
} from "@/services/board";
import type { BoardData, BoardFilters, BoardStatistics, MoveTaskPayload, ReorderTaskPayload } from "@/types/board";

export function useBoard(projectId: string, sprintId?: string, filters?: BoardFilters) {
  const [board, setBoard] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoard = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getBoard(projectId, sprintId, filters);
      setBoard(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load board");
    } finally {
      setLoading(false);
    }
  }, [projectId, sprintId, JSON.stringify(filters)]);

  useEffect(() => { fetchBoard(); }, [fetchBoard]);

  const move = useCallback(async (payload: MoveTaskPayload) => {
    if (!board) return;
    const prev = structuredClone(board);
    setBoard((b) => {
      if (!b) return b;
      const newColumns = b.columns.map((col) => {
        if (col.status === payload.targetStatus) {
          const task = b.columns.flatMap((c) => c.tasks).find((t) => t.id === payload.taskId);
          if (task) {
            const updated = { ...task, status: payload.targetStatus };
            return { ...col, tasks: [...col.tasks, updated] };
          }
        }
        return { ...col, tasks: col.tasks.filter((t) => t.id !== payload.taskId) };
      });
      return { ...b, columns: newColumns };
    });
    try {
      await moveTask(projectId, payload);
    } catch {
      setBoard(prev);
      throw new Error("Failed to move task");
    }
  }, [board, projectId]);

  const reorder = useCallback(async (payload: ReorderTaskPayload) => {
    if (!board) return;
    const prev = structuredClone(board);
    setBoard((b) => {
      if (!b) return b;
      const newColumns = b.columns.map((col) => {
        if (col.status !== payload.status) return col;
        const task = col.tasks.find((t) => t.id === payload.taskId);
        if (!task) return col;
        const without = col.tasks.filter((t) => t.id !== payload.taskId);
        const reordered = [...without.slice(0, payload.targetIndex), task, ...without.slice(payload.targetIndex)];
        return { ...col, tasks: reordered };
      });
      return { ...b, columns: newColumns };
    });
    try {
      await reorderTask(projectId, payload);
    } catch {
      setBoard(prev);
    }
  }, [board, projectId]);

  return { board, loading, error, refetch: fetchBoard, move, reorder };
}

export function useBoardStatistics(projectId: string, sprintId?: string) {
  const [stats, setStats] = useState<BoardStatistics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await getBoardStatistics(projectId, sprintId);
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, sprintId]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}

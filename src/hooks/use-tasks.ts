"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getTasks, getTask, createTask, updateTask, deleteTask,
  archiveTask, restoreTask, bulkTaskAction, duplicateTask,
  getTaskHistory, getTaskActivity, getTaskAttachments,
  addTaskComment, deleteTaskComment, logWork,
  addChecklistItem, updateChecklistItem, deleteChecklistItem,
  addTaskRelationship, deleteTaskRelationship,
} from "@/services/tasks";
import type { TaskListResponse, TaskDetail, TaskListParams } from "@/types/task";

export function useTasks(params?: TaskListParams) {
  const [data, setData] = useState<TaskListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getTasks(params);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useTask(id: string | null) {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getTask(id);
      setTask(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load task");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  const update = useCallback(async (data: Record<string, unknown>) => {
    if (!id) return;
    const result = await updateTask(id, data);
    setTask((prev) => prev ? { ...prev, ...result.task } : prev);
    return result;
  }, [id]);

  const remove = useCallback(async () => {
    if (!id) return;
    await deleteTask(id);
  }, [id]);

  const archive = useCallback(async () => {
    if (!id) return;
    const result = await archiveTask(id);
    setTask((prev) => prev ? { ...prev, ...result.task, archivedAt: new Date().toISOString() } : prev);
    return result;
  }, [id]);

  const restore = useCallback(async () => {
    if (!id) return;
    const result = await restoreTask(id);
    setTask((prev) => prev ? { ...prev, ...result.task, archivedAt: null } : prev);
    return result;
  }, [id]);

  const duplicate = useCallback(async () => {
    if (!id) return;
    return duplicateTask(id);
  }, [id]);

  const addComment = useCallback(async (content: string) => {
    if (!id) return;
    const result = await addTaskComment(id, content);
    setTask((prev) => prev ? {
      ...prev,
      comments: [...prev.comments, result.comment],
    } : prev);
    return result;
  }, [id]);

  const deleteComment = useCallback(async (commentId: string) => {
    if (!id) return;
    await deleteTaskComment(id, commentId);
    setTask((prev) => prev ? {
      ...prev,
      comments: prev.comments.filter((c) => c.id !== commentId),
    } : prev);
  }, [id]);

  const logWorkTime = useCallback(async (data: { timeSpent: number; description?: string; loggedAt?: string }) => {
    if (!id) return;
    const result = await logWork(id, data);
    setTask((prev) => prev ? {
      ...prev,
      workLogs: [...(prev.workLogs || []), result.workLog],
      timeSpent: (prev.timeSpent || 0) + data.timeSpent,
      timeRemaining: prev.timeRemaining !== null ? Math.max(0, prev.timeRemaining - data.timeSpent) : null,
    } : prev);
    return result;
  }, [id]);

  const addChecklist = useCallback(async (title: string) => {
    if (!id) return;
    const result = await addChecklistItem(id, title);
    setTask((prev) => prev ? {
      ...prev,
      checklist: [...(prev.checklist || []), result.item],
    } : prev);
    return result;
  }, [id]);

  const updateChecklist = useCallback(async (itemId: string, data: Record<string, unknown>) => {
    if (!id) return;
    const result = await updateChecklistItem(id, itemId, data);
    setTask((prev) => prev ? {
      ...prev,
      checklist: prev.checklist.map((c) => c.id === itemId ? { ...c, ...result.item } : c),
    } : prev);
    return result;
  }, [id]);

  const deleteChecklist = useCallback(async (itemId: string) => {
    if (!id) return;
    await deleteChecklistItem(id, itemId);
    setTask((prev) => prev ? {
      ...prev,
      checklist: prev.checklist.filter((c) => c.id !== itemId),
    } : prev);
  }, [id]);

  const addRelationship = useCallback(async (relatedTaskId: string, type: string) => {
    if (!id) return;
    const result = await addTaskRelationship(id, relatedTaskId, type);
    setTask((prev) => prev ? {
      ...prev,
      relationships: [...(prev.relationships || []), result.relationship],
    } : prev);
    return result;
  }, [id]);

  const deleteRelationship = useCallback(async (relationshipId: string) => {
    if (!id) return;
    await deleteTaskRelationship(id, relationshipId);
    setTask((prev) => prev ? {
      ...prev,
      relationships: prev.relationships.filter((r) => r.id !== relationshipId),
    } : prev);
  }, [id]);

  return {
    task, loading, error, refetch: fetch,
    update, remove, archive, restore, duplicate,
    addComment, deleteComment, logWorkTime,
    addChecklist, updateChecklist, deleteChecklist,
    addRelationship, deleteRelationship,
  };
}

export function useTaskHistory(id: string | null) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await getTaskHistory(id);
      setHistory(result);
    } catch { setHistory([]); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { history, loading, refetch: fetch };
}

export function useTaskActivity(id: string | null) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await getTaskActivity(id);
      setActivities(result);
    } catch { setActivities([]); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { activities, loading, refetch: fetch };
}

export function useTaskAttachments(id: string | null) {
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await getTaskAttachments(id);
      setAttachments(result);
    } catch { setAttachments([]); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { attachments, loading, refetch: fetch };
}

export function useTaskWorklogs(id: string | null) {
  const [workLogs, setWorkLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await globalThis.fetch(`/api/tasks/${id}/worklogs`);
      if (res.ok) setWorkLogs(await res.json());
    } catch { setWorkLogs([]); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return { workLogs, loading, refetch: fetchLogs };
}

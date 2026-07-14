"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getProjects, getProject, createProject, updateProject, deleteProject,
  archiveProject, restoreProject, getProjectStats, getProjectTimeline,
  getProjectFiles, getProjectMembers, addProjectMember, removeProjectMember,
  updateProjectMemberRole, transferProjectOwnership, bulkProjectAction,
  toggleProjectFavorite,
} from "@/services/projects";
import type { ProjectListResponse, ProjectDetail, ProjectStats, ProjectTimelineEvent, ProjectFile, ProjectMemberItem, ProjectListParams } from "@/types/project";

export function useProjects(params?: ProjectListParams) {
  const [data, setData] = useState<ProjectListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProjects(params);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useProject(id: string | null) {
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getProject(id);
      setProject(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  const update = useCallback(async (data: Record<string, unknown>) => {
    if (!id) return;
    const result = await updateProject(id, data);
    setProject((prev) => prev ? { ...prev, ...result.project } : prev);
    return result;
  }, [id]);

  const remove = useCallback(async () => {
    if (!id) return;
    await deleteProject(id);
  }, [id]);

  const archive = useCallback(async () => {
    if (!id) return;
    const result = await archiveProject(id);
    setProject((prev) => prev ? { ...prev, status: "ARCHIVED", archivedAt: new Date().toISOString() } : prev);
    return result;
  }, [id]);

  const restore = useCallback(async () => {
    if (!id) return;
    const result = await restoreProject(id);
    setProject((prev) => prev ? { ...prev, status: result.project?.status || prev.status, archivedAt: null } : prev);
    return result;
  }, [id]);

  return { project, loading, error, refetch: fetch, update, remove, archive, restore };
}

export function useProjectMembers(projectId: string | null) {
  const [members, setMembers] = useState<ProjectMemberItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const result = await getProjectMembers(projectId);
      setMembers(Array.isArray(result) ? result : []);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetch(); }, [fetch]);

  const add = useCallback(async (email: string, role: string) => {
    if (!projectId) return;
    await addProjectMember(projectId, { email, role });
    await fetch();
  }, [projectId, fetch]);

  const remove = useCallback(async (userId: string) => {
    if (!projectId) return;
    await removeProjectMember(projectId, userId);
    await fetch();
  }, [projectId, fetch]);

  const updateRole = useCallback(async (userId: string, role: string) => {
    if (!projectId) return;
    await updateProjectMemberRole(projectId, userId, role);
    await fetch();
  }, [projectId, fetch]);

  return { members, loading, refetch: fetch, add, remove, updateRole };
}

export function useProjectStatistics(id: string | null) {
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await getProjectStats(id);
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

export function useProjectTimeline(id: string | null) {
  const [events, setEvents] = useState<ProjectTimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await getProjectTimeline(id);
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

export function useProjectFiles(id: string | null) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await getProjectFiles(id);
      setFiles(result);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { files, loading, refetch: fetch };
}

export function useProjectActions() {
  const [bulkLoading, setBulkLoading] = useState(false);

  const create = useCallback(async (data: { name: string; code: string; description?: string | null; visibility?: string; color?: string; startDate?: string | null; targetDate?: string | null }) => {
    return createProject(data);
  }, []);

  const bulkAction = useCallback(async (ids: string[], action: string) => {
    setBulkLoading(true);
    try {
      return await bulkProjectAction(ids, action);
    } finally {
      setBulkLoading(false);
    }
  }, []);

  const transferOwnership = useCallback(async (id: string, newOwnerId: string) => {
    return transferProjectOwnership(id, newOwnerId);
  }, []);

  const toggleFavorite = useCallback(async (id: string, favorite: boolean) => {
    return toggleProjectFavorite(id, favorite);
  }, []);

  return { create, bulkAction, transferOwnership, toggleFavorite, bulkLoading };
}

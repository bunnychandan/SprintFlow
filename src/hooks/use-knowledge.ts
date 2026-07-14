"use client";

import { useState, useEffect, useCallback } from "react";
import { getKnowledgeBases, getKnowledgeBase, createKnowledgeBase, updateKnowledgeBase, deleteKnowledgeBase } from "@/services/knowledge";
import type { KnowledgeBaseItem, KnowledgeBaseDetail, ListResponse, QueryParams, CreateKnowledgeBasePayload, UpdateKnowledgeBasePayload } from "@/types/documentation";

export function useKnowledgeBases(params?: QueryParams) {
  const [data, setData] = useState<ListResponse<KnowledgeBaseItem>>({ data: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getKnowledgeBases(params);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load knowledge bases");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useKnowledgeBase(id: string | null) {
  const [data, setData] = useState<KnowledgeBaseDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await getKnowledgeBase(id);
      setData(result);
    } catch { setData(null); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useKnowledgeBaseActions() {
  const [loading, setLoading] = useState(false);

  const create = useCallback(async (data: CreateKnowledgeBasePayload) => {
    setLoading(true);
    try { return await createKnowledgeBase(data); }
    finally { setLoading(false); }
  }, []);

  const update = useCallback(async (id: string, data: UpdateKnowledgeBasePayload) => {
    setLoading(true);
    try { return await updateKnowledgeBase(id, data); }
    finally { setLoading(false); }
  }, []);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    try { await deleteKnowledgeBase(id); }
    finally { setLoading(false); }
  }, []);

  return { create, update, remove, loading };
}

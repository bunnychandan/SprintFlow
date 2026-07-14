"use client";

import { useState, useEffect, useCallback } from "react";
import { getDocuments, getDocument, createDocument, updateDocument, deleteDocument, publishDocument, archiveDocument, restoreDocument, duplicateDocument, getDocumentVersions, restoreDocumentVersion, getDocumentComments, createDocumentComment, updateDocumentComment, deleteDocumentComment, toggleDocumentFavorite, removeDocumentFavorite, searchDocuments, getDocumentStatistics, getDocumentTimeline, exportDocument } from "@/services/documents";
import type { DocumentItem, DocumentDetail, DocumentCommentItem, DocumentVersionItem, DocumentTimelineEvent, DocumentStatistics, SearchResult, ListResponse, QueryParams, CreateDocumentPayload, UpdateDocumentPayload, CreateCommentPayload, UpdateCommentPayload } from "@/types/documentation";

export function useDocuments(params?: QueryParams) {
  const [data, setData] = useState<ListResponse<DocumentItem>>({ data: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDocuments(params);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useDocument(id: string | null) {
  const [data, setData] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await getDocument(id);
      setData(result);
    } catch { setData(null); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useDocumentActions() {
  const [loading, setLoading] = useState(false);

  const create = useCallback(async (data: CreateDocumentPayload) => {
    setLoading(true);
    try { return await createDocument(data); }
    finally { setLoading(false); }
  }, []);

  const update = useCallback(async (id: string, data: UpdateDocumentPayload) => {
    setLoading(true);
    try { return await updateDocument(id, data); }
    finally { setLoading(false); }
  }, []);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    try { await deleteDocument(id); }
    finally { setLoading(false); }
  }, []);

  return { create, update, remove, loading };
}

export function useDocumentLifecycle() {
  const [loading, setLoading] = useState(false);

  const publish = useCallback(async (id: string, reviewerId?: string) => {
    setLoading(true);
    try { return await publishDocument(id, reviewerId); }
    finally { setLoading(false); }
  }, []);

  const archive = useCallback(async (id: string) => {
    setLoading(true);
    try { return await archiveDocument(id); }
    finally { setLoading(false); }
  }, []);

  const restore = useCallback(async (id: string) => {
    setLoading(true);
    try { return await restoreDocument(id); }
    finally { setLoading(false); }
  }, []);

  const duplicate = useCallback(async (id: string, targetKnowledgeBaseId?: string, includeChildren?: boolean) => {
    setLoading(true);
    try { return await duplicateDocument(id, targetKnowledgeBaseId, includeChildren); }
    finally { setLoading(false); }
  }, []);

  return { publish, archive, restore, duplicate, loading };
}

export function useDocumentVersions(id: string | null) {
  const [data, setData] = useState<DocumentVersionItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await getDocumentVersions(id);
      setData(result);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  const restoreVersion = useCallback(async (version: number) => {
    if (!id) return;
    setLoading(true);
    try { return await restoreDocumentVersion(id, version); }
    finally { setLoading(false); }
  }, [id]);

  return { data, loading, refetch: fetch, restoreVersion };
}

export function useDocumentComments(id: string | null) {
  const [data, setData] = useState<DocumentCommentItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await getDocumentComments(id);
      setData(result);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = useCallback(async (content: string) => {
    if (!id) return;
    setLoading(true);
    try { return await createDocumentComment(id, { content }); }
    finally { setLoading(false); }
  }, [id]);

  const update = useCallback(async (commentId: string, content: string) => {
    if (!id) return;
    setLoading(true);
    try { return await updateDocumentComment(id, commentId, { content }); }
    finally { setLoading(false); }
  }, [id]);

  const remove = useCallback(async (commentId: string) => {
    if (!id) return;
    setLoading(true);
    try { await deleteDocumentComment(id, commentId); }
    finally { setLoading(false); }
  }, [id]);

  return { data, loading, refetch: fetch, create, update, remove };
}

export function useDocumentFavorite(id: string | null) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggle = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await toggleDocumentFavorite(id);
      setIsFavorited(result.isFavorited);
    } finally { setLoading(false); }
  }, [id]);

  const remove = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      await removeDocumentFavorite(id);
      setIsFavorited(false);
    } finally { setLoading(false); }
  }, [id]);

  return { isFavorited, toggle, remove, loading };
}

export function useDocumentSearch() {
  const [data, setData] = useState<ListResponse<SearchResult>>({ data: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, params?: { knowledgeBaseId?: string; status?: string; type?: string; page?: number; pageSize?: number }) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await searchDocuments(query, params);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, search };
}

export function useDocumentStatistics(id: string | null) {
  const [data, setData] = useState<DocumentStatistics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await getDocumentStatistics(id);
      setData(result);
    } catch { setData(null); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useDocumentTimeline(id: string | null) {
  const [data, setData] = useState<DocumentTimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await getDocumentTimeline(id);
      setData(result);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useDocumentExport() {
  const [loading, setLoading] = useState(false);

  const exportDoc = useCallback(async (id: string, format: "markdown" | "json") => {
    setLoading(true);
    try { return await exportDocument(id, format); }
    finally { setLoading(false); }
  }, []);

  return { export: exportDoc, loading };
}

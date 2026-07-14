"use client";

import { useState, useEffect, useCallback } from "react";
import { getConversations, getConversation, createConversation, updateConversation, deleteConversation, sendChatMessage, getPrompts, createPrompt, updatePrompt, deletePrompt, getUsage, getAIContext } from "@/services/ai";
import type { AIConversationItem, AIConversationDetail, AIMessageItem, AIPromptTemplateItem, AIUsageSummary, AIChatRequest, AIChatResponse, AIContextSummary, ListResponse, CreateConversationPayload, UpdateConversationPayload, CreatePromptPayload, UpdatePromptPayload } from "@/types/ai";

export function useConversations(page = 1) {
  const [data, setData] = useState<ListResponse<AIConversationItem>>({ data: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getConversations(page);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useConversation(id: string | null) {
  const [data, setData] = useState<AIConversationDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await getConversation(id);
      setData(result);
    } catch { setData(null); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
}

export function useConversationActions() {
  const [loading, setLoading] = useState(false);

  const create = useCallback(async (data: CreateConversationPayload) => {
    setLoading(true);
    try { return await createConversation(data); }
    finally { setLoading(false); }
  }, []);

  const update = useCallback(async (id: string, data: UpdateConversationPayload) => {
    setLoading(true);
    try { return await updateConversation(id, data); }
    finally { setLoading(false); }
  }, []);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    try { await deleteConversation(id); }
    finally { setLoading(false); }
  }, []);

  return { create, update, remove, loading };
}

export function useAIChat() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async (data: AIChatRequest): Promise<AIChatResponse | undefined> => {
    setLoading(true);
    setError(null);
    try {
      return await sendChatMessage(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chat failed");
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  return { send, loading, error };
}

export function usePromptTemplates() {
  const [data, setData] = useState<AIPromptTemplateItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async (category?: string) => {
    setLoading(true);
    try {
      const result = await getPrompts(category);
      setData(result.data);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, []);

  const create = useCallback(async (data: CreatePromptPayload) => {
    setLoading(true);
    try { return await createPrompt(data); }
    finally { setLoading(false); }
  }, []);

  const update = useCallback(async (id: string, data: UpdatePromptPayload) => {
    setLoading(true);
    try { return await updatePrompt(id, data); }
    finally { setLoading(false); }
  }, []);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    try { await deletePrompt(id); }
    finally { setLoading(false); }
  }, []);

  return { data, loading, fetch, create, update, remove };
}

export function useAIUsage() {
  const [data, setData] = useState<AIUsageSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async (params?: { period?: string; provider?: string; userId?: string; from?: string; to?: string }) => {
    setLoading(true);
    try {
      const result = await getUsage(params);
      setData(result);
    } catch { setData(null); }
    finally { setLoading(false); }
  }, []);

  return { data, loading, fetch };
}

export function useAIContext() {
  const [data, setData] = useState<AIContextSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (type: "project" | "task" | "sprint" | "document", id: string) => {
    setLoading(true);
    try {
      const result = await getAIContext(type, id);
      setData(result);
    } catch { setData(null); }
    finally { setLoading(false); }
  }, []);

  return { data, loading, load };
}

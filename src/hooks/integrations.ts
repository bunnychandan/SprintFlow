import { useState, useCallback, useEffect } from "react";
import type { IntegrationItem, IntegrationDetail, IntegrationDashboard, ListResponse, CreateIntegrationPayload, UpdateIntegrationPayload } from "@/types/integrations";

const BASE = "/api/integrations";

async function fetchJSON<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) { const err = await res.json().catch(() => ({ error: res.statusText })); throw new Error(err.error || res.statusText); }
  return res.json();
}

export function useIntegrationsList(orgId: string, params?: { page?: number; pageSize?: number; search?: string; provider?: string; status?: string }) {
  const [data, setData] = useState<ListResponse<IntegrationItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const searchParams = new URLSearchParams({ organizationId: orgId });
      if (params?.page) searchParams.set("page", String(params.page));
      if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
      if (params?.search) searchParams.set("search", params.search);
      if (params?.provider) searchParams.set("provider", params.provider);
      if (params?.status) searchParams.set("status", params.status);
      const result = await fetchJSON<ListResponse<IntegrationItem>>(`${BASE}?${searchParams}`);
      setData(result);
    } catch (e: any) { setError(e.message); }
    finally { setIsLoading(false); }
  }, [orgId, params?.page, params?.pageSize, params?.search, params?.provider, params?.status]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
}

export function useIntegrationDashboard(orgId: string) {
  const [data, setData] = useState<IntegrationDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetch = useCallback(async () => {
    setIsLoading(true); setError(null);
    try { setData(await fetchJSON<IntegrationDashboard>(`${BASE}/dashboard?organizationId=${orgId}`)); }
    catch (e: any) { setError(e.message); }
    finally { setIsLoading(false); }
  }, [orgId]);
  useEffect(() => { fetch(); }, [fetch]);
  return { data, isLoading, error, refetch: fetch };
}

export function useIntegration(id: string | undefined, orgId: string) {
  const [data, setData] = useState<IntegrationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetch = useCallback(async () => {
    if (!id) return;
    setIsLoading(true); setError(null);
    try { setData(await fetchJSON<IntegrationDetail>(`${BASE}/${id}?organizationId=${orgId}`)); }
    catch (e: any) { setError(e.message); }
    finally { setIsLoading(false); }
  }, [id, orgId]);
  useEffect(() => { if (id) fetch(); }, [fetch, id]);
  return { data, isLoading, error, refetch: fetch };
}

async function mutate<T>(url: string, body: unknown, method = "POST"): Promise<T> {
  return fetchJSON<T>(url, { method, body: JSON.stringify(body) });
}

export function useCreateIntegration(orgId: string) {
  const [isPending, setIsPending] = useState(false);
  const mutateAsync = useCallback(async (payload: CreateIntegrationPayload) => {
    setIsPending(true);
    try { return await mutate<IntegrationDetail>(BASE, { ...payload, organizationId: orgId }); }
    finally { setIsPending(false); }
  }, [orgId]);
  return { mutateAsync, isPending };
}

export function useConnectIntegration(orgId: string) {
  const [isPending, setIsPending] = useState(false);
  const mutateAsync = useCallback(async (id: string) => {
    setIsPending(true);
    try { return await mutate<IntegrationDetail>(`${BASE}/${id}/connect`, { organizationId: orgId }); }
    finally { setIsPending(false); }
  }, [orgId]);
  return { mutateAsync, isPending };
}

export function useDisconnectIntegration(orgId: string) {
  const [isPending, setIsPending] = useState(false);
  const mutateAsync = useCallback(async (id: string) => {
    setIsPending(true);
    try { return await mutate<IntegrationDetail>(`${BASE}/${id}/disconnect`, { organizationId: orgId }); }
    finally { setIsPending(false); }
  }, [orgId]);
  return { mutateAsync, isPending };
}

export function useSyncIntegration(orgId: string) {
  const [isPending, setIsPending] = useState(false);
  const mutateAsync = useCallback(async (id: string) => {
    setIsPending(true);
    try { return await mutate<IntegrationDetail>(`${BASE}/${id}/sync`, { organizationId: orgId }); }
    finally { setIsPending(false); }
  }, [orgId]);
  return { mutateAsync, isPending };
}

export function useDeleteIntegration(orgId: string) {
  const [isPending, setIsPending] = useState(false);
  const mutateAsync = useCallback(async (id: string) => {
    setIsPending(true);
    try { return await fetchJSON(`${BASE}/${id}`, { method: "DELETE", body: JSON.stringify({ organizationId: orgId }) }); }
    finally { setIsPending(false); }
  }, [orgId]);
  return { mutateAsync, isPending };
}

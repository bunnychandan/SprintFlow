"use client";

import { useState, useEffect, useCallback } from "react";
import { getAlerts, createAlert, resolveAlert } from "@/services/system-health";
import type { AlertListResponse, AlertItem } from "@/types/admin";

export function useAlerts(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  severity?: string;
  source?: string;
}) {
  const [data, setData] = useState<AlertListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAlerts(params);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = useCallback(async (alertData: {
    title: string;
    description?: string;
    severity: string;
    source: string;
  }) => {
    try {
      const result = await createAlert(alertData);
      await fetch();
      return result;
    } catch (e) {
      throw e;
    }
  }, [fetch]);

  const resolve = useCallback(async (id: string) => {
    try {
      const result = await resolveAlert(id);
      await fetch();
      return result;
    } catch (e) {
      throw e;
    }
  }, [fetch]);

  return { data, loading, error, refetch: fetch, create, resolve };
}

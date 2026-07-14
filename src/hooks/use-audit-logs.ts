"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuditLogs } from "@/services/audit";

interface AuditListState {
  logs: Record<string, unknown>[];
  pagination: { total: number; page: number; pageSize: number; totalPages: number };
}

export function useAuditLogs(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  action?: string;
  entityType?: string;
  actorId?: string;
  success?: string;
  projectId?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const [data, setData] = useState<AuditListState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAuditLogs(params);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [
    params?.page, params?.pageSize, params?.search,
    params?.sortBy, params?.sortOrder,
    params?.action, params?.entityType, params?.actorId,
    params?.success, params?.projectId,
    params?.dateFrom, params?.dateTo,
  ]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return { data, loading, error, refetch: fetchLogs };
}

export function useAuditDashboard() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/audit/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      const result = await res.json();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load audit dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  return { data, loading, error, refetch: fetchDashboard };
}

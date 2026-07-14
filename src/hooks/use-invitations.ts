"use client";

import { useState, useEffect, useCallback } from "react";
import { getInvitations } from "@/services/invitations";

interface InvitationListState {
  invitations: Record<string, unknown>[];
  pagination: { total: number; page: number; pageSize: number; totalPages: number };
}

export function useInvitations(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
  type?: string;
}) {
  const [data, setData] = useState<InvitationListState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getInvitations(params);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load invitations");
    } finally {
      setLoading(false);
    }
  }, [params?.page, params?.pageSize, params?.search, params?.sortBy, params?.sortOrder, params?.status, params?.type]);

  useEffect(() => { fetchInvitations(); }, [fetchInvitations]);

  return { data, loading, error, refetch: fetchInvitations };
}

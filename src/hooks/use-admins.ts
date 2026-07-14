"use client";

import { useState, useEffect, useCallback } from "react";
import { getAdmins } from "@/services/admins";

interface AdminListResponse {
  admins: Record<string, unknown>[];
  pagination: { total: number; page: number; pageSize: number; totalPages: number };
}

export function useAdmins(page = 1, pageSize = 50) {
  const [data, setData] = useState<AdminListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdmins({ page, pageSize });
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load admins");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  return { data, loading, error, refetch: fetchAdmins };
}

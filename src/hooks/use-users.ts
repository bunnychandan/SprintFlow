"use client";

import { useState, useEffect, useCallback } from "react";
import { getUsers, getUser, createUser, updateUser, deleteUser, bulkUserAction, exportUsers } from "@/services/users";
import type { User } from "@prisma/client";

interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  role?: string;
  isActive?: string;
  department?: string;
}

export function useUsers(params: QueryParams = {}) {
  const [users, setUsers] = useState<(User & { _count: { projects: number; tasksAssigned: number; tasksReported: number } })[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getUsers(params);
      setUsers(result.users);
      setTotal(result.pagination.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return {
    users, total, loading, error, refetch: fetchUsers,
    createUser, updateUser, deleteUser, bulkUserAction, exportUsers,
  };
}

export function useUser(id: string | null) {
  const [data, setData] = useState<Awaited<ReturnType<typeof getUser>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getUser(id);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load user");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  return { data, loading, error, refetch: fetchUser };
}

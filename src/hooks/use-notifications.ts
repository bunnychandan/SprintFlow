"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  bulkUpdate,
  getUnreadCount,
} from "@/services/notifications";
import { subscribeNotifications } from "@/lib/notification/realtime";
import type { NotificationItem, NotificationListResponse } from "@/types/admin";

export function useNotifications(params?: {
  page?: number;
  pageSize?: number;
  type?: string;
  priority?: string;
  isRead?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  const [data, setData] = useState<NotificationListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getNotifications(params);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  const markRead = useCallback(async (id: string) => {
    const updated = await markAsRead(id);
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        notifications: prev.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1),
      };
    });
    return updated;
  }, []);

  const markAllRead = useCallback(async () => {
    const result = await markAllAsRead();
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        notifications: prev.notifications.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })),
        unreadCount: 0,
      };
    });
    return result;
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteNotification(id);
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        notifications: prev.notifications.filter((n) => n.id !== id),
        total: prev.total - 1,
      };
    });
  }, []);

  const bulkAction = useCallback(async (ids: string[], action: "read" | "delete") => {
    const result = await bulkUpdate(ids, action);
    setData((prev) => {
      if (!prev) return prev;
      if (action === "delete") {
        return {
          ...prev,
          notifications: prev.notifications.filter((n) => !ids.includes(n.id)),
          total: prev.total - ids.length,
        };
      }
      return {
        ...prev,
        notifications: prev.notifications.map((n) =>
          ids.includes(n.id) ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(0, prev.unreadCount - ids.length),
      };
    });
    return result;
  }, []);

  return { data, loading, error, refetch: fetch, markRead, markAllRead, remove, bulkAction };
}

export function useNotification(id: string | null) {
  const [notification, setNotification] = useState<NotificationItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getNotification(id);
      setNotification(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load notification");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { notification, loading, error, refetch: fetch };
}

export function useUnreadCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const result = await getUnreadCount();
      setCount(result.count);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    const sub = subscribeNotifications(count, () => { fetch(); }, 30000);
    return () => sub.unsubscribe();
  }, [count, fetch]);

  return { count, loading, refetch: fetch };
}

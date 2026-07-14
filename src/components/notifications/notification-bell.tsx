"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/cn";
import { getNotifications, markAsRead } from "@/services/notifications";
import { subscribeNotifications } from "@/lib/notification/realtime";
import { NotificationCard } from "./notification-card";
import type { NotificationItem } from "@/types/admin";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recent, setRecent] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchRecent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getNotifications({ pageSize: 5 });
      setRecent(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecent();
    const sub = subscribeNotifications(unreadCount, () => { fetchRecent(); }, 30000);
    return () => sub.unsubscribe();
  }, [fetchRecent, unreadCount]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkRead = async (id: string) => {
    try {
      await markAsRead(id);
      setRecent((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silent
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-surface-elevated shadow-dropdown z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs text-accent hover:text-accent-hover"
            >
              View all
            </Link>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-surface-hover shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-3/4 bg-surface-hover rounded" />
                      <div className="h-2.5 w-1/2 bg-surface-hover rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-foreground-muted">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {recent.map((n) => (
                  <NotificationCard
                    key={n.id}
                    notification={n}
                    onMarkRead={() => handleMarkRead(n.id)}
                    compact
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

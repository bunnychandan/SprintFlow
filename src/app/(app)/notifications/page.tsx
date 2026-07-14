"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, CheckCheck, Trash2, ArrowUpDown, RefreshCw,
} from "lucide-react";
import { PageHeader, Button, Badge, EmptyState, Card } from "@/components/ui";
import { useToast } from "@/contexts/toast-context";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationFilters } from "@/components/notifications/notification-filters";
import { NotificationTimeline } from "@/components/notifications/notification-timeline";

export default function NotificationsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [readFilter, setReadFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data, loading, error, refetch, markRead, markAllRead, bulkAction } = useNotifications({
    search: search || undefined,
    type: typeFilter || undefined,
    priority: priorityFilter || undefined,
    isRead: readFilter || undefined,
    sortBy,
  });

  const notifications = data?.notifications || [];
  const total = data?.total || 0;
  const unreadCount = data?.unreadCount || 0;

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markRead(id);
    } catch {
      addToast({ type: "error", message: "Failed to mark as read" });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      addToast({ type: "success", message: "All notifications marked as read" });
    } catch {
      addToast({ type: "error", message: "Failed to mark all as read" });
    }
  };

  const handleBulkRead = async () => {
    if (selected.size === 0) return;
    try {
      await bulkAction(Array.from(selected), "read");
      addToast({ type: "success", message: `${selected.size} marked as read` });
      setSelected(new Set());
    } catch {
      addToast({ type: "error", message: "Failed to bulk mark as read" });
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    try {
      await bulkAction(Array.from(selected), "delete");
      addToast({ type: "success", message: `${selected.size} deleted` });
      setSelected(new Set());
    } catch {
      addToast({ type: "error", message: "Failed to bulk delete" });
    }
  };

  if (error) return <Card className="p-8 text-center"><p className="text-red-500 mb-2">{error}</p><button onClick={() => refetch()} className="text-sm underline">Retry</button></Card>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="Stay updated with your activity"
        metadata="NOTIFICATIONS"
        actions={
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllRead} leftIcon={<CheckCheck className="h-4 w-4" />}>
                Mark All Read
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={refetch} leftIcon={<RefreshCw className="h-4 w-4" />}>
              Refresh
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-foreground-secondary">{total} total</span>
          {unreadCount > 0 && (
            <Badge variant="info" size="md">{unreadCount} unread</Badge>
          )}
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground-muted">{selected.size} selected</span>
            <Button variant="ghost" size="sm" onClick={handleBulkRead} leftIcon={<CheckCheck className="h-3.5 w-3.5" />}>
              Read
            </Button>
            <Button variant="ghost" size="sm" onClick={handleBulkDelete} leftIcon={<Trash2 className="h-3.5 w-3.5" />}>
              Delete
            </Button>
          </div>
        )}
      </div>

      <NotificationFilters
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        readFilter={readFilter}
        onReadChange={setReadFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse flex gap-3 p-4 rounded-xl border border-border bg-surface">
              <div className="h-10 w-10 rounded-full bg-surface-hover shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-surface-hover rounded" />
                <div className="h-3 w-1/2 bg-surface-hover rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-12 w-12 text-foreground-muted" />}
          title="No notifications"
          description={search ? "Try a different search" : "You're all caught up!"}
        />
      ) : (
        <NotificationTimeline
          notifications={notifications}
          onMarkRead={handleMarkRead}
        />
      )}
    </div>
  );
}

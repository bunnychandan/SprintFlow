"use client";

import { cn } from "@/lib/cn";
import { NotificationCard } from "./notification-card";
import type { NotificationItem } from "@/types/admin";

interface GroupedNotifications {
  label: string;
  items: NotificationItem[];
}

interface NotificationTimelineProps {
  notifications: NotificationItem[];
  onMarkRead?: (id: string) => void;
  className?: string;
}

function groupNotifications(items: NotificationItem[]): GroupedNotifications[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  const groups: Record<string, NotificationItem[]> = {
    Today: [],
    Yesterday: [],
    "This Week": [],
    Older: [],
  };

  for (const item of items) {
    const d = new Date(item.createdAt);
    if (d >= today) groups["Today"].push(item);
    else if (d >= yesterday) groups["Yesterday"].push(item);
    else if (d >= weekAgo) groups["This Week"].push(item);
    else groups["Older"].push(item);
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

export function NotificationTimeline({ notifications, onMarkRead, className }: NotificationTimelineProps) {
  const groups = groupNotifications(notifications);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {groups.map((group) => (
        <div key={group.label}>
          <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2 px-1">
            {group.label}
          </h3>
          <div className="divide-y divide-border/50 rounded-xl border border-border bg-surface overflow-hidden">
            {group.items.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                onMarkRead={onMarkRead ? () => onMarkRead(n.id) : undefined}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

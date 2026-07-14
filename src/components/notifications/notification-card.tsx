"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui";
import {
  Bell, UserPlus, Shield, AlertTriangle, CheckCircle2,
  MessageSquare, GitPullRequest, Calendar, FolderKanban, Archive,
  Zap, Eye,
} from "lucide-react";
import type { NotificationItem, NotificationTypeValue, NotificationPriorityValue } from "@/types/admin";

interface NotificationCardProps {
  notification: NotificationItem;
  onMarkRead?: () => void;
  compact?: boolean;
  className?: string;
}

const typeConfig: Record<NotificationTypeValue, { icon: React.ElementType; color: string; bg: string }> = {
  TASK_ASSIGNED: { icon: UserPlus, color: "text-info", bg: "bg-info/10" },
  TASK_UPDATED: { icon: GitPullRequest, color: "text-info", bg: "bg-info/10" },
  TASK_COMPLETED: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  TASK_COMMENT: { icon: MessageSquare, color: "text-info", bg: "bg-info/10" },
  TASK_MENTION: { icon: Zap, color: "text-warning", bg: "bg-warning/10" },
  SPRINT_STARTED: { icon: Calendar, color: "text-accent", bg: "bg-accent/10" },
  SPRINT_COMPLETED: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  PROJECT_CREATED: { icon: FolderKanban, color: "text-accent", bg: "bg-accent/10" },
  PROJECT_UPDATED: { icon: FolderKanban, color: "text-info", bg: "bg-info/10" },
  PROJECT_ARCHIVED: { icon: Archive, color: "text-foreground-muted", bg: "bg-surface-hover" },
  USER_INVITED: { icon: UserPlus, color: "text-accent", bg: "bg-accent/10" },
  USER_JOINED: { icon: UserPlus, color: "text-success", bg: "bg-success/10" },
  ADMIN_CREATED: { icon: Shield, color: "text-destructive", bg: "bg-destructive/10" },
  SYSTEM_ALERT: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  AUDIT_WARNING: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  SECURITY_EVENT: { icon: Shield, color: "text-destructive", bg: "bg-destructive/10" },
};

const priorityBadge: Record<NotificationPriorityValue, "info" | "warning" | "danger" | "neutral"> = {
  LOW: "neutral",
  MEDIUM: "info",
  HIGH: "warning",
  CRITICAL: "danger",
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function NotificationCard({ notification, onMarkRead, compact, className }: NotificationCardProps) {
  const config = typeConfig[notification.type] || typeConfig.SYSTEM_ALERT;
  const Icon = config.icon;

  const linkHref = notification.taskId
    ? `/tasks/${notification.taskId}`
    : notification.projectId
    ? `/projects/${notification.projectId}`
    : "/notifications";

  const cardContent = (
    <div
      className={cn(
        "flex items-start gap-3 p-3 transition-colors group relative",
        !notification.isRead && "bg-accent-light/30",
        "hover:bg-surface-hover/50",
        className
      )}
    >
      <div className={cn("shrink-0 flex h-8 w-8 items-center justify-center rounded-full", config.bg)}>
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm truncate", notification.isRead ? "text-foreground-secondary" : "text-foreground font-medium")}>
            {notification.title}
          </p>
          {compact && !notification.isRead && (
            <span className="shrink-0 h-2 w-2 rounded-full bg-accent mt-1.5" />
          )}
        </div>
        {!compact && (
          <p className="text-xs text-foreground-secondary mt-0.5 line-clamp-2">{notification.message}</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-foreground-muted">{timeAgo(notification.createdAt)}</span>
          {notification.priority !== "MEDIUM" && (
            <Badge variant={priorityBadge[notification.priority]} size="sm">{notification.priority}</Badge>
          )}
          {notification.actor && (
            <span className="text-[10px] text-foreground-muted">by {notification.actor.name || notification.actor.email}</span>
          )}
        </div>
      </div>
      {!compact && onMarkRead && !notification.isRead && (
        <button
          onClick={(e) => { e.preventDefault(); onMarkRead(); }}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg text-foreground-muted hover:text-accent hover:bg-accent/10"
          title="Mark as read"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );

  if (compact) {
    return (
      <Link href={linkHref} onClick={onMarkRead} className="block">
        {cardContent}
      </Link>
    );
  }

  return (
    <Link href={linkHref} onClick={onMarkRead} className="block">
      {cardContent}
    </Link>
  );
}

"use client";

import { cn } from "@/lib/cn";

type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

type BadgeSize = "sm" | "md";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-accent-light text-accent border border-accent/20",
  primary: "bg-accent text-accent-foreground",
  success: "bg-success/10 text-success border border-success/20",
  warning: "bg-warning/10 text-warning border border-warning/20",
  danger: "bg-destructive/10 text-destructive border border-destructive/20",
  info: "bg-info/10 text-info border border-info/20",
  neutral: "bg-surface-hover text-foreground-secondary border border-border",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-[10px] font-semibold",
  md: "px-2.5 py-1 text-xs font-semibold",
};

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  children: React.ReactNode;
}

export function Badge({
  variant = "default",
  size = "sm",
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full uppercase tracking-wider",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}

export const STATUS_BADGE: Record<string, BadgeVariant> = {
  TODO: "neutral",
  IN_PROGRESS: "info",
  IN_REVIEW: "warning",
  QA_TESTING: "primary",
  BLOCKED: "danger",
  DONE: "success",
  REOPENED: "warning",
  PLANNING: "neutral",
  ACTIVE: "primary",
  COMPLETED: "success",
};

export const PRIORITY_BADGE: Record<string, BadgeVariant> = {
  LOWEST: "neutral",
  LOW: "info",
  MEDIUM: "warning",
  HIGH: "danger",
  HIGHEST: "danger",
  CRITICAL: "danger",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <Badge variant={STATUS_BADGE[status] || "neutral"} size="sm" className={className}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

export function PriorityBadge({
  priority,
  className,
}: {
  priority: string;
  className?: string;
}) {
  const isCritical = priority === "CRITICAL";
  return (
    <Badge
      variant={PRIORITY_BADGE[priority] || "neutral"}
      size="sm"
      className={cn(isCritical && "bg-rose-600 text-white font-bold border-rose-700", className)}
    >
      {priority}
    </Badge>
  );
}

export function TypeBadge({ type }: { type: string }) {
  const base = "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold";
  switch (type) {
    case "BUG":
      return <span className={cn(base, "bg-destructive/10 text-destructive")}>Bug</span>;
    case "STORY":
      return <span className={cn(base, "bg-success/10 text-success")}>Story</span>;
    default:
      return <span className={cn(base, "bg-info/10 text-info")}>Task</span>;
  }
}

export function RoleBadge({ role }: { role: string }) {
  const variant: BadgeVariant =
    role === "SUPER_ADMIN" || role === "ADMIN"
      ? "danger"
      : role === "PROJECT_MANAGER" || role === "SCRUM_MASTER"
      ? "primary"
      : "neutral";

  return (
    <Badge variant={variant} size="sm">
      {role.replace(/_/g, " ")}
    </Badge>
  );
}

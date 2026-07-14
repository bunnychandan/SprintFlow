"use client";

import { cn } from "@/lib/cn";

interface BacklogPriorityBadgeProps {
  priority: string;
  className?: string;
}

const priorityStyles: Record<string, string> = {
  CRITICAL: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  HIGH: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  MEDIUM: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  LOW: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  LOWEST: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export function BacklogPriorityBadge({ priority, className }: BacklogPriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
        priorityStyles[priority] || "bg-surface-hover text-foreground-secondary border-border",
        className
      )}
    >
      {priority}
    </span>
  );
}

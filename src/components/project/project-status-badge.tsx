"use client";

import { cn } from "@/lib/cn";

interface ProjectStatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  PLANNING: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  ACTIVE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  ON_HOLD: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  COMPLETED: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  ARCHIVED: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function ProjectStatusBadge({ status, className }: ProjectStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        statusStyles[status] || "bg-surface-hover text-foreground-secondary border-border",
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "PLANNING" && "bg-blue-500",
          status === "ACTIVE" && "bg-emerald-500",
          status === "ON_HOLD" && "bg-amber-500",
          status === "COMPLETED" && "bg-violet-500",
          status === "ARCHIVED" && "bg-slate-500",
          status === "CANCELLED" && "bg-red-500"
        )}
      />
      {status.replace(/_/g, " ")}
    </span>
  );
}

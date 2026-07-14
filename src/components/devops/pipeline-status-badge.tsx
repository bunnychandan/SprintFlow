"use client";

import { cn } from "@/lib/cn";

interface PipelineStatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  IDLE: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  RUNNING: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  SUCCESS: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  FAILED: "bg-red-500/10 text-red-600 border-red-500/20",
};

export function PipelineStatusBadge({ status, className }: PipelineStatusBadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", statusStyles[status] || statusStyles.IDLE, className)}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

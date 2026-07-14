"use client";

import { cn } from "@/lib/cn";

interface TimesheetStatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  DRAFT: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  SUBMITTED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  APPROVED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  REJECTED: "bg-red-500/10 text-red-600 border-red-500/20",
};

export function TimesheetStatusBadge({ status, className }: TimesheetStatusBadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", statusStyles[status] || statusStyles.DRAFT, className)}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

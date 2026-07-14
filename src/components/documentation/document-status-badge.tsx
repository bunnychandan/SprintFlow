"use client";

import { cn } from "@/lib/cn";
import type { DocumentStatus } from "@/types/documentation";

interface DocumentStatusBadgeProps {
  status: DocumentStatus | string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  DRAFT: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  REVIEW: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  PUBLISHED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  ARCHIVED: "bg-red-500/10 text-red-600 border-red-500/20",
};

export function DocumentStatusBadge({ status, className }: DocumentStatusBadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", statusStyles[status] || statusStyles.DRAFT, className)}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

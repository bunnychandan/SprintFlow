"use client";

import { cn } from "@/lib/cn";
import type { DocumentVisibility } from "@/types/documentation";

interface DocumentVisibilityBadgeProps {
  visibility: DocumentVisibility | string;
  className?: string;
}

const visibilityStyles: Record<string, string> = {
  PRIVATE: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  PROJECT: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  ORGANIZATION: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  PUBLIC: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

export function DocumentVisibilityBadge({ visibility, className }: DocumentVisibilityBadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", visibilityStyles[visibility] || visibilityStyles.ORGANIZATION, className)}>
      {visibility.charAt(0) + visibility.slice(1).toLowerCase()}
    </span>
  );
}

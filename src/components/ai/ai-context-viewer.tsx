"use client";

import { cn } from "@/lib/cn";
import type { AIContextSummary } from "@/types/ai";

interface AIContextViewerProps {
  context: AIContextSummary | null;
  loading?: boolean;
  className?: string;
}

export function AIContextViewer({ context, loading, className }: AIContextViewerProps) {
  if (loading) {
    return <div className={cn("animate-pulse space-y-2", className)}>{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-4 rounded bg-surface-hover" />)}</div>;
  }

  if (!context) return <div className={cn("text-xs text-foreground-muted", className)}>No context loaded</div>;

  const type = context.project ? "Project" : context.task ? "Task" : context.sprint ? "Sprint" : context.document ? "Document" : "Unknown";
  const data = context.project || context.task || context.sprint || context.document;

  if (!data) return null;

  return (
    <div className={cn("text-xs space-y-1", className)}>
      <p className="font-semibold text-foreground">{type} Context</p>
      {Object.entries(data as Record<string, unknown>).slice(0, 5).map(([key, val]) => (
        <p key={key} className="text-foreground-muted"><span className="capitalize">{key.replace(/([A-Z])/g, " $1")}:</span> {String(val || "-")}</p>
      ))}
    </div>
  );
}

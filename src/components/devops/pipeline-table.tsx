"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { PipelineStatusBadge } from "./pipeline-status-badge";
import type { Pipeline } from "@/types/devops";

interface PipelineTableProps {
  data: Pipeline[];
  loading?: boolean;
  onRun?: (id: string) => void;
  className?: string;
}

export function PipelineTable({ data, loading, onRun, className }: PipelineTableProps) {
  if (loading) {
    return (
      <div className={cn("rounded-2xl border border-border overflow-hidden", className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse h-12 bg-surface border-b border-border" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <div className={cn("rounded-2xl border border-border p-8 text-center text-sm text-foreground-secondary", className)}>No pipelines found</div>;
  }

  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-border", className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-surface/50">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Name</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Project</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Success</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Failed</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Last Run</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((p) => (
            <tr key={p.id} className="hover:bg-surface-hover/50 transition-colors">
              <td className="px-4 py-3">
                <Link href={`/devops/pipelines/${p.id}`} className="text-sm font-medium text-accent hover:underline">{p.name}</Link>
              </td>
              <td className="px-4 py-3 text-sm text-foreground">{p.projectCode}</td>
              <td className="px-4 py-3"><PipelineStatusBadge status={p.status} /></td>
              <td className="px-4 py-3 text-sm text-emerald-500">{p.successCount}</td>
              <td className="px-4 py-3 text-sm text-red-500">{p.failureCount}</td>
              <td className="px-4 py-3 text-sm text-foreground">{p.lastRun ? new Date(p.lastRun).toLocaleDateString() : "-"}</td>
              <td className="px-4 py-3">
                {p.status !== "RUNNING" && onRun && (
                  <button onClick={() => onRun(p.id)} className="text-xs px-2 py-1 rounded bg-accent-light text-accent hover:bg-accent-light/80 transition-colors">Run</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

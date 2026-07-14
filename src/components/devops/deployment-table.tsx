"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { DeploymentStatusBadge } from "./deployment-status-badge";
import type { Deployment } from "@/types/devops";

interface DeploymentTableProps {
  data: Deployment[];
  loading?: boolean;
  className?: string;
}

export function DeploymentTable({ data, loading, className }: DeploymentTableProps) {
  if (loading) {
    return (
      <div className={cn("rounded-2xl border border-border overflow-hidden", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse h-12 bg-surface border-b border-border" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <div className={cn("rounded-2xl border border-border p-8 text-center text-sm text-foreground-secondary", className)}>No deployments found</div>;
  }

  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-border", className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-surface/50">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Version</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Project</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Environment</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Branch</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Deployed By</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Duration</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((d) => (
            <tr key={d.id} className="hover:bg-surface-hover/50 transition-colors">
              <td className="px-4 py-3">
                <Link href={`/devops/deployments/${d.id}`} className="text-sm font-medium text-accent hover:underline">{d.version}</Link>
              </td>
              <td className="px-4 py-3 text-sm text-foreground">{d.projectCode} - {d.projectName}</td>
              <td className="px-4 py-3 text-sm text-foreground">{d.environment}</td>
              <td className="px-4 py-3"><DeploymentStatusBadge status={d.status} /></td>
              <td className="px-4 py-3 text-sm text-foreground">{d.branch || "-"}</td>
              <td className="px-4 py-3 text-sm text-foreground">{d.deployedByName || "-"}</td>
              <td className="px-4 py-3 text-sm text-foreground">{d.duration ? `${d.duration}s` : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

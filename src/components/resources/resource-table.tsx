"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import type { Resource } from "@/types/resources";

interface ResourceTableProps {
  resources: Resource[];
  loading?: boolean;
  className?: string;
}

export function ResourceTable({ resources, loading, className }: ResourceTableProps) {
  if (loading) {
    return (
      <div className={cn("rounded-2xl border border-border overflow-hidden", className)}>
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 px-4 py-3">
              <div className="h-8 w-8 rounded-full bg-surface-hover" />
              <div className="flex-1 h-4 rounded bg-surface-hover" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!resources || resources.length === 0) return null;

  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-border", className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-surface/50">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Member</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Department</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Role</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Allocation</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Projects</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {resources.map((r) => (
            <tr key={r.id} className="hover:bg-surface-hover/50 transition-colors">
              <td className="px-4 py-3">
                <Link href={`/resources/${r.id}`} className="flex items-center gap-3">
                  <Avatar src={r.image} name={r.name || r.email} className="h-8 w-8" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.name || r.email}</p>
                    <p className="text-xs text-foreground-muted">{r.email}</p>
                  </div>
                </Link>
              </td>
              <td className="px-4 py-3 text-sm text-foreground">{r.department || "-"}</td>
              <td className="px-4 py-3"><RoleBadge role={r.role} /></td>
              <td className="px-4 py-3 text-sm text-foreground">{r.totalAllocation}%</td>
              <td className="px-4 py-3 text-sm text-foreground">{r.allocations.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

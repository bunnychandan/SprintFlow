"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { DocumentStatusBadge } from "./document-status-badge";
import { DocumentVisibilityBadge } from "./document-visibility-badge";
import { FileText } from "lucide-react";
import type { DocumentItem } from "@/types/documentation";

interface DocumentTableProps {
  data: DocumentItem[];
  loading?: boolean;
  className?: string;
}

export function DocumentTable({ data, loading, className }: DocumentTableProps) {
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
    return <div className={cn("rounded-2xl border border-border p-8 text-center text-sm text-foreground-secondary", className)}>No documents found</div>;
  }

  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-border", className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-surface/50">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Title</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Visibility</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Version</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((d) => (
            <tr key={d.id} className="hover:bg-surface-hover/50 transition-colors">
              <td className="px-4 py-3">
                <Link href={`/documents/${d.id}`} className="flex items-center gap-2 text-sm font-medium text-accent hover:underline">
                  <FileText className="h-4 w-4" />{d.title}
                </Link>
              </td>
              <td className="px-4 py-3"><DocumentStatusBadge status={d.status} /></td>
              <td className="px-4 py-3"><DocumentVisibilityBadge visibility={d.visibility} /></td>
              <td className="px-4 py-3 text-sm text-foreground">v{d.version}</td>
              <td className="px-4 py-3 text-sm text-foreground-muted">{new Date(d.updatedAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

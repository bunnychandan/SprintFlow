"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { BookOpen, FileText } from "lucide-react";
import type { KnowledgeBaseItem } from "@/types/documentation";

interface KnowledgeTableProps {
  data: KnowledgeBaseItem[];
  loading?: boolean;
  className?: string;
}

export function KnowledgeTable({ data, loading, className }: KnowledgeTableProps) {
  if (loading) {
    return (
      <div className={cn("rounded-2xl border border-border overflow-hidden", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse h-14 bg-surface border-b border-border" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <div className={cn("rounded-2xl border border-border p-8 text-center text-sm text-foreground-secondary", className)}>No knowledge bases found</div>;
  }

  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-border", className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-surface/50">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Name</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Description</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Documents</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((kb) => (
            <tr key={kb.id} className="hover:bg-surface-hover/50 transition-colors">
              <td className="px-4 py-3">
                <Link href={`/knowledge/${kb.id}`} className="flex items-center gap-2 text-sm font-medium text-accent hover:underline">
                  <BookOpen className="h-4 w-4" />{kb.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-sm text-foreground truncate max-w-xs">{kb.description || "-"}</td>
              <td className="px-4 py-3 text-sm text-foreground">{kb.documentCount}</td>
              <td className="px-4 py-3 text-sm text-foreground-muted">{new Date(kb.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

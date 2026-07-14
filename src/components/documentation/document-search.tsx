"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import { Search, FileText, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DocumentStatusBadge } from "./document-status-badge";
import type { SearchResult } from "@/types/documentation";

interface DocumentSearchProps {
  query: string;
  onQueryChange: (value: string) => void;
  results: SearchResult[];
  loading?: boolean;
  onSearch: () => void;
  className?: string;
}

export function DocumentSearchBar({ query, onQueryChange, results, loading, onSearch, className }: DocumentSearchProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder="Search documents..."
          className="pl-9 pr-10"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent animate-spin" />}
      </div>
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r) => (
            <Link key={r.id} href={`/documents/${r.id}`}>
              <Card className="p-4 hover:bg-surface-hover transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium text-foreground">{r.title}</span>
                </div>
                {r.excerpt && <p className="text-xs text-foreground-secondary line-clamp-1 mb-1">{r.excerpt}</p>}
                <div className="flex items-center gap-2 text-[10px] text-foreground-muted">
                  <span>{r.knowledgeBaseName}</span>
                  <DocumentStatusBadge status={r.status} />
                  <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
      {query && !loading && results.length === 0 && (
        <p className="text-sm text-foreground-muted text-center py-4">No results for "{query}"</p>
      )}
    </div>
  );
}

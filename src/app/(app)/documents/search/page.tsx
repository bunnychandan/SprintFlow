"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Search, FileText, X } from "lucide-react";
import { Input, Card } from "@/components/ui";
import { useDocumentSearch } from "@/hooks/use-documents";
import { KnowledgeEmptyState } from "@/components/documentation/knowledge-empty-state";
import { DocumentStatusBadge } from "@/components/documentation/document-status-badge";
import { DocumentBreadcrumb } from "@/components/documentation/document-breadcrumb";

export default function DocumentSearchPage() {
  const [query, setQuery] = useState("");
  const { data: searchData, loading, search } = useDocumentSearch();
  const results = searchData?.data || [];
  const total = searchData?.pagination?.total || 0;

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    search(value);
  }, [search]);

  return (
    <div className="space-y-6">
      <DocumentBreadcrumb items={[{ label: "Documents", href: "/documents" }, { label: "Search", href: "" }]} />

      <div>
        <h1 className="text-2xl font-bold text-foreground">Search Documents</h1>
        <p className="text-sm text-foreground-secondary mt-1">Find documentation across all knowledge bases</p>
      </div>

      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-muted" />
        <Input
          placeholder="Search titles and content..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-12 h-12 text-base"
        />
        {query && (
          <button onClick={() => handleSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-surface-hover animate-pulse" />
          ))}
        </div>
      ) : query.length < 2 ? (
        <KnowledgeEmptyState title="Enter a search query" description="Type at least 2 characters to search across all documents." />
      ) : results.length === 0 ? (
        <KnowledgeEmptyState title="No results" description={`No documents found matching "${query}"`} />
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-foreground-muted">{results.length} result{results.length !== 1 ? "s" : ""} for "{query}"</p>
          {results.map((result) => (
            <Link key={result.id} href={`/documents/${result.id}`}>
              <Card className="p-4 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground truncate">{result.title}</h3>
                      <DocumentStatusBadge status={result.status} />
                    </div>
                    <p className="text-xs text-foreground-muted mt-1">{result.knowledgeBaseName} · {result.type.toLowerCase()}</p>
                    {result.excerpt && <p className="text-xs text-foreground-secondary mt-1 line-clamp-2">{result.excerpt}</p>}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { Plus, Search, X, LayoutGrid, List, RefreshCw } from "lucide-react";
import { PageHeader, Button, Input, Select } from "@/components/ui";
import { useDocuments } from "@/hooks/use-documents";
import { DocumentCard } from "@/components/documentation/document-card";
import { DocumentTable } from "@/components/documentation/document-table";
import { KnowledgeEmptyState } from "@/components/documentation/knowledge-empty-state";

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [page, setPage] = useState(1);

  const { data, loading, error, refetch } = useDocuments({
    search: search || undefined,
    status: status || undefined,
    type: type || undefined,
    page,
    pageSize: 20,
  });

  const documents = data?.data || [];
  const pagination = data?.pagination;
  const total = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 0;
  const hasActiveFilters = !!(search || status || type);

  const clearFilters = useCallback(() => {
    setSearch(""); setStatus(""); setType(""); setPage(1);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documents</h1>
          <p className="text-sm text-foreground-secondary mt-1">Browse all documents across knowledge bases</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setViewMode(viewMode === "grid" ? "table" : "grid")} leftIcon={viewMode === "grid" ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}>
            {viewMode === "grid" ? "Table" : "Grid"}
          </Button>
          <Button variant="ghost" size="sm" onClick={refetch} leftIcon={<RefreshCw className="h-4 w-4" />}>Refresh</Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <Input placeholder="Search documents..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
            {search && <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"><X className="h-4 w-4" /></button>}
          </div>
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} options={[
            { value: "", label: "All Statuses" }, { value: "DRAFT", label: "Draft" }, { value: "REVIEW", label: "Review" },
            { value: "PUBLISHED", label: "Published" }, { value: "ARCHIVED", label: "Archived" },
          ]} />
          <Select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} options={[
            { value: "", label: "All Types" }, { value: "DOCUMENT", label: "Document" }, { value: "PAGE", label: "Page" },
            { value: "POLICY", label: "Policy" }, { value: "GUIDE", label: "Guide" }, { value: "RUNBOOK", label: "Runbook" },
            { value: "API", label: "API" }, { value: "MEETING", label: "Meeting" }, { value: "DECISION", label: "Decision" },
          ]} />
          {hasActiveFilters && <Button variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>}
        </div>
      </div>

      {loading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-border bg-surface p-5 h-28" />
            ))}
          </div>
        ) : (
          <DocumentTable data={[]} loading />
        )
      ) : error ? (
        <div className="p-8 text-center"><p className="text-red-500 mb-2">{error}</p><button onClick={() => refetch()} className="text-sm underline">Retry</button></div>
      ) : documents.length === 0 ? (
        <KnowledgeEmptyState title="No Documents" description={hasActiveFilters ? "Try adjusting your filters" : "Create your first document to get started"} />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => <DocumentCard key={doc.id} document={doc} />)}
        </div>
      ) : (
        <DocumentTable data={documents} />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground-muted">{total} total documents</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
            <span className="text-sm text-foreground-muted">Page {page} of {totalPages}</span>
            <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}

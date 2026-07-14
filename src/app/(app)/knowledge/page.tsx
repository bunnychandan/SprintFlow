"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, List, Plus, RefreshCw, BookOpen, FileText, CheckCircle, Clock } from "lucide-react";
import { PageHeader, Button, Skeleton, Card, StatCard, EmptyState } from "@/components/ui";
import { useKnowledgeBases } from "@/hooks/use-knowledge";
import { KnowledgeCard } from "@/components/documentation/knowledge-card";
import { KnowledgeTable } from "@/components/documentation/knowledge-table";
import { KnowledgeEmptyState } from "@/components/documentation/knowledge-empty-state";

export default function KnowledgePage() {
  const { data, loading, error, refetch } = useKnowledgeBases();
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const bases = data?.data || [];
  const total = data?.pagination?.total || 0;

  if (loading && bases.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Knowledge Base" subtitle="Documentation, guides, and company knowledge" metadata="KNOWLEDGE" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (error) return <div className="p-8 text-center"><p className="text-red-500 mb-2">{error}</p><button onClick={() => refetch()} className="text-sm underline">Retry</button></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge Base"
        subtitle="Documentation, guides, and company knowledge"
        metadata="KNOWLEDGE"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setViewMode(viewMode === "grid" ? "table" : "grid")} leftIcon={viewMode === "grid" ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}>
              {viewMode === "grid" ? "Table" : "Grid"}
            </Button>
            <Button variant="ghost" size="sm" onClick={refetch} leftIcon={<RefreshCw className="h-4 w-4" />}>Refresh</Button>
          </div>
        }
      />

      {bases.length === 0 && !loading ? (
        <KnowledgeEmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Knowledge Bases" value={total} icon={<BookOpen className="h-5 w-5 text-accent" />} />
            <StatCard label="Total Documents" value={0} icon={<FileText className="h-5 w-5 text-accent" />} />
            <StatCard label="Published" value={0} icon={<CheckCircle className="h-5 w-5 text-emerald-500" />} />
            <StatCard label="Drafts" value={0} icon={<Clock className="h-5 w-5 text-amber-500" />} />
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bases.map((base) => <KnowledgeCard key={base.id} knowledgeBase={base} />)}
            </div>
          ) : (
            <KnowledgeTable data={bases} loading={loading} />
          )}
        </>
      )}
    </div>
  );
}

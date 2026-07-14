"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, LayoutGrid, List } from "lucide-react";
import { PageHeader, Button, Skeleton } from "@/components/ui";
import { useKnowledgeBase } from "@/hooks/use-knowledge";
import { useDocuments } from "@/hooks/use-documents";
import { DocumentCard } from "@/components/documentation/document-card";
import { DocumentTable } from "@/components/documentation/document-table";
import { KnowledgeEmptyState } from "@/components/documentation/knowledge-empty-state";

export default function KnowledgeBaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: base, loading: baseLoading } = useKnowledgeBase(id);
  const { data: docsData, loading: docsLoading, refetch: refetchDocs } = useDocuments({ knowledgeBaseId: id, pageSize: 100 });
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const documents = docsData?.data || [];

  if (baseLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 rounded" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!base) {
    return (
      <div className="space-y-6">
        <PageHeader title="Knowledge Base" subtitle="Not found" metadata="KNOWLEDGE" />
        <KnowledgeEmptyState title="Base not found" description="The knowledge base you are looking for does not exist." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={base.name}
        subtitle={base.description || `${base.documentCount} documents`}
        metadata="KNOWLEDGE BASE"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setViewMode(viewMode === "grid" ? "table" : "grid")} leftIcon={viewMode === "grid" ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}>
              {viewMode === "grid" ? "Table" : "Grid"}
            </Button>
            <Button variant="ghost" size="sm" onClick={refetchDocs} leftIcon={<RefreshCw className="h-4 w-4" />}>Refresh</Button>
          </div>
        }
      />

      {docsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : documents.length === 0 ? (
        <KnowledgeEmptyState title="No documents" description="This knowledge base does not have any documents yet." />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => <DocumentCard key={doc.id} document={doc} />)}
        </div>
      ) : (
        <DocumentTable data={documents} />
      )}
    </div>
  );
}

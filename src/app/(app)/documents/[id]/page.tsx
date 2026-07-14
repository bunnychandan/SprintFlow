"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Send, Archive, Copy, Download, RefreshCw } from "lucide-react";
import { PageHeader, Button, Card, ErrorState } from "@/components/ui";
import { useDocument, useDocumentLifecycle, useDocumentComments, useDocumentVersions, useDocumentStatistics, useDocumentTimeline, useDocumentFavorite } from "@/hooks/use-documents";
import { DocumentStatusBadge } from "@/components/documentation/document-status-badge";
import { DocumentVisibilityBadge } from "@/components/documentation/document-visibility-badge";
import { DocumentBreadcrumb } from "@/components/documentation/document-breadcrumb";
import { DocumentComments } from "@/components/documentation/document-comments";
import { DocumentVersionHistory } from "@/components/documentation/document-version-history";
import { DocumentStatisticsView } from "@/components/documentation/document-statistics";
import { DocumentTimeline } from "@/components/documentation/document-timeline";
import { DocumentFavoriteButton } from "@/components/documentation/document-favorite-button";
import { DocumentExportDialog } from "@/components/documentation/document-export-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/contexts/toast-context";
import { useSession } from "next-auth/react";

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const { data: session } = useSession();
  const id = params?.id as string;

  const { data: doc, loading, refetch } = useDocument(id);
  const { publish, archive, duplicate, loading: lifecycleLoading } = useDocumentLifecycle();
  const comments = useDocumentComments(id);
  const versions = useDocumentVersions(id);
  const stats = useDocumentStatistics(id);
  const timeline = useDocumentTimeline(id);
  const favorite = useDocumentFavorite(id);

  const [activeTab, setActiveTab] = useState("content");
  const [confirmAction, setConfirmAction] = useState<"publish" | "archive" | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const handlePublish = useCallback(async () => {
    try { await publish(id); addToast({ type: "success", message: "Document published" }); refetch(); }
    catch (e) { addToast({ type: "error", message: e instanceof Error ? e.message : "Failed to publish" }); }
    setConfirmAction(null);
  }, [id, publish, addToast, refetch]);

  const handleArchive = useCallback(async () => {
    try { await archive(id); addToast({ type: "success", message: "Document archived" }); refetch(); }
    catch (e) { addToast({ type: "error", message: e instanceof Error ? e.message : "Failed to archive" }); }
    setConfirmAction(null);
  }, [id, archive, addToast, refetch]);

  const handleDuplicate = useCallback(async () => {
    try { const d = await duplicate(id); addToast({ type: "success", message: "Document duplicated" }); router.push(`/documents/${d.id}`); }
    catch (e) { addToast({ type: "error", message: e instanceof Error ? e.message : "Failed to duplicate" }); }
  }, [id, duplicate, addToast, router]);

  const handleExport = useCallback(async (format: "markdown" | "json") => {
    try {
      const { exportDocument } = await import("@/services/documents");
      const blob = await exportDocument(id, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${doc?.slug || "document"}.${format === "markdown" ? "md" : "json"}`; a.click();
      URL.revokeObjectURL(url);
      setExportOpen(false);
    } catch { addToast({ type: "error", message: "Export failed" }); }
  }, [id, doc, addToast]);

  const handleVersionRestore = useCallback(async (version: number) => {
    try { await versions.restoreVersion(version); addToast({ type: "success", message: `Version ${version} restored` }); refetch(); }
    catch { addToast({ type: "error", message: "Failed to restore version" }); }
  }, [versions, addToast, refetch]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-surface-hover rounded animate-pulse" />
        <div className="h-64 bg-surface-hover rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!doc) {
    return <ErrorState title="Document not found" message="The requested document does not exist." />;
  }

  const tabs = ["Content", "Comments", "Versions", "Statistics", "Timeline"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{doc.title}</h1>
          <p className="text-sm text-foreground-secondary mt-1">v{doc.version}</p>
        </div>
        <div className="flex items-center gap-2">
          <DocumentFavoriteButton isFavorited={doc.isFavorited} onClick={() => favorite.toggle()} />
          {doc.status !== "ARCHIVED" && (
            <Button variant="ghost" size="sm" onClick={() => router.push(`/documents/${id}/edit`)} leftIcon={<Pencil className="h-4 w-4" />}>Edit</Button>
          )}
          {doc.status === "DRAFT" && <Button variant="gradient" size="sm" leftIcon={<Send className="h-4 w-4" />} onClick={() => setConfirmAction("publish")}>Publish</Button>}
          {doc.status !== "ARCHIVED" && <Button variant="ghost" size="sm" leftIcon={<Archive className="h-4 w-4" />} onClick={() => setConfirmAction("archive")}>Archive</Button>}
          <Button variant="ghost" size="sm" leftIcon={<Copy className="h-4 w-4" />} onClick={handleDuplicate}>Duplicate</Button>
          <Button variant="ghost" size="sm" leftIcon={<Download className="h-4 w-4" />} onClick={() => setExportOpen(true)}>Export</Button>
          <Button variant="ghost" size="sm" onClick={refetch} leftIcon={<RefreshCw className="h-4 w-4" />}>Refresh</Button>
        </div>
      </div>

      <DocumentBreadcrumb
        items={[
          ...(doc.parent ? [{ label: doc.parent.title, href: `/documents/${doc.parent.id}` }] : []),
          { label: doc.title, href: "" },
        ].filter((i) => i.href)}
      />

      <div className="flex items-center gap-3 text-sm text-foreground-secondary">
        <DocumentStatusBadge status={doc.status} />
        <DocumentVisibilityBadge visibility={doc.visibility} />
        <span>By {doc.createdByName}</span>
        {doc.updatedByName && <span>· Updated by {doc.updatedByName}</span>}
        <span>· {new Date(doc.updatedAt).toLocaleDateString()}</span>
      </div>

      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.toLowerCase() ? "text-accent border-accent" : "text-foreground-muted border-transparent hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "content" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="p-5 lg:col-span-3">
            {doc.content ? (
              <div className="whitespace-pre-wrap text-sm text-foreground-secondary leading-relaxed">{doc.content}</div>
            ) : (
              <p className="text-foreground-muted italic">No content</p>
            )}
          </Card>
          <Card className="p-5">
            <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Details</h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-foreground-muted">Type</dt><dd className="text-foreground capitalize">{doc.type.toLowerCase()}</dd></div>
              <div className="flex justify-between"><dt className="text-foreground-muted">Status</dt><dd><DocumentStatusBadge status={doc.status} /></dd></div>
              <div className="flex justify-between"><dt className="text-foreground-muted">Version</dt><dd className="text-foreground font-mono">{doc.version}</dd></div>
              <div className="flex justify-between"><dt className="text-foreground-muted">Created</dt><dd className="text-foreground">{new Date(doc.createdAt).toLocaleDateString()}</dd></div>
              <div className="flex justify-between"><dt className="text-foreground-muted">Updated</dt><dd className="text-foreground">{new Date(doc.updatedAt).toLocaleDateString()}</dd></div>
              {doc.publishedAt && <div className="flex justify-between"><dt className="text-foreground-muted">Published</dt><dd className="text-foreground">{new Date(doc.publishedAt).toLocaleDateString()}</dd></div>}
            </dl>
          </Card>
        </div>
      )}

      {activeTab === "comments" && (
        <DocumentComments
          comments={comments.data}
          loading={comments.loading}
          onAddComment={comments.create}
          onDeleteComment={comments.remove}
          currentUserId={session?.user?.id}
        />
      )}

      {activeTab === "versions" && (
        <DocumentVersionHistory
          versions={versions.data}
          loading={versions.loading}
          onRestore={handleVersionRestore}
        />
      )}

      {activeTab === "statistics" && (
        <DocumentStatisticsView stats={stats.data} loading={stats.loading} />
      )}

      {activeTab === "timeline" && (
        <DocumentTimeline events={timeline.data} loading={timeline.loading} />
      )}

      {doc.children && doc.children.length > 0 && activeTab === "content" && (
        <Card className="p-5">
          <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-3">Sub-pages</h4>
          <div className="space-y-1">
            {doc.children.map((child) => (
              <a key={child.id} href={`/documents/${child.id}`} className="block p-2 rounded-lg text-sm text-accent hover:bg-surface-hover transition-colors">{child.title}</a>
            ))}
          </div>
        </Card>
      )}

      <ConfirmDialog isOpen={confirmAction === "publish"} onClose={() => setConfirmAction(null)} onConfirm={handlePublish}
        title="Publish Document" message="Are you sure you want to publish this document?" confirmLabel="Publish" />
      <ConfirmDialog isOpen={confirmAction === "archive"} onClose={() => setConfirmAction(null)} onConfirm={handleArchive}
        title="Archive Document" message="Archived documents become read-only." confirmLabel="Archive" variant="warning" />

      <DocumentExportDialog isOpen={exportOpen} onClose={() => setExportOpen(false)} onExport={handleExport} />
    </div>
  );
}

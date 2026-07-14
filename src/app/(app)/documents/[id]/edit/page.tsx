"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDocument, useDocumentActions } from "@/hooks/use-documents";
import { DocumentEditor } from "@/components/documentation/document-editor";
import { DocumentBreadcrumb } from "@/components/documentation/document-breadcrumb";
import { DocumentStatusBadge } from "@/components/documentation/document-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Save, ArrowLeft, Eye, FileText } from "lucide-react";
import Link from "next/link";

export default function DocumentEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("ORGANIZATION");
  const [saving, setSaving] = useState(false);

  const { data: doc, loading } = useDocument(id);
  const { update } = useDocumentActions();

  useEffect(() => {
    if (doc) {
      setTitle(doc.title);
      setContent(doc.content || "");
      setVisibility(doc.visibility);
    }
  }, [doc]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await update(id, { title, content, visibility: visibility as any });
      router.push(`/documents/${id}`);
    } catch {} finally { setSaving(false); }
  };

  if (loading) {
    return <div className="animate-pulse h-96 rounded-2xl bg-surface-hover" />;
  }

  if (!doc) {
    return <div className="text-center py-16 text-foreground-muted">Document not found</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(`/documents/${id}`)} className="p-1.5 rounded-lg hover:bg-surface-hover text-foreground-muted"><ArrowLeft className="h-4 w-4" /></button>
          <DocumentBreadcrumb items={[{ label: "Documents", href: "/documents" }, { label: doc.title, href: `/documents/${id}` }, { label: "Edit", href: `/documents/${id}/edit` }]} />
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/documents/${id}`}><Button variant="outline" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />}>Preview</Button></Link>
          <Button variant="gradient" size="sm" leftIcon={<Save className="h-3.5 w-3.5" />} onClick={handleSave} isLoading={saving}>Save</Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-accent" />
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Document title" className="text-xl font-bold border-0 bg-transparent px-0 focus-visible:ring-0" />
        <DocumentStatusBadge status={doc.status} />
      </div>

      <div className="flex items-center gap-2">
        <Select value={visibility} onChange={(e) => setVisibility(e.target.value)} options={[{ value: "PRIVATE", label: "Private" }, { value: "PROJECT", label: "Project" }, { value: "ORGANIZATION", label: "Organization" }, { value: "PUBLIC", label: "Public" }]} />
      </div>

      <DocumentEditor initialContent={content} onChange={setContent} placeholder="Start writing your document in Markdown..." />
    </div>
  );
}

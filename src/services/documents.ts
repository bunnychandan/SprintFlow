import type { DocumentItem, DocumentDetail, DocumentCommentItem, DocumentVersionItem, DocumentTimelineEvent, DocumentStatistics, SearchResult, ListResponse, QueryParams, CreateDocumentPayload, UpdateDocumentPayload, CreateCommentPayload, UpdateCommentPayload } from "@/types/documentation";

export async function getDocuments(params?: QueryParams): Promise<ListResponse<DocumentItem>> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));
  if (params?.search) sp.set("search", params.search);
  if (params?.knowledgeBaseId) sp.set("knowledgeBaseId", params.knowledgeBaseId);
  if (params?.status) sp.set("status", params.status);
  if (params?.type) sp.set("type", params.type);
  if (params?.visibility) sp.set("visibility", params.visibility);
  if (params?.parentId !== undefined) {
    if (params.parentId === null) sp.set("parentId", "null");
    else sp.set("parentId", params.parentId);
  }
  if (params?.sortBy) sp.set("sortBy", params.sortBy);
  if (params?.sortOrder) sp.set("sortOrder", params.sortOrder);
  if (params?.archived !== undefined) sp.set("archived", String(params.archived));
  const qs = sp.toString();
  const res = await fetch(`/api/documents${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch documents");
  return res.json();
}

export async function getDocument(id: string): Promise<DocumentDetail> {
  const res = await fetch(`/api/documents/${id}`);
  if (!res.ok) throw new Error("Failed to fetch document");
  return res.json();
}

export async function createDocument(data: CreateDocumentPayload): Promise<DocumentDetail> {
  const res = await fetch("/api/documents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create document");
  return res.json();
}

export async function updateDocument(id: string, data: UpdateDocumentPayload): Promise<DocumentDetail> {
  const res = await fetch(`/api/documents/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update document");
  return res.json();
}

export async function deleteDocument(id: string): Promise<void> {
  const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete document");
}

export async function publishDocument(id: string, reviewerId?: string): Promise<DocumentDetail> {
  const res = await fetch(`/api/documents/${id}/publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reviewerId }),
  });
  if (!res.ok) throw new Error("Failed to publish document");
  return res.json();
}

export async function archiveDocument(id: string): Promise<DocumentDetail> {
  const res = await fetch(`/api/documents/${id}/archive`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to archive document");
  return res.json();
}

export async function restoreDocument(id: string): Promise<DocumentDetail> {
  const res = await fetch(`/api/documents/${id}/restore`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to restore document");
  return res.json();
}

export async function duplicateDocument(id: string, targetKnowledgeBaseId?: string, includeChildren?: boolean): Promise<DocumentDetail> {
  const res = await fetch(`/api/documents/${id}/duplicate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetKnowledgeBaseId, includeChildren }),
  });
  if (!res.ok) throw new Error("Failed to duplicate document");
  return res.json();
}

export async function getDocumentVersions(id: string): Promise<DocumentVersionItem[]> {
  const res = await fetch(`/api/documents/${id}/versions`);
  if (!res.ok) throw new Error("Failed to fetch versions");
  return res.json();
}

export async function restoreDocumentVersion(id: string, version: number): Promise<DocumentDetail> {
  const res = await fetch(`/api/documents/${id}/versions/restore`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ version }),
  });
  if (!res.ok) throw new Error("Failed to restore version");
  return res.json();
}

export async function getDocumentComments(id: string): Promise<DocumentCommentItem[]> {
  const res = await fetch(`/api/documents/${id}/comments`);
  if (!res.ok) throw new Error("Failed to fetch comments");
  return res.json();
}

export async function createDocumentComment(id: string, data: CreateCommentPayload): Promise<DocumentCommentItem> {
  const res = await fetch(`/api/documents/${id}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create comment");
  return res.json();
}

export async function updateDocumentComment(documentId: string, commentId: string, data: UpdateCommentPayload): Promise<DocumentCommentItem> {
  const res = await fetch(`/api/documents/${documentId}/comments/${commentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update comment");
  return res.json();
}

export async function deleteDocumentComment(documentId: string, commentId: string): Promise<void> {
  const res = await fetch(`/api/documents/${documentId}/comments/${commentId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete comment");
}

export async function toggleDocumentFavorite(id: string): Promise<{ isFavorited: boolean }> {
  const res = await fetch(`/api/documents/${id}/favorite`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to toggle favorite");
  return res.json();
}

export async function removeDocumentFavorite(id: string): Promise<void> {
  const res = await fetch(`/api/documents/${id}/favorite`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to remove favorite");
}

export async function searchDocuments(query: string, params?: { knowledgeBaseId?: string; status?: string; type?: string; page?: number; pageSize?: number }): Promise<ListResponse<SearchResult>> {
  const sp = new URLSearchParams({ query });
  if (params?.knowledgeBaseId) sp.set("knowledgeBaseId", params.knowledgeBaseId);
  if (params?.status) sp.set("status", params.status);
  if (params?.type) sp.set("type", params.type);
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));
  const res = await fetch(`/api/documents/search?${sp.toString()}`);
  if (!res.ok) throw new Error("Failed to search documents");
  return res.json();
}

export async function getDocumentStatistics(id: string): Promise<DocumentStatistics> {
  const res = await fetch(`/api/documents/${id}/stats`);
  if (!res.ok) throw new Error("Failed to fetch statistics");
  return res.json();
}

export async function getDocumentTimeline(id: string): Promise<DocumentTimelineEvent[]> {
  const res = await fetch(`/api/documents/${id}/timeline`);
  if (!res.ok) throw new Error("Failed to fetch timeline");
  return res.json();
}

export async function exportDocument(id: string, format: "markdown" | "json"): Promise<Blob> {
  const res = await fetch(`/api/documents/${id}/export?format=${format}`);
  if (!res.ok) throw new Error("Failed to export document");
  return res.blob();
}

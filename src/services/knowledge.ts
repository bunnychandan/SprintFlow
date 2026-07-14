import type { KnowledgeBaseItem, KnowledgeBaseDetail, ListResponse, QueryParams, CreateKnowledgeBasePayload, UpdateKnowledgeBasePayload } from "@/types/documentation";

export async function getKnowledgeBases(params?: QueryParams): Promise<ListResponse<KnowledgeBaseItem>> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));
  if (params?.search) sp.set("search", params.search);
  if (params?.archived !== undefined) sp.set("archived", String(params.archived));
  const qs = sp.toString();
  const res = await fetch(`/api/knowledge${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch knowledge bases");
  return res.json();
}

export async function getKnowledgeBase(id: string): Promise<KnowledgeBaseDetail> {
  const res = await fetch(`/api/knowledge/${id}`);
  if (!res.ok) throw new Error("Failed to fetch knowledge base");
  return res.json();
}

export async function createKnowledgeBase(data: CreateKnowledgeBasePayload): Promise<KnowledgeBaseItem> {
  const res = await fetch("/api/knowledge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create knowledge base");
  return res.json();
}

export async function updateKnowledgeBase(id: string, data: UpdateKnowledgeBasePayload): Promise<KnowledgeBaseItem> {
  const res = await fetch(`/api/knowledge/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update knowledge base");
  return res.json();
}

export async function deleteKnowledgeBase(id: string): Promise<void> {
  const res = await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete knowledge base");
}

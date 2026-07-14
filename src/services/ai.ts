import type { AIConversationItem, AIConversationDetail, AIMessageItem, AIPromptTemplateItem, AIUsageItem, AIUsageSummary, AIChatRequest, AIChatResponse, AIContextSummary, ListResponse, CreateConversationPayload, UpdateConversationPayload, CreatePromptPayload, UpdatePromptPayload } from "@/types/ai";

export async function getConversations(page = 1, pageSize = 20): Promise<ListResponse<AIConversationItem>> {
  const res = await fetch(`/api/ai/conversations?page=${page}&pageSize=${pageSize}`);
  if (!res.ok) throw new Error("Failed to fetch conversations");
  return res.json();
}

export async function getConversation(id: string): Promise<AIConversationDetail> {
  const res = await fetch(`/api/ai/conversations/${id}`);
  if (!res.ok) throw new Error("Failed to fetch conversation");
  return res.json();
}

export async function createConversation(data: CreateConversationPayload): Promise<AIConversationItem> {
  const res = await fetch("/api/ai/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error("Failed to create conversation");
  return res.json();
}

export async function updateConversation(id: string, data: UpdateConversationPayload): Promise<AIConversationItem> {
  const res = await fetch(`/api/ai/conversations/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error("Failed to update conversation");
  return res.json();
}

export async function deleteConversation(id: string): Promise<void> {
  const res = await fetch(`/api/ai/conversations/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete conversation");
}

export async function sendChatMessage(data: AIChatRequest): Promise<AIChatResponse> {
  const res = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

export async function getPrompts(category?: string): Promise<ListResponse<AIPromptTemplateItem>> {
  const sp = category ? `?category=${category}` : "";
  const res = await fetch(`/api/ai/prompts${sp}`);
  if (!res.ok) throw new Error("Failed to fetch prompts");
  return res.json();
}

export async function createPrompt(data: CreatePromptPayload): Promise<AIPromptTemplateItem> {
  const res = await fetch("/api/ai/prompts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error("Failed to create prompt");
  return res.json();
}

export async function updatePrompt(id: string, data: UpdatePromptPayload): Promise<AIPromptTemplateItem> {
  const res = await fetch(`/api/ai/prompts/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error("Failed to update prompt");
  return res.json();
}

export async function deletePrompt(id: string): Promise<void> {
  const res = await fetch(`/api/ai/prompts/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete prompt");
}

export async function getUsage(params?: { period?: string; provider?: string; userId?: string; from?: string; to?: string }): Promise<AIUsageSummary> {
  const sp = new URLSearchParams();
  if (params?.period) sp.set("period", params.period);
  if (params?.provider) sp.set("provider", params.provider);
  if (params?.userId) sp.set("userId", params.userId);
  if (params?.from) sp.set("from", params.from);
  if (params?.to) sp.set("to", params.to);
  const res = await fetch(`/api/ai/usage?${sp.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch usage");
  return res.json();
}

export async function getAIContext(type: "project" | "task" | "sprint" | "document", id: string): Promise<AIContextSummary> {
  const res = await fetch(`/api/ai/context/${type}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch context");
  return res.json();
}

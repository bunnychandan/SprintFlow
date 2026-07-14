export type AIProvider = "OPENAI" | "ANTHROPIC" | "GOOGLE" | "OLLAMA" | "CUSTOM";
export type AIConversationStatus = "ACTIVE" | "ARCHIVED";
export type AIPromptCategory = "GENERAL" | "PROJECT" | "TASK" | "SPRINT" | "DOCUMENTATION" | "DEVOPS" | "ANALYTICS" | "RESOURCE" | "CUSTOM";
export type AIMessageRole = "SYSTEM" | "USER" | "ASSISTANT";
export type AIAgentType = "GENERAL" | "PROJECT_MANAGER" | "SCRUM_MASTER" | "DEVELOPER" | "DEVOPS" | "BUSINESS_ANALYST" | "QA" | "DOCUMENTATION";

export interface AIConversationItem {
  id: string;
  organizationId: string;
  userId: string;
  title: string;
  status: AIConversationStatus;
  agentType: AIAgentType;
  provider: AIProvider;
  projectId: string | null;
  sprintId: string | null;
  taskId: string | null;
  messageCount: number;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AIConversationDetail extends AIConversationItem {
  messages: AIMessageItem[];
}

export interface AIMessageItem {
  id: string;
  conversationId: string;
  role: AIMessageRole;
  content: string;
  tokenCount: number;
  model: string | null;
  responseTime: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AIPromptTemplateItem {
  id: string;
  organizationId: string;
  name: string;
  category: AIPromptCategory;
  description: string | null;
  prompt: string;
  createdById: string;
  createdByName: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIUsageItem {
  id: string;
  organizationId: string;
  userId: string;
  provider: AIProvider;
  model: string | null;
  tokens: number;
  requests: number;
  cost: number;
  createdAt: string;
}

export interface AIUsageSummary {
  totalTokens: number;
  totalRequests: number;
  totalCost: number;
  daily: { date: string; tokens: number; requests: number; cost: number }[];
  byUser: { userId: string; userName: string | null; tokens: number; requests: number; cost: number }[];
  byModel: { model: string; tokens: number; requests: number; cost: number }[];
  byProvider: { provider: AIProvider; tokens: number; requests: number; cost: number }[];
}

export interface AIChatRequest {
  conversationId?: string;
  message: string;
  provider?: AIProvider;
  agentType?: AIAgentType;
  model?: string;
  projectId?: string;
  sprintId?: string;
  taskId?: string;
}

export interface AIChatResponse {
  message: AIMessageItem;
  conversationId: string;
  tokenCount: number;
  responseTime: number;
}

export interface AIContextSummary {
  project?: Record<string, unknown>;
  task?: Record<string, unknown>;
  sprint?: Record<string, unknown>;
  document?: Record<string, unknown>;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ListResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface CreateConversationPayload {
  title?: string;
  agentType?: AIAgentType;
  provider?: AIProvider;
  projectId?: string;
  sprintId?: string;
  taskId?: string;
}

export interface UpdateConversationPayload {
  title?: string;
  status?: AIConversationStatus;
  agentType?: AIAgentType;
  provider?: AIProvider;
}

export interface CreatePromptPayload {
  name: string;
  category?: AIPromptCategory;
  description?: string | null;
  prompt: string;
  isPublic?: boolean;
}

export interface UpdatePromptPayload {
  name?: string;
  category?: AIPromptCategory;
  description?: string | null;
  prompt?: string;
  isPublic?: boolean;
}

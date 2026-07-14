export type IntegrationProvider = "GITHUB" | "GITLAB" | "BITBUCKET" | "AZURE_DEVOPS" | "SLACK" | "MICROSOFT_TEAMS" | "GOOGLE_CALENDAR" | "OUTLOOK" | "ZOOM" | "GOOGLE_MEET" | "JENKINS" | "ARGOCD" | "JIRA" | "LINEAR" | "NOTION" | "FIGMA" | "CUSTOM";
export type IntegrationStatus = "CONNECTED" | "DISCONNECTED" | "ERROR" | "PENDING";
export type IntegrationType = "SOURCE_CONTROL" | "COMMUNICATION" | "CALENDAR" | "VIDEO" | "CI_CD" | "PROJECT_MANAGEMENT" | "DESIGN" | "DOCUMENTATION" | "CUSTOM";
export type WebhookEvent = "PUSH" | "PULL_REQUEST" | "ISSUE" | "PIPELINE" | "DEPLOYMENT" | "TASK" | "SPRINT" | "PROJECT" | "RELEASE" | "COMMENT" | "CUSTOM";

export interface IntegrationItem {
  id: string;
  organizationId: string;
  name: string;
  provider: IntegrationProvider;
  type: IntegrationType;
  status: IntegrationStatus;
  description: string | null;
  webhookUrl: string | null;
  lastSyncAt: string | null;
  createdById: string;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationDetail extends IntegrationItem {
  configuration: Record<string, unknown> | null;
  logs: IntegrationLogItem[];
  webhooks: IntegrationWebhookItem[];
}

export interface IntegrationLogItem {
  id: string;
  integrationId: string;
  action: string;
  status: string;
  message: string | null;
  duration: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface IntegrationWebhookItem {
  id: string;
  integrationId: string;
  event: WebhookEvent;
  payload: Record<string, unknown> | null;
  processed: boolean;
  processedAt: string | null;
  createdAt: string;
}

export interface IntegrationDashboard {
  total: number;
  connected: number;
  error: number;
  pending: number;
  byType: { type: IntegrationType; count: number }[];
  recentSyncs: IntegrationItem[];
}

export interface Pagination { page: number; pageSize: number; total: number; totalPages: number; }
export interface ListResponse<T> { data: T[]; pagination: Pagination; }

export interface CreateIntegrationPayload {
  name: string;
  provider: IntegrationProvider;
  type: IntegrationType;
  description?: string | null;
  configuration?: Record<string, unknown>;
}

export interface UpdateIntegrationPayload {
  name?: string;
  description?: string | null;
  configuration?: Record<string, unknown>;
}

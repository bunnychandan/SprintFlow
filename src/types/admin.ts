import type { User, AuditLog, Invitation } from "@prisma/client";

import type { SortDirection } from "./project";
export type { SortDirection };

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UserWithMeta extends User {
  _count?: { projects: number; tasks: number };
}

export interface AuditLogWithActor extends AuditLog {
  actor: { name: string | null; image: string | null } | null;
}

export interface InvitationWithSender extends Invitation {
  sender: { id: string; name: string | null; email: string };
}

export interface InvitationDetailResponse {
  invitation: InvitationWithSender;
  auditLogs: Array<Record<string, unknown>>;
  linkedUser: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
  } | null;
}

export interface AuditDashboardStats {
  totalEvents: number;
  eventsToday: number;
  eventsThisWeek: number;
  failedOperations: number;
  activeAdmins: number;
  mostActiveUsers: Array<{ id: string; name: string | null; email: string; count: number }>;
  mostCommonActions: Array<{ action: string; count: number }>;
  topModifiedEntities: Array<{ entityType: string; count: number }>;
}

export interface AuditDetailResponse {
  log: AuditLog & {
    actor: { id: string; name: string | null; email: string; image: string | null; role: string } | null;
    metadata?: Record<string, unknown>;
  };
  previousLogs: Array<{
    id: string;
    action: string;
    details: string | null;
    createdAt: Date;
    actor: { name: string | null; email: string } | null;
  }>;
  relatedUser: { id: string; name: string | null; email: string; role: string } | null;
  relatedProject: { id: string; name: string; code: string } | null;
}

export interface SystemHealth {
  ok: boolean;
  service: string;
  database: string;
  timestamp: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  totalTasks: number;
  activeSprints: number;
  totalAdmins: number;
}


export interface TableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  hidden?: boolean;
}

export interface TableState {
  page: number;
  pageSize: number;
  sortKey: string;
  sortDirection: SortDirection;
  search: string;
  filters: Record<string, string>;
  selected: Set<string>;
}

// ─── System Health Types ───────────────────────────────────────────────────

export type HealthStatusType = "HEALTHY" | "WARNING" | "CRITICAL" | "UNKNOWN";
export type AlertSeverityType = "INFO" | "WARNING" | "CRITICAL";
export type AlertStatusType = "ACTIVE" | "RESOLVED";

export interface HealthServiceStatus {
  name: string;
  status: HealthStatusType;
  label: string;
}

export interface SystemHealthDashboard {
  overall: HealthServiceStatus;
  services: {
    database: HealthServiceStatus;
    api: HealthServiceStatus;
    auth: HealthServiceStatus;
    storage: HealthServiceStatus;
    email: HealthServiceStatus;
    environment: HealthServiceStatus;
    background: HealthServiceStatus;
  };
  metrics: {
    uptime: number;
    serverStartTime: string;
    memoryUsageMB: number;
    heapUsageMB: number;
    nodeVersion: string;
    nextjsVersion: string;
    prismaVersion: string;
    environment: string;
    avgApiResponseTime: number;
    totalRequests: number;
    errorCount: number;
    successRate: number;
  };
  database: {
    connected: boolean;
    avgQueryTimeMs: number;
    migrationStatus: string;
    prismaClientVersion: string;
    databaseVersion: string;
    totalUsers: number;
    totalProjects: number;
    totalTasks: number;
    totalSprints: number;
    totalAuditLogs: number;
    totalInvitations: number;
    databaseSizeMB: number;
  };
  apiEndpoints: Array<{
    endpoint: string;
    method: string;
    avgResponseTime: number;
    requestCount: number;
    failureCount: number;
    lastAccess: string | null;
    status: HealthStatusType;
  }>;
  backgroundServices: Array<{
    name: string;
    status: HealthStatusType;
    lastRun: string | null;
    message: string;
  }>;
  environment: {
    nodeEnv: string;
    appVersion: string;
    buildVersion: string;
    gitCommit: string;
    deploymentEnv: string;
    providers: {
      database: string;
      storage: string;
      email: string;
      oauth: string;
    };
  };
  activeAlerts: number;
}

export interface HealthHistoryPoint {
  id: string;
  timestamp: string;
  overallStatus: HealthStatusType;
  databaseStatus: HealthStatusType;
  apiStatus: HealthStatusType;
  appUptime: number | null;
  memoryUsageMB: number | null;
  avgApiResponseMs: number | null;
  errorCount: number | null;
  totalRequests: number | null;
  successRate: number | null;
}

export interface HealthHistoryResponse {
  snapshots: HealthHistoryPoint[];
  total: number;
}

export interface DiagnosticsCheck {
  name: string;
  status: "PASS" | "FAIL" | "WARNING";
  message: string;
  details?: string;
}

export interface DiagnosticsResult {
  checks: DiagnosticsCheck[];
  timestamp: string;
  summary: { pass: number; fail: number; warning: number; total: number };
}

export interface MonitoringSettingsData {
  healthCheckInterval: number;
  alertThresholdWarning: number;
  alertThresholdCritical: number;
  pollingFrequency: number;
  logRetention: number;
  monitoringEnabled: boolean;
  apiResponseThreshold: number;
  errorRateThreshold: number;
  memoryThresholdMB: number;
  diskThresholdPercent: number;
}

export interface AlertItem {
  id: string;
  title: string;
  description: string | null;
  severity: AlertSeverityType;
  source: string;
  timestamp: string;
  status: AlertStatusType;
  resolvedAt: string | null;
  resolvedBy: string | null;
}

export interface AlertListResponse {
  alerts: AlertItem[];
  total: number;
}

// ─── Notification Types ─────────────────────────────────────────────────

export type NotificationTypeValue =
  | "TASK_ASSIGNED" | "TASK_UPDATED" | "TASK_COMPLETED"
  | "TASK_COMMENT" | "TASK_MENTION"
  | "SPRINT_STARTED" | "SPRINT_COMPLETED"
  | "PROJECT_CREATED" | "PROJECT_UPDATED" | "PROJECT_ARCHIVED"
  | "USER_INVITED" | "USER_JOINED" | "ADMIN_CREATED"
  | "SYSTEM_ALERT" | "AUDIT_WARNING" | "SECURITY_EVENT";

export type NotificationPriorityValue = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface NotificationItem {
  id: string;
  recipientId: string;
  actorId: string | null;
  projectId: string | null;
  taskId: string | null;
  type: NotificationTypeValue;
  title: string;
  message: string;
  priority: NotificationPriorityValue;
  channel: string;
  isRead: boolean;
  readAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  actor: { id: string; name: string | null; email: string; image: string | null } | null;
  project: { id: string; name: string; code: string } | null;
  task: { id: string; title: string } | null;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  total: number;
  unreadCount: number;
}

export interface UnreadCountResponse {
  count: number;
}

export interface NotificationPreferencesData {
  emailNotifications: boolean;
  slackNotifications: boolean;
  teamsNotifications: boolean;
  pushNotifications: boolean;
  digestFrequency: string;
  taskAssigned: boolean;
  taskUpdated: boolean;
  taskCompleted: boolean;
  taskComment: boolean;
  taskMention: boolean;
  sprintStarted: boolean;
  sprintCompleted: boolean;
  projectCreated: boolean;
  projectUpdated: boolean;
  projectArchived: boolean;
  userInvited: boolean;
  userJoined: boolean;
  adminCreated: boolean;
  systemAlert: boolean;
  auditWarning: boolean;
  securityEvent: boolean;
}

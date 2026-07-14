export type DeploymentStatus = "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "CANCELLED" | "ROLLED_BACK";
export type EnvironmentType = "DEVELOPMENT" | "TESTING" | "STAGING" | "PRODUCTION";
export type PipelineStatus = "IDLE" | "RUNNING" | "SUCCESS" | "FAILED";

export interface Deployment {
  id: string;
  projectId: string;
  projectName: string;
  projectCode: string;
  releaseId: string | null;
  releaseName: string | null;
  version: string;
  environment: EnvironmentType;
  status: DeploymentStatus;
  commitHash: string | null;
  branch: string | null;
  deployedById: string;
  deployedByName: string | null;
  startedAt: string | null;
  completedAt: string | null;
  duration: number | null;
  logs: string | null;
  rollbackFromId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Pipeline {
  id: string;
  projectId: string;
  projectName: string;
  projectCode: string;
  name: string;
  provider: string;
  status: PipelineStatus;
  lastRun: string | null;
  duration: number | null;
  successCount: number;
  failureCount: number;
  configuration: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeploymentLog {
  id: string;
  deploymentId: string;
  message: string;
  level: "info" | "warn" | "error";
  timestamp: string;
}

export interface PipelineExecution {
  id: string;
  pipelineId: string;
  status: PipelineStatus;
  startedAt: string;
  completedAt: string | null;
  duration: number | null;
  triggeredBy: string;
  commitHash: string | null;
  branch: string | null;
}

export interface DevOpsDashboard {
  deployments: {
    total: number;
    success: number;
    failed: number;
    running: number;
    pending: number;
  };
  pipelines: {
    total: number;
    success: number;
    failed: number;
    running: number;
  };
  environments: EnvironmentHealth[];
  recentDeployments: Deployment[];
  deploymentTrend: Array<{ date: string; count: number; failed: number }>;
  avgDuration: number;
  successRate: number;
}

export interface EnvironmentHealth {
  environment: EnvironmentType;
  status: "healthy" | "warning" | "critical";
  lastDeployed: string | null;
  deploymentCount: number;
  successRate: number;
}

export interface Metrics {
  totalDeployments: number;
  successRate: number;
  avgDuration: number;
  failureRate: number;
  deploymentsByEnv: Record<string, number>;
}

export interface DevOpsFilters {
  projectId?: string;
  environment?: EnvironmentType;
  status?: DeploymentStatus | PipelineStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DevOpsTimelineEvent {
  id: string;
  type: "deployment" | "pipeline" | "rollback";
  title: string;
  description: string;
  status: string;
  timestamp: string;
  environment?: string;
}

export interface DevOpsStatistics {
  totalDeployments: number;
  successfulDeployments: number;
  failedDeployments: number;
  successRate: number;
  averageDuration: number;
  deploymentsByEnvironment: Array<{ environment: string; count: number }>;
  deploymentsByStatus: Array<{ status: string; count: number }>;
  pipelineSuccessRate: number;
  totalPipelineRuns: number;
}

export interface ExportPayload {
  format: "csv" | "json";
  type: "deployments" | "pipelines" | "dashboard";
  filters?: DevOpsFilters;
}

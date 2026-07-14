export interface DateRange {
  from?: string;
  to?: string;
}

export interface AnalyticsFilters {
  dateRange?: DateRange;
  projectId?: string;
  sprintId?: string;
  epicId?: string;
  releaseId?: string;
  userId?: string;
  teamId?: string;
}

export interface KPIStat {
  label: string;
  value: number | string;
  change?: number;
  trend?: "up" | "down" | "neutral";
  icon?: string;
  color?: string;
}

export interface DashboardAnalytics {
  kpis: KPIStat[];
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  activeSprints: number;
  teamMembers: number;
  velocityTrend: VelocityDataPoint[];
  recentActivity: Array<{ date: string; action: string; entity: string; user: string }>;
}

export interface VelocityDataPoint {
  sprint: string;
  sprintId: string;
  completedPoints: number;
  committedPoints: number;
  completionPct: number;
}

export interface BurndownDataPoint {
  date: string;
  remaining: number;
  ideal: number;
  scope: number;
}

export interface BurnupDataPoint {
  date: string;
  total: number;
  completed: number;
  scope: number;
}

export interface BurndownChart {
  data: BurndownDataPoint[];
  totalPoints: number;
  completedPoints: number;
  daysElapsed: number;
  totalDays: number;
}

export interface BurnupChart {
  data: BurnupDataPoint[];
  totalPoints: number;
  completedPoints: number;
}

export interface CFDataPoint {
  date: string;
  todo: number;
  inProgress: number;
  inReview: number;
  done: number;
  blocked: number;
  backlog: number;
}

export interface CumulativeFlowChart {
  data: CFDataPoint[];
}

export interface CycleTimeDataPoint {
  label: string;
  value: number;
}

export interface CycleTimeChart {
  average: number;
  median: number;
  p95: number;
  distribution: CycleTimeDataPoint[];
}

export interface LeadTimeChart {
  average: number;
  median: number;
  p95: number;
  distribution: CycleTimeDataPoint[];
}

export interface WorkloadDataPoint {
  userId: string;
  name: string | null;
  email: string;
  image: string | null;
  taskCount: number;
  storyPoints: number;
  completedCount: number;
  inProgressCount: number;
  overdueCount: number;
  capacity: number;
}

export interface WorkloadChart {
  data: WorkloadDataPoint[];
}

export interface TeamPerformance {
  userId: string;
  name: string | null;
  email: string;
  image: string | null;
  completedTasks: number;
  completedPoints: number;
  avgCycleTime: number;
  tasksInProgress: number;
  velocityTrend: number[];
}

export interface ProjectHealth {
  projectId: string;
  projectName: string;
  projectCode: string;
  health: "good" | "warning" | "critical";
  completionPct: number;
  overdueTasks: number;
  blockedTasks: number;
  sprintVelocity: number;
  trend: "up" | "down" | "stable";
  lastUpdated: string;
}

export interface SprintHealth {
  sprintId: string;
  sprintName: string;
  health: "good" | "warning" | "critical";
  completionPct: number;
  daysRemaining: number;
  totalDays: number;
  pointsCompleted: number;
  pointsTotal: number;
  blockedTasks: number;
  trend: "up" | "down" | "stable";
}

export interface ReleaseHealth {
  releaseId: string;
  releaseName: string;
  version: string | null;
  health: "good" | "warning" | "critical";
  completionPct: number;
  tasksCompleted: number;
  tasksTotal: number;
  pointsCompleted: number;
  pointsTotal: number;
  daysUntilTarget: number | null;
  trend: "up" | "down" | "stable";
}

export interface EpicHealth {
  epicId: string;
  epicTitle: string;
  epicColor: string;
  health: "good" | "warning" | "critical";
  completionPct: number;
  taskCount: number;
  completedTasks: number;
  pointsTotal: number;
  pointsCompleted: number;
  daysUntilTarget: number | null;
  trend: "up" | "down" | "stable";
}

export interface ProjectAnalytics {
  projectId: string;
  projectName: string;
  projectCode: string;
  kpis: KPIStat[];
  taskDistribution: Array<{ status: string; count: number }>;
  priorityDistribution: Array<{ priority: string; count: number }>;
  typeDistribution: Array<{ type: string; count: number }>;
  sprintVelocity: VelocityDataPoint[];
  teamPerformance: TeamPerformance[];
  overdueTasks: number;
  completionPct: number;
}

export interface SprintAnalytics {
  sprintId: string;
  sprintName: string;
  kpis: KPIStat[];
  burndown: BurndownChart;
  velocity: VelocityDataPoint;
  taskDistribution: Array<{ status: string; count: number }>;
  priorityDistribution: Array<{ priority: string; count: number }>;
  assigneeDistribution: Array<{ userId: string; name: string | null; email: string; image: string | null; taskCount: number; completedCount: number; storyPoints: number }>;
}

export interface ReleaseAnalytics {
  releaseId: string;
  releaseName: string;
  version: string | null;
  kpis: KPIStat[];
  taskDistribution: Array<{ status: string; count: number }>;
  completionPct: number;
  totalPoints: number;
  completedPoints: number;
  daysUntilTarget: number | null;
}

export interface EpicAnalytics {
  epicId: string;
  epicTitle: string;
  epicColor: string;
  kpis: KPIStat[];
  taskDistribution: Array<{ status: string; count: number }>;
  completionPct: number;
  totalPoints: number;
  completedPoints: number;
  daysUntilTarget: number | null;
  timeline: Array<{ date: string; pointsCompleted: number; tasksCompleted: number }>;
}

export interface ExportPayload {
  format: "csv" | "json";
  type: "dashboard" | "project" | "sprint" | "release" | "epic" | "team" | "velocity" | "burndown" | "burnup" | "cycle-time" | "lead-time" | "cumulative-flow" | "workload";
  filters?: AnalyticsFilters;
  entityId?: string;
}

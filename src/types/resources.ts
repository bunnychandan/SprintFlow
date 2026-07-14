export interface Resource {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  department: string | null;
  designation: string | null;
  isActive: boolean;
  allocations: ResourceAllocation[];
  totalAllocation: number;
}

export interface ResourceAvailability {
  userId: string;
  name: string | null;
  email: string;
  image: string | null;
  totalCapacity: number;
  allocated: number;
  available: number;
  utilization: number;
  leaveDays: number;
  holidayDays: number;
}

export interface ResourceCapacity {
  userId: string;
  name: string | null;
  email: string;
  image: string | null;
  weeklyCapacity: number;
  monthlyCapacity: number;
  usedHours: number;
  remainingHours: number;
  utilization: number;
  trend: number[];
}

export interface ResourceAllocation {
  id: string;
  userId: string;
  projectId: string;
  projectName: string;
  projectCode: string;
  allocation: number;
  role: string | null;
  startDate: string;
  endDate: string | null;
  notes: string | null;
}

export interface WorkloadSummary {
  userId: string;
  name: string | null;
  email: string;
  image: string | null;
  totalTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  overtimeHours: number;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  taskTitle: string;
  userId: string;
  timesheetId: string | null;
  description: string | null;
  timeSpent: number;
  billable: boolean;
  loggedAt: string;
  createdAt: string;
}

export interface Timesheet {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  weekStart: string;
  weekEnd: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  totalHours: number;
  billableHours: number;
  notes: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  approverId: string | null;
  approverName: string | null;
  entries: TimeEntry[];
}

export interface TimesheetApproval {
  id: string;
  timesheetId: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  weekStart: string;
  weekEnd: string;
  status: string;
  totalHours: number;
  submittedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "WORK" | "LEAVE" | "HOLIDAY" | "MEETING" | "OTHER";
  userId?: string;
  userName?: string;
  hours?: number;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: string;
  region: string | null;
}

export interface Leave {
  id: string;
  userId: string;
  userName: string | null;
  type: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  status: string;
  approvedBy: string | null;
  approvedAt: string | null;
}

export interface CapacityChart {
  labels: string[];
  actual: number[];
  planned: number[];
  available: number[];
}

export interface UtilizationChart {
  labels: string[];
  billable: number[];
  nonBillable: number[];
  capacity: number[];
}

export interface ResourceReport {
  type: "utilization" | "capacity" | "time";
  periodStart: string;
  periodEnd: string;
  data: ResourceReportRow[];
}

export interface ResourceReportRow {
  userId: string;
  name: string | null;
  email: string;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  utilization: number;
  capacity: number;
  overtimeHours: number;
}

export interface ResourceFilters {
  search?: string;
  department?: string;
  role?: string;
  isActive?: boolean;
  projectId?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

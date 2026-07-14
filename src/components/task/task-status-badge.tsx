"use client";

import { cn } from "@/lib/cn";

const statusConfig: Record<string, { label: string; classes: string }> = {
  BACKLOG: { label: "Backlog", classes: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
  TODO: { label: "To Do", classes: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  IN_PROGRESS: { label: "In Progress", classes: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  IN_REVIEW: { label: "In Review", classes: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  QA_TESTING: { label: "QA Testing", classes: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  DONE: { label: "Done", classes: "bg-green-500/10 text-green-500 border-green-500/20" },
  BLOCKED: { label: "Blocked", classes: "bg-red-500/10 text-red-500 border-red-500/20" },
  CANCELLED: { label: "Cancelled", classes: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
  REOPENED: { label: "Reopened", classes: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
};

const priorityConfig: Record<string, { label: string; classes: string }> = {
  LOWEST: { label: "Lowest", classes: "bg-gray-500/10 text-gray-500" },
  LOW: { label: "Low", classes: "bg-blue-500/10 text-blue-500" },
  MEDIUM: { label: "Medium", classes: "bg-yellow-500/10 text-yellow-500" },
  HIGH: { label: "High", classes: "bg-orange-500/10 text-orange-500" },
  HIGHEST: { label: "Highest", classes: "bg-red-500/10 text-red-500" },
  CRITICAL: { label: "Critical", classes: "bg-red-500/10 text-red-500" },
};

const typeConfig: Record<string, { label: string; icon: string }> = {
  EPIC: { label: "Epic", icon: "⊞" },
  STORY: { label: "Story", icon: "📖" },
  TASK: { label: "Task", icon: "○" },
  SUBTASK: { label: "Subtask", icon: "◦" },
  BUG: { label: "Bug", icon: "🐛" },
  SPIKE: { label: "Spike", icon: "🔍" },
  IMPROVEMENT: { label: "Improvement", icon: "↑" },
  TECH_DEBT: { label: "Tech Debt", icon: "⚡" },
  RESEARCH: { label: "Research", icon: "📋" },
};

interface TaskStatusBadgeProps {
  status: string;
}

interface TaskPriorityBadgeProps {
  priority: string;
}

interface TaskTypeBadgeProps {
  type: string;
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, classes: "bg-gray-500/10 text-gray-500 border-gray-500/20" };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", config.classes)}>
      {config.label}
    </span>
  );
}

export function TaskPriorityBadge({ priority }: TaskPriorityBadgeProps) {
  const config = priorityConfig[priority] || { label: priority, classes: "bg-gray-500/10 text-gray-500" };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", config.classes)}>
      {config.label}
    </span>
  );
}

export function TaskTypeBadge({ type }: TaskTypeBadgeProps) {
  const config = typeConfig[type] || { label: type, icon: "○" };
  return (
    <span className="inline-flex items-center gap-1 text-xs text-foreground-secondary">
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

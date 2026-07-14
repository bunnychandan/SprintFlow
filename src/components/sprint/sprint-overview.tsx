"use client";

import { SprintStats } from "./sprint-stats";
import { SprintProgress } from "./sprint-progress";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import { SprintStatusBadge } from "./sprint-status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Calendar, User, Target, GitBranch, Link } from "lucide-react";
import type { SprintDetail, SprintStatistics } from "@/types/sprint";

interface SprintOverviewProps {
  sprint: SprintDetail;
  stats: SprintStatistics | null;
  statsLoading?: boolean;
}

export function SprintOverview({ sprint, stats, statsLoading }: SprintOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-5">
          <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-3">Goal</h3>
          <p className="text-sm text-foreground leading-relaxed italic">
            {sprint.goal || "No goal set for this sprint."}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <GitBranch className="h-4 w-4 text-foreground-muted" />
              <span className="text-foreground-secondary">Project:</span>
              <span className="font-medium text-foreground">{sprint.project.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <SprintStatusBadge status={sprint.status} />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Details</h3>
          <div className="space-y-3">
            {sprint.startDate && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-foreground-muted" />
                <span className="text-foreground-secondary">Start:</span>
                <span className="text-foreground">{new Date(sprint.startDate).toLocaleDateString()}</span>
              </div>
            )}
            {sprint.endDate && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-foreground-muted" />
                <span className="text-foreground-secondary">End:</span>
                <span className="text-foreground">{new Date(sprint.endDate).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-foreground-muted" />
              <span className="text-foreground-secondary">Created by:</span>
              <div className="flex items-center gap-2">
                <Avatar src={sprint.createdBy.image} name={sprint.createdBy.name || sprint.createdBy.email} className="h-5 w-5" />
                <span className="text-foreground">{sprint.createdBy.name || sprint.createdBy.email}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-foreground-muted" />
              <span className="text-foreground-secondary">Created:</span>
              <span className="text-foreground">{new Date(sprint.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>
      </div>

      <SprintStats stats={stats} loading={statsLoading} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {sprint.startDate && sprint.endDate && stats && (
          <div className="lg:col-span-2">
            <SprintProgress
              startDate={sprint.startDate}
              endDate={sprint.endDate}
              completionPercentage={stats.completionPercentage}
              remainingDays={stats.remainingDays}
              totalDays={stats.totalDays}
              elapsedDays={stats.elapsedDays}
              className="h-full"
            />
          </div>
        )}

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Assignee Workload</h3>
          {stats && stats.assigneeDistribution.length > 0 ? (
            <div className="space-y-3">
              {stats.assigneeDistribution.slice(0, 6).map((a) => (
                <div key={a.userId} className="flex items-center gap-3">
                  <Avatar src={a.image} name={a.name || a.email} className="h-7 w-7" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{a.name || a.email}</p>
                    <p className="text-xs text-foreground-secondary">{a.taskCount} tasks ({a.completedCount} done)</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{a.storyPoints}pts</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-foreground-secondary">No assignees yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

"use client";

import { EpicStatistics } from "./epic-statistics";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import { EpicStatusBadge } from "./epic-status-badge";
import { EpicPriorityBadge } from "./epic-priority-badge";
import { Avatar } from "@/components/ui/avatar";
import { Calendar, User, Target, LayoutDashboard } from "lucide-react";
import type { EpicDetail, EpicStatistics as EpicStatsType, EpicTimelineEvent } from "@/types/agile";
import { EpicTimeline } from "./epic-timeline";

interface EpicOverviewProps {
  epic: EpicDetail;
  stats: EpicStatsType | null;
  statsLoading?: boolean;
  timeline?: EpicTimelineEvent[];
  timelineLoading?: boolean;
}

export function EpicOverview({ epic, stats, statsLoading, timeline, timelineLoading }: EpicOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-5">
          <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-3">Description</h3>
          <p className="text-sm text-foreground leading-relaxed">
            {epic.description || "No description set for this epic."}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <LayoutDashboard className="h-4 w-4 text-foreground-muted" />
              <span className="text-foreground-secondary">Project:</span>
              <span className="font-medium text-foreground">{epic.project.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <EpicStatusBadge status={epic.status} />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Details</h3>
          <div className="space-y-3">
            {epic.priority && (
              <div className="flex items-center gap-3 text-sm">
                <Target className="h-4 w-4 text-foreground-muted" />
                <span className="text-foreground-secondary">Priority:</span>
                <EpicPriorityBadge priority={epic.priority} />
              </div>
            )}
            {epic.startDate && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-foreground-muted" />
                <span className="text-foreground-secondary">Start:</span>
                <span className="text-foreground">{new Date(epic.startDate).toLocaleDateString()}</span>
              </div>
            )}
            {epic.targetDate && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-foreground-muted" />
                <span className="text-foreground-secondary">Target:</span>
                <span className="text-foreground">{new Date(epic.targetDate).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-foreground-muted" />
              <span className="text-foreground-secondary">Owner:</span>
              <div className="flex items-center gap-2">
                <Avatar src={epic.owner.image} name={epic.owner.name || epic.owner.email} className="h-5 w-5" />
                <span className="text-foreground">{epic.owner.name || epic.owner.email}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-foreground-muted" />
              <span className="text-foreground-secondary">Created:</span>
              <span className="text-foreground">{new Date(epic.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>
      </div>

      <EpicStatistics stats={stats} loading={statsLoading} />

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Recent Activity</h3>
        <EpicTimeline events={timeline || []} loading={timelineLoading} />
      </Card>
    </div>
  );
}

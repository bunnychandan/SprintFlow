"use client";

import { ProjectStats } from "./project-stats";
import { ProjectTimeline } from "./project-timeline";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Calendar, Target, User, Shield } from "lucide-react";
import type { ProjectDetail, ProjectStats as ProjectStatsType, ProjectTimelineEvent } from "@/types/project";

interface ProjectOverviewProps {
  project: ProjectDetail;
  stats: ProjectStatsType | null;
  timeline: ProjectTimelineEvent[];
  statsLoading?: boolean;
  timelineLoading?: boolean;
}

export function ProjectOverview({ project, stats, timeline, statsLoading, timelineLoading }: ProjectOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-5">
          <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-3">About</h3>
          <p className="text-sm text-foreground leading-relaxed">
            {project.description || "No description provided."}
          </p>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Details</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Shield className="h-4 w-4 text-foreground-muted" />
              <span className="text-foreground-secondary">Visibility:</span>
              <Badge variant="neutral" size="sm">{project.visibility}</Badge>
            </div>
            {project.startDate && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-foreground-muted" />
                <span className="text-foreground-secondary">Start:</span>
                <span className="text-foreground">{new Date(project.startDate).toLocaleDateString()}</span>
              </div>
            )}
            {project.targetDate && (
              <div className="flex items-center gap-3 text-sm">
                <Target className="h-4 w-4 text-foreground-muted" />
                <span className="text-foreground-secondary">Target:</span>
                <span className="text-foreground">{new Date(project.targetDate).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-foreground-muted" />
              <span className="text-foreground-secondary">Owner:</span>
              <div className="flex items-center gap-2">
                <Avatar src={project.owner?.image} name={project.owner?.name || project.owner?.email} className="h-5 w-5" />
                <span className="text-foreground">{project.owner?.name || project.owner?.email}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-foreground-muted" />
              <span className="text-foreground-secondary">Created:</span>
              <span className="text-foreground">{new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>
      </div>

      <ProjectStats stats={stats} loading={statsLoading} />

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Recent Activity</h3>
        <ProjectTimeline events={timeline.slice(0, 20)} loading={timelineLoading} />
      </Card>
    </div>
  );
}

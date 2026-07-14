"use client";

import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import { Calendar, User, Package, Target, CheckCircle2, XCircle } from "lucide-react";
import { ReleaseStatusBadge } from "./release-status-badge";
import { ReleaseStatistics } from "./release-statistics";
import { Avatar } from "@/components/ui/avatar";
import type { ReleaseDetail, ReleaseStatistics as ReleaseStatsType } from "@/types/agile";

interface ReleaseOverviewProps {
  release: ReleaseDetail;
  stats: ReleaseStatsType | null;
  statsLoading?: boolean;
}

export function ReleaseOverview({ release, stats, statsLoading }: ReleaseOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-5">
          <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-3">Description</h3>
          <p className="text-sm text-foreground leading-relaxed">
            {release.description || "No description set for this release."}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-foreground-muted" />
              <span className="text-foreground-secondary">Project:</span>
              <span className="font-medium text-foreground">{release.project.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ReleaseStatusBadge status={release.status} />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Details</h3>
          <div className="space-y-3">
            {release.version && (
              <div className="flex items-center gap-3 text-sm">
                <Target className="h-4 w-4 text-foreground-muted" />
                <span className="text-foreground-secondary">Version:</span>
                <span className="text-foreground font-medium">v{release.version}</span>
              </div>
            )}
            {release.startDate && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-foreground-muted" />
                <span className="text-foreground-secondary">Start:</span>
                <span className="text-foreground">{new Date(release.startDate).toLocaleDateString()}</span>
              </div>
            )}
            {release.targetDate && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-foreground-muted" />
                <span className="text-foreground-secondary">Target:</span>
                <span className="text-foreground">{new Date(release.targetDate).toLocaleDateString()}</span>
              </div>
            )}
            {release.releasedAt && (
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-4 w-4 text-foreground-muted" />
                <span className="text-foreground-secondary">Released:</span>
                <span className="text-foreground">{new Date(release.releasedAt).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-foreground-muted" />
              <span className="text-foreground-secondary">Created by:</span>
              <div className="flex items-center gap-2">
                <Avatar src={release.createdBy.image} name={release.createdBy.name || release.createdBy.email} className="h-5 w-5" />
                <span className="text-foreground">{release.createdBy.name || release.createdBy.email}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-foreground-muted" />
              <span className="text-foreground-secondary">Created:</span>
              <span className="text-foreground">{new Date(release.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>
      </div>

      <ReleaseStatistics stats={stats} loading={statsLoading} />
    </div>
  );
}

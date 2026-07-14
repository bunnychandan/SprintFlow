"use client";

import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Clock, MessageSquare, GitCommit, UserPlus, Settings, Archive } from "lucide-react";
import type { ReactNode } from "react";

interface Activity {
  id: string;
  user: { name: string | null; image: string | null } | null;
  action: string;
  description: string;
  timestamp: string;
  type: "comment" | "update" | "member" | "setting" | "archive" | "commit";
}

interface ProjectActivityFeedProps {
  activities?: Activity[];
  loading?: boolean;
}

const activityIcons: Record<string, React.ElementType> = {
  comment: MessageSquare,
  update: GitCommit,
  member: UserPlus,
  setting: Settings,
  archive: Archive,
  commit: GitCommit,
};

const activityColors: Record<string, string> = {
  comment: "text-blue-500 bg-blue-500/10",
  update: "text-amber-500 bg-amber-500/10",
  member: "text-emerald-500 bg-emerald-500/10",
  setting: "text-slate-500 bg-slate-500/10",
  archive: "text-rose-500 bg-rose-500/10",
  commit: "text-indigo-500 bg-indigo-500/10",
};

export function ProjectActivityFeed({ activities, loading }: ProjectActivityFeedProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse flex gap-3">
            <div className="h-8 w-8 rounded-full bg-surface-hover" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-64 rounded bg-surface-hover" />
              <div className="h-3 w-24 rounded bg-surface-hover" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Clock className="mx-auto h-12 w-12 text-foreground-muted mb-3" />
        <h3 className="font-semibold text-foreground">No Activity</h3>
        <p className="mt-1 text-sm text-foreground-secondary">There is no recent activity to show.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const Icon = activityIcons[activity.type] || GitCommit;
        const colorClass = activityColors[activity.type] || activityColors.update;

        return (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", colorClass)}>
              <Icon className="h-4 w-4" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                {activity.user && (
                  <span className="font-medium">{activity.user.name || "Someone"}</span>
                )}{" "}
                <span className="text-foreground-secondary">{activity.description}</span>
              </p>
              <p className="mt-0.5 text-xs text-foreground-muted">
                {new Date(activity.timestamp).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {activity.user?.image && (
              <Avatar src={activity.user.image} name={activity.user.name || ""} className="h-7 w-7" />
            )}
          </div>
        );
      })}
    </div>
  );
}

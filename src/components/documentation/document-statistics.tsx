"use client";

import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import { MessageSquare, GitBranch, Eye, Edit3, Users, CheckCircle } from "lucide-react";
import type { DocumentStatistics } from "@/types/documentation";

interface DocumentStatisticsProps {
  stats: DocumentStatistics | null;
  loading?: boolean;
  className?: string;
}

export function DocumentStatisticsView({ stats, loading, className }: DocumentStatisticsProps) {
  if (loading) {
    return (
      <div className={cn("grid grid-cols-2 gap-3", className)}>
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="animate-pulse rounded-xl bg-surface-hover h-20" />)}
      </div>
    );
  }

  if (!stats) return null;

  const items = [
    { label: "Comments", value: stats.totalComments, icon: MessageSquare, color: "text-blue-500" },
    { label: "Versions", value: stats.totalVersions, icon: GitBranch, color: "text-purple-500" },
    { label: "Views", value: stats.totalViews, icon: Eye, color: "text-emerald-500" },
    { label: "Edits", value: stats.totalEdits, icon: Edit3, color: "text-amber-500" },
    { label: "Contributors", value: stats.totalContributors, icon: Users, color: "text-cyan-500" },
    { label: "Completion", value: `${stats.completion}%`, icon: CheckCircle, color: "text-accent" },
  ];

  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {items.map((item) => (
        <Card key={item.label} className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <item.icon className={cn("h-4 w-4", item.color)} />
            <span className="text-xs text-foreground-muted">{item.label}</span>
          </div>
          <p className="text-lg font-bold text-foreground">{item.value}</p>
        </Card>
      ))}
    </div>
  );
}

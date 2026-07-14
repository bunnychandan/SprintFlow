"use client";

import { cn } from "@/lib/cn";
import { Card, StatCard } from "@/components/ui/card";
import { Rocket, AlertCircle, CheckCircle2, Clock, Play, BarChart3 } from "lucide-react";
import type { DevOpsDashboard } from "@/types/devops";

interface DevOpsDashboardCardsProps {
  data: DevOpsDashboard | null;
  loading?: boolean;
  className?: string;
}

export function DevOpsDashboardCards({ data, loading, className }: DevOpsDashboardCardsProps) {
  if (loading) {
    return (
      <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-border bg-surface p-5">
            <div className="h-4 w-24 rounded bg-surface-hover" />
            <div className="mt-2 h-8 w-16 rounded bg-surface-hover" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      <StatCard label="Total Deployments" value={data.deployments.total} icon={<Rocket className="h-5 w-5 text-accent" />} />
      <StatCard label="Success" value={data.deployments.success} icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />} />
      <StatCard label="Failed" value={data.deployments.failed} icon={<AlertCircle className="h-5 w-5 text-red-500" />} />
      <StatCard label="Success Rate" value={`${data.successRate}%`} icon={<BarChart3 className="h-5 w-5 text-accent" />} />
    </div>
  );
}

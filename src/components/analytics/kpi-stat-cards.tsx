"use client";

import { cn } from "@/lib/cn";
import { Card, StatCard } from "@/components/ui/card";
import { ListTodo, CheckCircle2, AlertCircle, Timer, Target, TrendingUp, Ban, FolderKanban, Play, GitBranch, Users } from "lucide-react";
import type { KPIStat } from "@/types/analytics";

const iconMap: Record<string, React.ElementType> = {
  FolderKanban, Play, ListTodo, CheckCircle2, AlertCircle, Ban, GitBranch, Users, Timer, Target, TrendingUp,
};

interface KPIStatCardsProps {
  kpis: KPIStat[];
  loading?: boolean;
  className?: string;
}

export function KPIStatCards({ kpis, loading, className }: KPIStatCardsProps) {
  if (loading) {
    return (
      <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-border bg-surface p-5">
            <div className="h-4 w-24 rounded bg-surface-hover" />
            <div className="mt-2 h-8 w-16 rounded bg-surface-hover" />
          </div>
        ))}
      </div>
    );
  }

  if (!kpis || kpis.length === 0) return null;

  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {kpis.map((kpi) => {
        const Icon = kpi.icon ? iconMap[kpi.icon] : null;
        return (
          <StatCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            icon={Icon ? <Icon className={cn("h-5 w-5", kpi.color || "text-accent")} /> : undefined}
          />
        );
      })}
    </div>
  );
}

"use client";

import { cn } from "@/lib/cn";
import { Card, StatCard } from "@/components/ui/card";
import { Users, Clock, Briefcase, TrendingUp } from "lucide-react";
import type { Resource, ResourceCapacity, ResourceAvailability } from "@/types/resources";

interface ResourceSummaryCardsProps {
  resources?: Resource[];
  capacity?: ResourceCapacity[];
  availability?: ResourceAvailability[];
  loading?: boolean;
  className?: string;
}

export function ResourceSummaryCards({ resources, capacity, availability, loading, className }: ResourceSummaryCardsProps) {
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

  const totalResources = resources?.length || 0;
  const totalUtilization = capacity?.length ? Math.round(capacity.reduce((s, r) => s + r.utilization, 0) / capacity.length) : 0;
  const totalCapacity = capacity?.reduce((s, r) => s + r.monthlyCapacity, 0) || 0;
  const usedCapacity = capacity?.reduce((s, r) => s + r.usedHours, 0) || 0;
  const avgAvailable = availability?.length ? Math.round(availability.reduce((s, r) => s + r.available, 0) / availability.length) : 0;

  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      <StatCard label="Total Resources" value={totalResources} icon={<Users className="h-5 w-5 text-accent" />} />
      <StatCard label="Avg Utilization" value={`${totalUtilization}%`} icon={<TrendingUp className="h-5 w-5 text-accent" />} />
      <StatCard label="Total Capacity" value={`${totalCapacity}h`} icon={<Clock className="h-5 w-5 text-accent" />} />
      <StatCard label="Used Hours" value={`${usedCapacity}h`} icon={<Briefcase className="h-5 w-5 text-accent" />} />
    </div>
  );
}

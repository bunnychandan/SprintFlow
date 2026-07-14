"use client";

import { cn } from "@/lib/cn";
import { Card, StatCard } from "@/components/ui/card";
import { Brain, MessageSquare, DollarSign, Activity } from "lucide-react";
import type { AIUsageSummary } from "@/types/ai";

interface AIUsageCardsProps {
  data: AIUsageSummary | null;
  loading?: boolean;
  className?: string;
}

export function AIUsageCards({ data, loading, className }: AIUsageCardsProps) {
  if (loading) {
    return (
      <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}>
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="animate-pulse rounded-2xl bg-surface-hover h-24" />)}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      <StatCard label="Total Tokens" value={data.totalTokens.toLocaleString()} icon={<Brain className="h-5 w-5 text-accent" />} />
      <StatCard label="Total Requests" value={data.totalRequests.toLocaleString()} icon={<MessageSquare className="h-5 w-5 text-blue-500" />} />
      <StatCard label="Total Cost" value={`$${data.totalCost.toFixed(4)}`} icon={<DollarSign className="h-5 w-5 text-emerald-500" />} />
      <StatCard label="Avg Tokens/Req" value={data.totalRequests > 0 ? Math.round(data.totalTokens / data.totalRequests).toLocaleString() : "0"} icon={<Activity className="h-5 w-5 text-amber-500" />} />
    </div>
  );
}

"use client";

import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import type { EnvironmentHealth } from "@/types/devops";

interface EnvironmentStatusCardProps {
  environment: EnvironmentHealth;
  className?: string;
}

const STATUS_ICONS = {
  healthy: CheckCircle,
  warning: AlertTriangle,
  critical: XCircle,
};

const STATUS_COLORS = {
  healthy: "text-emerald-500",
  warning: "text-amber-500",
  critical: "text-red-500",
};

export function EnvironmentStatusCard({ environment, className }: EnvironmentStatusCardProps) {
  const Icon = STATUS_ICONS[environment.status];
  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-foreground">{environment.environment}</span>
        <Icon className={cn("h-5 w-5", STATUS_COLORS[environment.status])} />
      </div>
      <div className="space-y-1 text-xs text-foreground-secondary">
        <p>Deployments: {environment.deploymentCount}</p>
        <p>Success rate: {environment.successRate}%</p>
        {environment.lastDeployed && <p>Last: {new Date(environment.lastDeployed).toLocaleDateString()}</p>}
      </div>
    </Card>
  );
}

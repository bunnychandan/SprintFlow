import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  Timer, Clock, Cpu, HardDrive, BarChart3, Activity, CheckCircle2,
} from "lucide-react";

interface MetricsCardsProps {
  metrics: {
    uptime: number;
    serverStartTime: string;
    memoryUsageMB: number;
    heapUsageMB: number;
    nodeVersion: string;
    nextjsVersion: string;
    prismaVersion: string;
    environment: string;
    avgApiResponseTime: number;
    totalRequests: number;
    errorCount: number;
    successRate: number;
  };
  className?: string;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(" ");
}

export function MetricsCards({ metrics, className }: MetricsCardsProps) {
  const items = [
    { icon: Timer, label: "Uptime", value: formatUptime(metrics.uptime) },
    { icon: Clock, label: "Server Start", value: new Date(metrics.serverStartTime).toLocaleTimeString() },
    { icon: Cpu, label: "Memory", value: `${metrics.memoryUsageMB.toFixed(0)} MB` },
    { icon: HardDrive, label: "Heap", value: `${metrics.heapUsageMB.toFixed(0)} MB` },
    { icon: Activity, label: "Avg Response", value: `${metrics.avgApiResponseTime.toFixed(0)} ms` },
    { icon: BarChart3, label: "Requests", value: metrics.totalRequests.toLocaleString() },
    { icon: XIcon, label: "Errors", value: metrics.errorCount.toLocaleString() },
    { icon: CheckCircle2, label: "Success Rate", value: `${metrics.successRate.toFixed(1)}%` },
  ];

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} variant="glass" className="flex items-center gap-3">
            <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-foreground-muted font-medium">{item.label}</p>
              <p className="text-sm font-semibold text-foreground truncate">{item.value}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

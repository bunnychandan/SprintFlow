"use client";

import { Card, Select } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useState, useMemo } from "react";
import type { HealthHistoryPoint } from "@/types/admin";

interface MonitoringChartProps {
  data: HealthHistoryPoint[];
  className?: string;
}

const periodOptions = [
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
];

const metricOptions = [
  { value: "overallStatus", label: "Overall Status" },
  { value: "successRate", label: "Success Rate" },
  { value: "avgApiResponseMs", label: "Avg Response Time" },
  { value: "memoryUsageMB", label: "Memory Usage" },
  { value: "errorCount", label: "Error Count" },
  { value: "totalRequests", label: "Total Requests" },
];

export function MonitoringChart({ data, className }: MonitoringChartProps) {
  const [selectedMetric, setSelectedMetric] = useState("overallStatus");

  const chartData = useMemo(() => data.slice().reverse(), [data]);

  if (data.length === 0) {
    return (
      <Card className={cn("flex items-center justify-center py-12 text-center", className)}>
        <div>
          <p className="text-sm text-foreground-muted">No health history data yet</p>
          <p className="text-xs text-foreground-muted mt-1">Data will appear as health checks are performed</p>
        </div>
      </Card>
    );
  }

  const values = chartData.map((d) => {
    const v = (d as any)[selectedMetric];
    if (selectedMetric === "overallStatus") {
      return { label: d.overallStatus, raw: d.overallStatus === "HEALTHY" ? 100 : d.overallStatus === "WARNING" ? 66 : d.overallStatus === "CRITICAL" ? 33 : 0 };
    }
    return { label: v?.toFixed(1) ?? "0", raw: v ?? 0 };
  });

  const maxVal = Math.max(...values.map((v) => v.raw), 1);
  const minVal = selectedMetric === "overallStatus" ? 0 : Math.min(...values.map((v) => v.raw), 0);
  const range = maxVal - minVal || 1;

  return (
    <Card className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Health History</h3>
        <Select
          options={metricOptions}
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
          className="max-w-[200px]"
        />
      </div>

      <div className="relative h-48">
        <div className="absolute inset-0 flex items-end gap-[2px]">
          {values.map((v, i) => {
            const height = ((v.raw - minVal) / range) * 100;
            return (
              <div
                key={i}
                className="flex-1 rounded-t transition-all duration-300 relative group"
                style={{ height: `${Math.max(height, 2)}%` }}
              >
                <div
                  className={cn(
                    "absolute inset-0 rounded-t opacity-80 group-hover:opacity-100 transition-opacity",
                    selectedMetric === "overallStatus"
                      ? v.label === "HEALTHY" ? "bg-success" : v.label === "WARNING" ? "bg-warning" : v.label === "CRITICAL" ? "bg-destructive" : "bg-foreground-muted"
                      : "bg-accent"
                  )}
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-elevated border border-border rounded-lg px-2 py-1 text-[10px] whitespace-nowrap z-10 shadow-dropdown">
                  {v.label}
                  <br />
                  {chartData[i]?.timestamp && new Date(chartData[i].timestamp).toLocaleTimeString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-foreground-muted">
        <span>
          {chartData[0]?.timestamp ? new Date(chartData[0].timestamp).toLocaleDateString() : ""}
          {" "}
          {chartData[0]?.timestamp ? new Date(chartData[0].timestamp).toLocaleTimeString() : ""}
        </span>
        <span>
          {chartData[chartData.length - 1]?.timestamp ? new Date(chartData[chartData.length - 1].timestamp).toLocaleDateString() : ""}
          {" "}
          {chartData[chartData.length - 1]?.timestamp ? new Date(chartData[chartData.length - 1].timestamp).toLocaleTimeString() : ""}
        </span>
      </div>
    </Card>
  );
}

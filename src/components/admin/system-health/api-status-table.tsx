"use client";

import { useState, useMemo } from "react";
import { Card, Badge, Input, Select } from "@/components/ui";
import { cn } from "@/lib/cn";
import { Search, ArrowUpDown } from "lucide-react";
import type { HealthStatusType } from "@/types/admin";

interface ApiEndpoint {
  endpoint: string;
  method: string;
  avgResponseTime: number;
  requestCount: number;
  failureCount: number;
  lastAccess: string | null;
  status: HealthStatusType;
}

interface ApiStatusTableProps {
  endpoints: ApiEndpoint[];
  className?: string;
}

const methodOptions = [
  { value: "", label: "All Methods" },
  { value: "GET", label: "GET" },
  { value: "POST", label: "POST" },
  { value: "PUT", label: "PUT" },
  { value: "DELETE", label: "DELETE" },
];

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "HEALTHY", label: "Healthy" },
  { value: "WARNING", label: "Warning" },
  { value: "CRITICAL", label: "Critical" },
  { value: "UNKNOWN", label: "Unknown" },
];

const statusBadge = {
  HEALTHY: "success" as const,
  WARNING: "warning" as const,
  CRITICAL: "danger" as const,
  UNKNOWN: "neutral" as const,
};

export function ApiStatusTable({ endpoints, className }: ApiStatusTableProps) {
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState<string>("endpoint");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    let result = [...endpoints];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((e) => e.endpoint.toLowerCase().includes(q));
    }
    if (methodFilter) {
      result = result.filter((e) => e.method === methodFilter);
    }
    if (statusFilter) {
      result = result.filter((e) => e.status === statusFilter);
    }

    result.sort((a, b) => {
      const aVal = (a as any)[sortField];
      const bVal = (b as any)[sortField];
      if (typeof aVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [endpoints, search, methodFilter, statusFilter, sortField, sortDir]);

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  return (
    <Card className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          API Endpoints <span className="text-foreground-muted font-normal">({filtered.length})</span>
        </h3>
      </div>
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search endpoints..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          className="max-w-xs"
        />
        <Select
          options={methodOptions}
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="max-w-[140px]"
        />
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="max-w-[140px]"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["endpoint", "method", "avgResponseTime", "requestCount", "failureCount", "lastAccess", "status"].map(
                (field) => (
                  <th
                    key={field}
                    className="text-left py-2 px-3 text-xs font-medium text-foreground-muted uppercase tracking-wider cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort(field)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {field === "avgResponseTime" ? "Avg (ms)" : field === "requestCount" ? "Requests" : field === "failureCount" ? "Failures" : field === "lastAccess" ? "Last Access" : field}
                      {sortField === field && <ArrowUpDown className="h-3 w-3" />}
                    </span>
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-foreground-muted">
                  No endpoints found
                </td>
              </tr>
            ) : (
              filtered.map((ep, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-xs text-foreground">{ep.endpoint}</td>
                  <td className="py-2.5 px-3">
                    <Badge variant="neutral" size="sm">{ep.method}</Badge>
                  </td>
                  <td className="py-2.5 px-3 text-foreground-secondary">{ep.avgResponseTime.toFixed(0)}ms</td>
                  <td className="py-2.5 px-3 text-foreground-secondary">{ep.requestCount}</td>
                  <td className="py-2.5 px-3">
                    <span className={ep.failureCount > 0 ? "text-destructive" : "text-foreground-muted"}>
                      {ep.failureCount}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-xs text-foreground-muted">
                    {ep.lastAccess ? new Date(ep.lastAccess).toLocaleString() : "—"}
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge variant={statusBadge[ep.status]} size="sm">{ep.status}</Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

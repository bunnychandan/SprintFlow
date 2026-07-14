"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, LayoutDashboard, ListChecks, BarChart3,
  Clock, Activity, Settings as SettingsIcon, Package,
} from "lucide-react";
import { Badge, ErrorState } from "@/components/ui";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { ReleaseStatusBadge } from "@/components/releases/release-status-badge";
import { ReleaseOverview } from "@/components/releases/release-overview";
import { ReleaseTimeline } from "@/components/releases/release-timeline";
import { ReleaseStatistics } from "@/components/releases/release-statistics";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { ReleaseDetail, ReleaseStatistics as ReleaseStatsType } from "@/types/agile";

type TabId = "overview" | "tasks" | "timeline" | "analytics" | "settings";

const TABS = [
  { id: "overview" as TabId, label: "Overview", icon: LayoutDashboard },
  { id: "tasks" as TabId, label: "Tasks", icon: ListChecks },
  { id: "analytics" as TabId, label: "Analytics", icon: BarChart3 },
  { id: "timeline" as TabId, label: "Timeline", icon: Clock },
  { id: "settings" as TabId, label: "Settings", icon: SettingsIcon },
];

export default function ReleaseDetailPage() {
  const { id: releaseId } = useParams() as { id: string };
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [release, setRelease] = useState<ReleaseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState<ReleaseStatsType | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  const fetchRelease = useCallback(async () => {
    try {
      const res = await fetch(`/api/releases/${releaseId}`);
      if (!res.ok) throw new Error(res.status === 403 ? "Access denied" : "Release not found");
      const data = await res.json();
      setRelease(data.release);
      setError("");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [releaseId]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`/api/releases/${releaseId}/stats`);
      if (res.ok) setStats(await res.json());
    } catch { /* ignore */ }
    finally { setStatsLoading(false); }
  }, [releaseId]);

  const fetchTimeline = useCallback(async () => {
    setTimelineLoading(true);
    try {
      const res = await fetch(`/api/releases/${releaseId}/timeline`);
      if (res.ok) setTimeline(await res.json());
    } catch { /* ignore */ }
    finally { setTimelineLoading(false); }
  }, [releaseId]);

  useEffect(() => { fetchRelease(); }, [fetchRelease]);

  useEffect(() => {
    if (!releaseId) return;
    if (activeTab === "overview") { fetchStats(); fetchTimeline(); }
    else if (activeTab === "analytics") fetchStats();
    else if (activeTab === "timeline") fetchTimeline();
  }, [activeTab, releaseId, fetchStats, fetchTimeline]);

  const handlePublish = useCallback(async () => {
    try {
      const res = await fetch(`/api/releases/${releaseId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.release) setRelease((prev) => prev ? { ...prev, ...data.release } : prev);
      }
    } catch { /* ignore */ }
  }, [releaseId]);

  const handleCancel = useCallback(async () => {
    const reason = prompt("Reason for cancelling (optional):");
    try {
      const res = await fetch(`/api/releases/${releaseId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || undefined }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.release) setRelease((prev) => prev ? { ...prev, ...data.release } : prev);
      }
    } catch { /* ignore */ }
  }, [releaseId]);

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto">
        <DashboardSkeleton />
      </main>
    );
  }

  if (error || !release) {
    return (
      <main className="flex-1 flex items-center justify-center p-6">
        <ErrorState title="Error" message={error || "Release not found"} onRetry={() => { setIsLoading(true); fetchRelease(); }} />
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col px-4 py-6 lg:px-8 overflow-hidden max-h-screen">
      <div className="flex flex-col gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/releases")}
            className="text-foreground-muted hover:text-foreground transition-colors"
            aria-label="Back to releases"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-semibold text-foreground leading-none">
            {release.name}
          </h1>
          {release.version && (
            <Badge variant="info" size="md">v{release.version}</Badge>
          )}
          <ReleaseStatusBadge status={release.status} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex border border-border rounded-xl bg-surface/50 p-1 text-xs font-medium self-start overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-accent text-accent-foreground font-semibold shadow-sm"
                    : "text-foreground-secondary hover:text-foreground"
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {(release.status === "PLANNING" || release.status === "ACTIVE") && (
              <Button variant="gradient" size="sm" leftIcon={<Package className="h-4 w-4" />} onClick={handlePublish}>
                Publish Release
              </Button>
            )}
            {(release.status === "PLANNING" || release.status === "ACTIVE") && (
              <Button variant="danger" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 mt-6 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto">
          {activeTab === "overview" && (
            <ReleaseOverview
              release={release}
              stats={stats}
              statsLoading={statsLoading}
            />
          )}
          {activeTab === "tasks" && (
            <div className="flex items-center justify-center h-full">
              <p className="text-foreground-secondary">Task list integration coming soon.</p>
            </div>
          )}
          {activeTab === "analytics" && (
            <ReleaseStatistics stats={stats} loading={statsLoading} />
          )}
          {activeTab === "timeline" && (
            <div className="py-4">
              <ReleaseTimeline events={timeline} loading={timelineLoading} />
            </div>
          )}
          {activeTab === "settings" && (
            <div className="py-4">
              <p className="text-foreground-secondary">Release settings are managed from the project workspace.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

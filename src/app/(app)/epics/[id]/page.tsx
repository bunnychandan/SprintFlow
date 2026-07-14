"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, LayoutDashboard, ListChecks, BarChart3,
  Clock, Activity, Settings as SettingsIcon, Target,
} from "lucide-react";
import { Badge, ErrorState } from "@/components/ui";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { EpicStatusBadge } from "@/components/epics/epic-status-badge";
import { EpicOverview } from "@/components/epics/epic-overview";
import { EpicTimeline } from "@/components/epics/epic-timeline";
import { EpicStatistics } from "@/components/epics/epic-statistics";
import { cn } from "@/lib/cn";
import type { EpicDetail, EpicStatistics as EpicStatsType, EpicTimelineEvent } from "@/types/agile";

type TabId = "overview" | "tasks" | "timeline" | "analytics" | "settings";

const TABS = [
  { id: "overview" as TabId, label: "Overview", icon: LayoutDashboard },
  { id: "tasks" as TabId, label: "Tasks", icon: ListChecks },
  { id: "analytics" as TabId, label: "Analytics", icon: BarChart3 },
  { id: "timeline" as TabId, label: "Timeline", icon: Clock },
  { id: "settings" as TabId, label: "Settings", icon: SettingsIcon },
];

export default function EpicDetailPage() {
  const { id: epicId } = useParams() as { id: string };
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [epic, setEpic] = useState<EpicDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState<EpicStatsType | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [timeline, setTimeline] = useState<EpicTimelineEvent[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  const fetchEpic = useCallback(async () => {
    try {
      const res = await fetch(`/api/epics/${epicId}`);
      if (!res.ok) throw new Error(res.status === 403 ? "Access denied" : "Epic not found");
      const data = await res.json();
      setEpic(data.epic);
      setError("");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [epicId]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`/api/epics/${epicId}/stats`);
      if (res.ok) setStats(await res.json());
    } catch { /* ignore */ }
    finally { setStatsLoading(false); }
  }, [epicId]);

  const fetchTimeline = useCallback(async () => {
    setTimelineLoading(true);
    try {
      const res = await fetch(`/api/epics/${epicId}/timeline`);
      if (res.ok) {
        const data = await res.json();
        setTimeline(data.events || []);
      }
    } catch { /* ignore */ }
    finally { setTimelineLoading(false); }
  }, [epicId]);

  useEffect(() => { fetchEpic(); }, [fetchEpic]);

  useEffect(() => {
    if (!epicId) return;
    if (activeTab === "overview") { fetchStats(); fetchTimeline(); }
    else if (activeTab === "analytics") fetchStats();
    else if (activeTab === "timeline") fetchTimeline();
  }, [activeTab, epicId, fetchStats, fetchTimeline]);

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto">
        <DashboardSkeleton />
      </main>
    );
  }

  if (error || !epic) {
    return (
      <main className="flex-1 flex items-center justify-center p-6">
        <ErrorState title="Error" message={error || "Epic not found"} onRetry={() => { setIsLoading(true); fetchEpic(); }} />
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col px-4 py-6 lg:px-8 overflow-hidden max-h-screen">
      <div className="flex flex-col gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/epics")}
            className="text-foreground-muted hover:text-foreground transition-colors"
            aria-label="Back to epics"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div
            className="h-4 w-4 rounded"
            style={{ backgroundColor: epic.color }}
          />
          <Badge variant="primary" size="md">EPIC</Badge>
          <h1 className="text-2xl font-semibold text-foreground leading-none">
            {epic.title}
          </h1>
          <EpicStatusBadge status={epic.status} />
        </div>

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
      </div>

      <div className="flex-1 mt-6 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto">
          {activeTab === "overview" && (
            <EpicOverview
              epic={epic}
              stats={stats}
              statsLoading={statsLoading}
              timeline={timeline}
              timelineLoading={timelineLoading}
            />
          )}
          {activeTab === "tasks" && (
            <div className="flex items-center justify-center h-full">
              <p className="text-foreground-secondary">Task list integration coming soon.</p>
            </div>
          )}
          {activeTab === "analytics" && (
            <EpicStatistics stats={stats} loading={statsLoading} />
          )}
          {activeTab === "timeline" && (
            <div className="py-4">
              <EpicTimeline events={timeline} loading={timelineLoading} />
            </div>
          )}
          {activeTab === "settings" && (
            <div className="py-4">
              <p className="text-foreground-secondary">Epic settings are managed from the project workspace.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

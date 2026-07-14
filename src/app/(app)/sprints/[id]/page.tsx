"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft, LayoutDashboard, ListChecks, KanbanSquare,
  BarChart3, Clock, Activity, Settings as SettingsIcon, Users,
} from "lucide-react";
import { ErrorState } from "@/components/ui";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { SprintHeader } from "@/components/sprint/sprint-header";
import { SprintOverview } from "@/components/sprint/sprint-overview";
import { SprintBacklog } from "@/components/sprint/sprint-backlog";
import { SprintTimeline } from "@/components/sprint/sprint-timeline";
import { SprintStats } from "@/components/sprint/sprint-stats";
import { cn } from "@/lib/cn";
import type { SprintDetail, SprintStatistics, SprintTimelineEvent } from "@/types/sprint";

type TabId = "overview" | "backlog" | "board" | "analytics" | "timeline" | "activity" | "settings";

const TABS = [
  { id: "overview" as TabId, label: "Overview", icon: LayoutDashboard },
  { id: "backlog" as TabId, label: "Backlog", icon: ListChecks },
  { id: "board" as TabId, label: "Board", icon: KanbanSquare },
  { id: "analytics" as TabId, label: "Analytics", icon: BarChart3 },
  { id: "timeline" as TabId, label: "Timeline", icon: Clock },
  { id: "activity" as TabId, label: "Activity", icon: Activity },
  { id: "settings" as TabId, label: "Settings", icon: SettingsIcon },
];

export default function SprintDetailPage() {
  const { id: sprintId } = useParams() as { id: string };
  const router = useRouter();
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [sprint, setSprint] = useState<SprintDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState<SprintStatistics | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [timeline, setTimeline] = useState<SprintTimelineEvent[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  const fetchSprint = useCallback(async () => {
    try {
      const res = await fetch(`/api/sprints/${sprintId}`);
      if (!res.ok) throw new Error(res.status === 403 ? "Access denied" : "Sprint not found");
      const data = await res.json();
      setSprint(data.sprint);
      setError("");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [sprintId]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`/api/sprints/${sprintId}/stats`);
      if (res.ok) setStats(await res.json());
    } catch { /* ignore */ }
    finally { setStatsLoading(false); }
  }, [sprintId]);

  const fetchTimeline = useCallback(async () => {
    setTimelineLoading(true);
    try {
      const res = await fetch(`/api/sprints/${sprintId}/timeline`);
      if (res.ok) setTimeline(await res.json());
    } catch { /* ignore */ }
    finally { setTimelineLoading(false); }
  }, [sprintId]);

  useEffect(() => { fetchSprint(); }, [fetchSprint]);

  useEffect(() => {
    if (!sprintId) return;
    if (activeTab === "overview") { fetchStats(); fetchTimeline(); }
    else if (activeTab === "analytics") fetchStats();
    else if (activeTab === "timeline") fetchTimeline();
  }, [activeTab, sprintId, fetchStats, fetchTimeline]);

  const handleStart = useCallback(async () => {
    router.push(`/projects/${sprint?.projectId}?startSprint=${sprintId}`);
  }, [sprint, router]);

  const handleComplete = useCallback(async () => {
    try {
      const res = await fetch(`/api/sprints/${sprintId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceComplete: false }),
      });
      if (res.ok || res.status === 400) {
        const data = await res.json();
        if (data.sprint) { setSprint((prev) => prev ? { ...prev, ...data.sprint } : prev); }
        if (data.error && data.incompleteTasks) {
          const force = confirm(`${data.incompleteTasks} task(s) are not done. Complete anyway?`);
          if (force) {
            const forceRes = await fetch(`/api/sprints/${sprintId}/complete`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ forceComplete: true }),
            });
            const forceData = await forceRes.json();
            if (forceData.sprint) setSprint((prev) => prev ? { ...prev, ...forceData.sprint } : prev);
          }
        }
      }
    } catch { /* ignore */ }
  }, [sprintId]);

  const handleCancel = useCallback(async () => {
    const reason = prompt("Reason for cancelling (optional):");
    try {
      const res = await fetch(`/api/sprints/${sprintId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || undefined }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.sprint) setSprint((prev) => prev ? { ...prev, ...data.sprint } : prev);
      }
    } catch { /* ignore */ }
  }, [sprintId]);

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto">
        <DashboardSkeleton />
      </main>
    );
  }

  if (error || !sprint) {
    return (
      <main className="flex-1 flex items-center justify-center p-6">
        <ErrorState title="Error" message={error || "Sprint not found"} onRetry={() => { setIsLoading(true); fetchSprint(); }} />
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col px-4 py-6 lg:px-8 overflow-hidden max-h-screen">
      <div className="flex flex-col gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/sprints")}
            className="text-foreground-muted hover:text-foreground transition-colors"
            aria-label="Back to sprints"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <SprintHeader
            sprint={sprint}
            onStart={handleStart}
            onComplete={handleComplete}
            onCancel={handleCancel}
          />
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
            <SprintOverview sprint={sprint} stats={stats} statsLoading={statsLoading} />
          )}
          {activeTab === "backlog" && (
            <SprintBacklog
              tasks={sprint.tasks || []}
              onTaskClick={(taskId) => {}}
              readOnly={sprint.status === "COMPLETED" || sprint.status === "CANCELLED"}
            />
          )}
          {activeTab === "board" && (
            <div className="flex items-center justify-center h-full">
              <p className="text-foreground-secondary">Board view redirects to project active board.</p>
            </div>
          )}
          {activeTab === "analytics" && (
            <SprintStats stats={stats} loading={statsLoading} />
          )}
          {activeTab === "timeline" && (
            <div className="py-4">
              <SprintTimeline events={timeline} loading={timelineLoading} />
            </div>
          )}
          {activeTab === "activity" && (
            <div className="py-4">
              <SprintTimeline events={timeline} loading={timelineLoading} />
            </div>
          )}
          {activeTab === "settings" && (
            <div className="py-4">
              <p className="text-foreground-secondary">Sprint settings are managed from the project workspace.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

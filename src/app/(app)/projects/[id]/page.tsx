"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  KanbanSquare, ListChecks, Users, Settings as SettingsIcon,
  ArrowLeft, LayoutDashboard, Clock, FileText, Activity
} from "lucide-react";
import { Badge, ErrorState } from "@/components/ui";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import BoardTab from "@/components/project/board-tab";
import BacklogTab from "@/components/project/backlog-tab";
import MembersTab from "@/components/project/members-tab";
import SettingsTab from "@/components/project/settings-tab";
import { ProjectOverview } from "@/components/project/project-overview";
import { ProjectTimeline } from "@/components/project/project-timeline";
import { ProjectFiles } from "@/components/project/project-files";
import { ProjectActivityFeed } from "@/components/project/project-activity-feed";
import CreateTaskModal from "@/components/create-task-modal";
import TaskDetailsModal from "@/components/task-details-modal";
import { cn } from "@/lib/cn";

type TabId = "overview" | "board" | "backlog" | "members" | "timeline" | "files" | "activity" | "settings";

const TABS = [
  { id: "overview" as TabId, label: "Overview", icon: LayoutDashboard },
  { id: "board" as TabId, label: "Active Board", icon: KanbanSquare },
  { id: "backlog" as TabId, label: "Backlog & Sprints", icon: ListChecks },
  { id: "members" as TabId, label: "Members", icon: Users },
  { id: "timeline" as TabId, label: "Timeline", icon: Clock },
  { id: "files" as TabId, label: "Files", icon: FileText },
  { id: "activity" as TabId, label: "Activity", icon: Activity },
  { id: "settings" as TabId, label: "Settings", icon: SettingsIcon },
];

export default function ProjectWorkspacePage() {
  const { id: projectId } = useParams() as { id: string };
  const router = useRouter();
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  const fetchProjectDetails = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) {
        if (res.status === 403) throw new Error("You do not have access to this project.");
        throw new Error("Project not found.");
      }
      const data = await res.json();
      const currentMember = (data.project.members || []).find(
        (m: any) => m.userId === session?.user?.id
      );
      setProject({
        ...data.project,
        currentUserId: session?.user?.id,
        currentUserRole: session?.user?.role,
        currentUserProjectRole: currentMember?.roleInProject ?? "",
      });
      setError("");
    } catch (err: any) {
      setError(err.message ?? "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, session]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/stats`);
      if (res.ok) setStats(await res.json());
    } catch { /* ignore */ }
    finally { setStatsLoading(false); }
  }, [projectId]);

  const fetchTimeline = useCallback(async () => {
    setTimelineLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/timeline`);
      if (res.ok) setTimeline(await res.json());
    } catch { /* ignore */ }
    finally { setTimelineLoading(false); }
  }, [projectId]);

  const fetchFiles = useCallback(async () => {
    setFilesLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/files`);
      if (res.ok) setFiles(await res.json());
    } catch { /* ignore */ }
    finally { setFilesLoading(false); }
  }, [projectId]);

  const fetchActivities = useCallback(async () => {
    setActivitiesLoading(true);
    try {
      const res = await fetch(`/api/admin/audit/activity?projectId=${projectId}`);
      if (res.ok) setActivities(await res.json());
    } catch { /* ignore */ }
    finally { setActivitiesLoading(false); }
  }, [projectId]);

  useEffect(() => {
    if (projectId) fetchProjectDetails();
  }, [projectId, fetchProjectDetails]);

  useEffect(() => {
    if (!projectId) return;
    if (activeTab === "overview") {
      fetchStats();
      fetchTimeline();
    } else if (activeTab === "timeline") {
      fetchTimeline();
    } else if (activeTab === "files") {
      fetchFiles();
    } else if (activeTab === "activity") {
      fetchActivities();
    }
  }, [activeTab, projectId, fetchStats, fetchTimeline, fetchFiles, fetchActivities]);

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto">
        <DashboardSkeleton />
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="flex-1 flex items-center justify-center p-6">
        <ErrorState
          title="Access Denied"
          message={error || "Project not found"}
          onRetry={() => { setIsLoading(true); fetchProjectDetails(); }}
        />
      </main>
    );
  }

  const activeSprint = (project.sprints || []).find((s: any) => s.status === "ACTIVE");

  return (
    <main className="flex-1 flex flex-col px-4 py-6 lg:px-8 overflow-hidden max-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/projects")}
            className="text-foreground-muted hover:text-foreground transition-colors"
            aria-label="Back to projects"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          {project.color && (
            <div
              className="h-4 w-4 rounded"
              style={{ backgroundColor: project.color }}
            />
          )}
          <Badge variant="primary" size="md">
            {project.code}
          </Badge>
          <h1 className="text-2xl font-semibold text-foreground leading-none">
            {project.name}
          </h1>
          {project.status === "ARCHIVED" && (
            <Badge variant="danger" size="sm">Archived</Badge>
          )}
        </div>

        <div className="flex border border-border rounded-xl bg-surface/50 p-1 text-xs font-medium self-start md:self-center overflow-x-auto">
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
            <ProjectOverview
              project={project}
              stats={stats}
              timeline={timeline}
              statsLoading={statsLoading}
              timelineLoading={timelineLoading}
            />
          )}
          {activeTab === "board" && (
            <BoardTab
              project={project}
              activeSprint={activeSprint}
              onTaskClick={setSelectedTaskId}
              onCreateTask={() => setIsCreateTaskOpen(true)}
              onRefresh={fetchProjectDetails}
            />
          )}
          {activeTab === "backlog" && (
            <BacklogTab
              project={project}
              onTaskClick={setSelectedTaskId}
              onRefresh={fetchProjectDetails}
            />
          )}
          {activeTab === "members" && (
            <MembersTab
              project={project}
              onRefresh={fetchProjectDetails}
            />
          )}
          {activeTab === "timeline" && (
            <div className="py-4">
              <ProjectTimeline events={timeline} loading={timelineLoading} />
            </div>
          )}
          {activeTab === "files" && (
            <div className="py-4">
              <ProjectFiles files={files} loading={filesLoading} />
            </div>
          )}
          {activeTab === "activity" && (
            <div className="py-4">
              <ProjectActivityFeed activities={activities} loading={activitiesLoading} />
            </div>
          )}
          {activeTab === "settings" && (
            <SettingsTab
              project={project}
              onRefresh={fetchProjectDetails}
            />
          )}
        </div>
      </div>

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        projectId={projectId}
        onSuccess={fetchProjectDetails}
      />

      {selectedTaskId && (
        <TaskDetailsModal
          isOpen={true}
          onClose={() => setSelectedTaskId(null)}
          taskId={selectedTaskId}
          projectId={projectId}
          onSuccess={fetchProjectDetails}
        />
      )}
    </main>
  );
}

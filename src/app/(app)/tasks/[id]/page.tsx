"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  LayoutDashboard, MessageSquare, CheckSquare, Paperclip,
  Clock, Share2, History,
} from "lucide-react";
import { ErrorState } from "@/components/ui";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { TaskHeader } from "@/components/task/task-header";
import { TaskOverview } from "@/components/task/task-overview";
import { TaskComments } from "@/components/task/task-comments";
import { TaskChecklist } from "@/components/task/task-checklist";
import { TaskAttachments } from "@/components/task/task-attachments";
import { TaskWorkLog } from "@/components/task/task-worklog";
import { TaskRelationships } from "@/components/task/task-relationships";
import { TaskHistory } from "@/components/task/task-history";
import { cn } from "@/lib/cn";
import { useToast } from "@/contexts/toast-context";
import type { TaskDetail } from "@/types/task";

type TabId = "overview" | "comments" | "checklist" | "attachments" | "worklog" | "relationships" | "history";

const TABS = [
  { id: "overview" as TabId, label: "Overview", icon: LayoutDashboard },
  { id: "comments" as TabId, label: "Comments", icon: MessageSquare },
  { id: "checklist" as TabId, label: "Checklist", icon: CheckSquare },
  { id: "attachments" as TabId, label: "Attachments", icon: Paperclip },
  { id: "worklog" as TabId, label: "Time Log", icon: Clock },
  { id: "relationships" as TabId, label: "Relationships", icon: Share2 },
  { id: "history" as TabId, label: "History", icon: History },
];

export default function TaskDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [members, setMembers] = useState<Array<{ id: string; name: string | null; email: string; image: string | null; role: string }>>([]);

  const fetchTask = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks/${id}`);
      if (!res.ok) throw new Error(res.status === 403 ? "Access denied" : "Task not found");
      const data = await res.json();
      setTask(data.task);
      setError("");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  useEffect(() => {
    if (task?.projectId) {
      fetch(`/api/projects/${task.projectId}/members`)
        .then((r) => r.ok && r.json())
        .then((d) => {
          const mapped = (d.members || d || []).map((m: any) => ({
            id: m.user?.id || m.id,
            name: m.user?.name || m.name,
            email: m.user?.email || m.email,
            image: m.user?.image || m.image,
            role: m.roleInProject || m.role,
          }));
          setMembers(mapped);
        })
        .catch(() => {});
    }
  }, [task?.projectId]);

  const updateTask = useCallback(async (data: Record<string, unknown>) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update");
    }
    const result = await res.json();
    setTask((prev) => prev ? { ...prev, ...result.task } : prev);
    return result;
  }, [id]);

  const archiveTask = useCallback(async () => {
    const res = await fetch(`/api/tasks/${id}/archive`, { method: "POST" });
    if (res.ok) { addToast({ message: "Task archived", type: "success" }); fetchTask(); }
    else { const err = await res.json(); addToast({ message: err.error || "Failed to archive", type: "error" }); }
  }, [id, addToast, fetchTask]);

  const restoreTask = useCallback(async () => {
    const res = await fetch(`/api/tasks/${id}/restore`, { method: "POST" });
    if (res.ok) { addToast({ message: "Task restored", type: "success" }); fetchTask(); }
    else { const err = await res.json(); addToast({ message: err.error || "Failed to restore", type: "error" }); }
  }, [id, addToast, fetchTask]);

  const duplicateTask = useCallback(async () => {
    const res = await fetch(`/api/tasks/${id}/duplicate`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      addToast({ message: "Task duplicated", type: "success" });
      router.push(`/tasks/${data.task.id}`);
    } else {
      const err = await res.json();
      addToast({ message: err.error || "Failed to duplicate", type: "error" });
    }
  }, [id, addToast, router]);

  const deleteTask = useCallback(async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (res.ok) {
      addToast({ message: "Task deleted", type: "success" });
      router.push("/tasks");
    } else {
      const err = await res.json();
      addToast({ message: err.error || "Failed to delete", type: "error" });
    }
  }, [id, addToast, router]);

  const addComment = useCallback(async (content: string) => {
    const res = await fetch(`/api/tasks/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error("Failed to add comment");
    const result = await res.json();
    setTask((prev) => prev ? { ...prev, comments: [...prev.comments, result.comment] } : prev);
    return result;
  }, [id]);

  const deleteComment = useCallback(async (commentId: string) => {
    const res = await fetch(`/api/tasks/${id}/comments/${commentId}`, { method: "DELETE" });
    if (res.ok) {
      setTask((prev) => prev ? { ...prev, comments: prev.comments.filter((c) => c.id !== commentId) } : prev);
    }
  }, [id]);

  const addChecklistItem = useCallback(async (title: string) => {
    const res = await fetch(`/api/tasks/${id}/checklist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error("Failed to add checklist item");
    const result = await res.json();
    setTask((prev) => prev ? { ...prev, checklist: [...prev.checklist, result.item] } : prev);
    return result;
  }, [id]);

  const updateChecklistItem = useCallback(async (itemId: string, data: Record<string, unknown>) => {
    const res = await fetch(`/api/tasks/${id}/checklist/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update checklist item");
    const result = await res.json();
    setTask((prev) => prev ? {
      ...prev,
      checklist: prev.checklist.map((c) => c.id === itemId ? { ...c, ...result.item } : c),
    } : prev);
    return result;
  }, [id]);

  const deleteChecklistItem = useCallback(async (itemId: string) => {
    const res = await fetch(`/api/tasks/${id}/checklist/${itemId}`, { method: "DELETE" });
    if (res.ok) {
      setTask((prev) => prev ? { ...prev, checklist: prev.checklist.filter((c) => c.id !== itemId) } : prev);
    }
  }, [id]);

  const logWork = useCallback(async (data: { timeSpent: number; description?: string; loggedAt?: string }) => {
    const res = await fetch(`/api/tasks/${id}/worklogs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to log work");
    const result = await res.json();
    setTask((prev) => prev ? {
      ...prev,
      workLogs: [...(prev.workLogs || []), result.workLog],
      timeSpent: (prev.timeSpent || 0) + data.timeSpent,
      timeRemaining: prev.timeRemaining != null ? Math.max(0, prev.timeRemaining - data.timeSpent) : null,
    } : prev);
    return result;
  }, [id]);

  const addRelationship = useCallback(async (relatedTaskId: string, type: string) => {
    const res = await fetch(`/api/tasks/${id}/relationships`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ relatedTaskId, type }),
    });
    if (!res.ok) throw new Error("Failed to add relationship");
    return res.json();
  }, [id]);

  const deleteRelationship = useCallback(async (relationshipId: string) => {
    const res = await fetch(`/api/tasks/${id}/relationships/${relationshipId}`, { method: "DELETE" });
    if (res.ok) {
      setTask((prev) => prev ? {
        ...prev,
        relationships: prev.relationships.filter((r) => r.id !== relationshipId),
        relatedFrom: prev.relatedFrom.filter((r) => r.id !== relationshipId),
      } : prev);
    }
  }, [id]);

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchTask} />;
  if (!task) return <ErrorState message="Task not found" onRetry={fetchTask} />;

  return (
    <div className="space-y-6">
      <TaskHeader
        task={task}
        onArchive={archiveTask}
        onRestore={restoreTask}
        onDuplicate={duplicateTask}
        onDelete={deleteTask}
      />

      <div className="flex gap-1 rounded-xl border border-border bg-surface p-1 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-accent text-white shadow-sm"
                  : "text-foreground-secondary hover:text-foreground hover:bg-surface-hover"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        {activeTab === "overview" && (
          <TaskOverview task={task} members={members} onUpdate={updateTask} />
        )}
        {activeTab === "comments" && (
          <TaskComments
            comments={task.comments}
            onAddComment={addComment}
            onDeleteComment={deleteComment}
          />
        )}
        {activeTab === "checklist" && (
          <TaskChecklist
            items={task.checklist}
            onAdd={addChecklistItem}
            onUpdate={updateChecklistItem}
            onDelete={deleteChecklistItem}
          />
        )}
        {activeTab === "attachments" && (
          <TaskAttachments attachments={task.attachments} />
        )}
        {activeTab === "worklog" && (
          <TaskWorkLog workLogs={task.workLogs} onLogWork={logWork} />
        )}
        {activeTab === "relationships" && (
          <TaskRelationships
            relationships={task.relationships}
            relatedFrom={task.relatedFrom}
            onAdd={addRelationship}
            onDelete={deleteRelationship}
          />
        )}
        {activeTab === "history" && (
          <TaskHistory history={task.history} />
        )}
      </div>
    </div>
  );
}

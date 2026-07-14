"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader, ErrorState, Badge } from "@/components/ui";
import { BacklogOrderingList } from "@/components/backlog/backlog-ordering-list";
import { BacklogFilters } from "@/components/backlog/backlog-filters";
import { BacklogToolbar } from "@/components/backlog/backlog-toolbar";
import { BacklogBulkToolbar } from "@/components/backlog/backlog-bulk-toolbar";
import { BacklogEmptyState } from "@/components/backlog/backlog-empty-state";
import type { BacklogTask } from "@/types/agile";

export default function BacklogPage() {
  const { id: projectId } = useParams() as { id: string };
  const { data: session } = useSession();

  const [tasks, setTasks] = useState<BacklogTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sprints, setSprints] = useState<Array<{ id: string; name: string }>>([]);
  const [epics, setEpics] = useState<Array<{ id: string; title: string }>>([]);
  const [releases, setReleases] = useState<Array<{ id: string; name: string }>>([]);
  const [projectName, setProjectName] = useState("");

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProjectName(data.project?.name || "");
      }
    } catch { /* ignore */ }
  }, [projectId]);

  const fetchMeta = useCallback(async () => {
    try {
      const [sRes, eRes, rRes] = await Promise.all([
        fetch(`/api/sprints?projectId=${projectId}&pageSize=100`),
        fetch(`/api/epics?projectId=${projectId}&pageSize=100`),
        fetch(`/api/releases?projectId=${projectId}&pageSize=100`),
      ]);
      if (sRes.ok) {
        const sData = await sRes.json();
        setSprints(sData.sprints || []);
      }
      if (eRes.ok) {
        const eData = await eRes.json();
        setEpics(eData.epics || []);
      }
      if (rRes.ok) {
        const rData = await rRes.json();
        setReleases(rData.releases || []);
      }
    } catch { /* ignore */ }
  }, [projectId]);

  const fetchBacklog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sp = new URLSearchParams();
      if (search) sp.set("search", search);
      if (statusFilter) sp.set("status", statusFilter);
      if (priorityFilter) sp.set("priority", priorityFilter);
      sp.set("pageSize", "100");
      const qs = sp.toString();
      const res = await fetch(`/api/projects/${projectId}/backlog${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error("Failed to load backlog");
      const data = await res.json();
      setTasks(data.tasks || []);
      setTotal(data.pagination?.total || 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load backlog");
    } finally {
      setLoading(false);
    }
  }, [projectId, search, statusFilter, priorityFilter]);

  useEffect(() => { fetchProject(); fetchMeta(); }, [fetchProject, fetchMeta]);
  useEffect(() => { fetchBacklog(); }, [fetchBacklog]);

  const hasActiveFilters = !!(search || statusFilter || priorityFilter);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
  }, []);

  const handleSelect = useCallback((id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelected(new Set(tasks.map((t) => t.id)));
  }, [tasks]);

  const handleDeselectAll = useCallback(() => {
    setSelected(new Set());
  }, []);

  const handleReorder = useCallback(async (taskId: string, targetIndex: number) => {
    const prevTasks = [...tasks];
    const fromIdx = tasks.findIndex((t) => t.id === taskId);
    if (fromIdx === -1) return;
    const reordered = [...tasks];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(targetIndex, 0, moved);
    setTasks(reordered);
    try {
      const res = await fetch(`/api/projects/${projectId}/backlog/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, targetIndex }),
      });
      if (!res.ok) setTasks(prevTasks);
    } catch {
      setTasks(prevTasks);
    }
  }, [tasks, projectId]);

  const handleAssignSprint = useCallback(async (sprintId: string) => {
    const taskIds = Array.from(selected);
    try {
      const res = await fetch(`/api/projects/${projectId}/backlog/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskIds, targetSprintId: sprintId }),
      });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => !taskIds.includes(t.id)));
        setSelected(new Set());
        fetchBacklog();
      }
    } catch { /* ignore */ }
  }, [selected, projectId, fetchBacklog]);

  const handleAssignEpic = useCallback(async (epicId: string) => {
    const taskIds = Array.from(selected);
    try {
      const res = await fetch(`/api/projects/${projectId}/backlog/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskIds, targetEpicId: epicId }),
      });
      if (res.ok) {
        setSelected(new Set());
        fetchBacklog();
      }
    } catch { /* ignore */ }
  }, [selected, projectId, fetchBacklog]);

  const handleAssignRelease = useCallback(async (releaseId: string) => {
    const taskIds = Array.from(selected);
    try {
      const res = await fetch(`/api/projects/${projectId}/backlog/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskIds, targetReleaseId: releaseId }),
      });
      if (res.ok) {
        setSelected(new Set());
        fetchBacklog();
      }
    } catch { /* ignore */ }
  }, [selected, projectId, fetchBacklog]);

  const allSelected = tasks.length > 0 && selected.size === tasks.length;
  const activeSprints = sprints.filter((s) => s.name);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8 overflow-y-auto">
      <PageHeader
        title="Backlog"
        subtitle={projectName ? `Manage the product backlog for ${projectName}` : "Prioritize and organize your work"}
        metadata={`${total} task${total !== 1 ? "s" : ""}`}
      />

      <div className="mt-6 space-y-4">
        <BacklogFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          total={total}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          epics={epics}
          epicIdFilter={undefined}
          onEpicIdFilterChange={undefined}
        />

        <div className="flex items-center justify-between">
          <BacklogToolbar
            selectedCount={selected.size}
            totalCount={tasks.length}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            allSelected={allSelected}
          />
        </div>

        <BacklogBulkToolbar
          selectedCount={selected.size}
          onClearSelection={handleDeselectAll}
          sprints={activeSprints}
          epics={epics}
          releases={releases}
          onAssignSprint={handleAssignSprint}
          onAssignEpic={handleAssignEpic}
          onAssignRelease={handleAssignRelease}
        />

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-border bg-surface p-4">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded bg-surface-hover" />
                  <div className="h-4 w-3/4 rounded bg-surface-hover" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState title="Failed to load backlog" message={error} onRetry={fetchBacklog} />
        ) : tasks.length === 0 ? (
          <BacklogEmptyState
            hasFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
          />
        ) : (
          <BacklogOrderingList
            tasks={tasks}
            selected={selected}
            onSelect={handleSelect}
            onReorder={handleReorder}
          />
        )}
      </div>
    </main>
  );
}

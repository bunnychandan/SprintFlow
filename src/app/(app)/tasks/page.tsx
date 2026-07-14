"use client";

import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import { TaskCard } from "@/components/task/task-card";
import { TaskTable } from "@/components/task/task-table";
import { TaskFilters } from "@/components/task/task-filters";
import { TaskEmptyState } from "@/components/task/task-empty-state";
import { Button } from "@/components/ui/button";
import CreateTaskModal from "@/components/create-task-modal";
import type { TaskViewMode } from "@/types/task";

export default function TasksPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [viewMode, setViewMode] = useState<TaskViewMode>("table");
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, loading, error, refetch } = useTasks({
    search: search || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    type: typeFilter || undefined,
    assigneeId: assigneeFilter || undefined,
    sortBy,
  });

  const tasks = data?.tasks ?? [];
  const total = data?.total ?? 0;

  const hasActiveFilters = !!(search || statusFilter || priorityFilter || typeFilter || assigneeFilter);

  const handleSelect = useCallback((id: string, sel: boolean) => {
    setSelectedTasks((prev) => {
      const next = new Set(prev);
      if (sel) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedTasks((prev) => {
      if (prev.size === tasks.length && tasks.length > 0) return new Set();
      return new Set(tasks.map((t) => t.id));
    });
  }, [tasks]);

  const handleCreateSuccess = () => {
    refetch();
    setShowCreateModal(false);
  };

  if (error) return <div className="p-8 text-center"><p className="text-red-500 mb-2">{error}</p><button onClick={() => refetch()} className="text-sm underline">Retry</button></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
          <p className="text-sm text-foreground-secondary mt-1">Manage and track all tasks across projects</p>
        </div>
        <Button variant="gradient" onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-1" /> Create Task
        </Button>
      </div>

      <TaskFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        assigneeFilter={assigneeFilter}
        onAssigneeFilterChange={setAssigneeFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        total={total}
        selectedCount={selectedTasks.size}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={() => { setSearch(""); setStatusFilter(""); setPriorityFilter(""); setTypeFilter(""); setAssigneeFilter(""); }}
      />

      {loading ? (
        <div className="flex items-center justify-center py-16 text-foreground-muted">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <TaskEmptyState
          hasFilters={hasActiveFilters}
          onClearFilters={() => { setSearch(""); setStatusFilter(""); setPriorityFilter(""); setTypeFilter(""); setAssigneeFilter(""); }}
          onCreateTask={() => setShowCreateModal(true)}
        />
      ) : viewMode === "table" ? (
        <TaskTable tasks={tasks} selectedTasks={selectedTasks} onSelect={handleSelect} onSelectAll={handleSelectAll} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onSelect={handleSelect}
              selected={selectedTasks.has(task.id)}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateTaskModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          projectId=""
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button, PriorityBadge, TypeBadge, Badge } from "@/components/ui";
import { Avatar } from "@/components/ui/avatar";

const STATUS_COLUMNS = [
  { label: "To Do", value: "TODO", color: "border-slate-700/50 bg-slate-900/10" },
  { label: "In Progress", value: "IN_PROGRESS", color: "border-sky-500/20 bg-sky-500/5" },
  { label: "In Review", value: "IN_REVIEW", color: "border-amber-500/20 bg-amber-500/5" },
  { label: "QA Testing", value: "QA_TESTING", color: "border-indigo-500/20 bg-indigo-500/5" },
  { label: "Blocked", value: "BLOCKED", color: "border-red-500/20 bg-red-500/5" },
  { label: "Done", value: "DONE", color: "border-emerald-500/20 bg-emerald-500/5" },
];

interface BoardTabProps {
  project: any;
  activeSprint: any;
  onTaskClick: (taskId: string) => void;
  onCreateTask: () => void;
  onRefresh: () => void;
}

export default function BoardTab({
  project,
  activeSprint,
  onTaskClick,
  onCreateTask,
  onRefresh,
}: BoardTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterOnlyMyIssues, setFilterOnlyMyIssues] = useState(false);

  const filteredTasks = (project.tasks || []).filter((task: any) => {
    if (activeSprint) {
      if (task.sprintId !== activeSprint.id) return false;
    }

    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAssignee = filterAssignee ? task.assigneeId === filterAssignee : true;
    const matchesPriority = filterPriority ? task.priority === filterPriority : true;
    const matchesMyIssues = filterOnlyMyIssues ? task.assigneeId === project.currentUserId : true;

    return matchesSearch && matchesAssignee && matchesPriority && matchesMyIssues;
  });

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (!taskId) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });
      if (res.ok) onRefresh();
    } catch {
      onRefresh();
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted" />
            <input
              type="text"
              placeholder="Filter issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-full border border-border bg-surface pl-9 pr-4 py-2 text-xs text-foreground focus:outline-none focus:border-accent w-44"
            />
          </div>
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="rounded-full border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
          >
            <option value="">All Assignees</option>
            {(project.members || []).map((m: any) => (
              <option key={m.userId} value={m.user.id}>
                {m.user.name}
              </option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="rounded-full border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
          >
            <option value="">All Priorities</option>
            <option value="LOWEST">Lowest</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="HIGHEST">Highest</option>
            <option value="CRITICAL">Critical</option>
          </select>
          <button
            onClick={() => setFilterOnlyMyIssues(!filterOnlyMyIssues)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all",
              filterOnlyMyIssues
                ? "border-accent/50 bg-accent-light text-accent"
                : "border-border bg-surface text-foreground-secondary hover:text-foreground"
            )}
          >
            Only My Issues
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeSprint ? (
            <Badge variant="primary" size="sm">
              Sprint: {activeSprint.name}
            </Badge>
          ) : (
            <Badge variant="neutral" size="sm">
              All Issues
            </Badge>
          )}
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-3.5 w-3.5" />}
            onClick={onCreateTask}
          >
            Create Task
          </Button>
        </div>
      </div>

      <div className="flex-1 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6 overflow-x-auto overflow-y-hidden pb-4 select-none min-h-0">
        {STATUS_COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t: any) => t.status === col.value);
          return (
            <div
              key={col.value}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.value)}
              className={cn("rounded-2xl border border-border/50 p-3 flex flex-col max-h-full", col.color)}
            >
              <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
                <h3 className="font-semibold text-foreground text-xs tracking-wider uppercase">
                  {col.label}
                </h3>
                <span className="rounded-full bg-surface-hover px-2 py-0.5 text-[10px] text-foreground-muted font-bold">
                  {colTasks.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
                {colTasks.map((task: any) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => onTaskClick(task.id)}
                    className="rounded-xl border border-border bg-surface/80 p-3 shadow-sm hover:border-accent/30 hover:bg-surface cursor-grab active:cursor-grabbing transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
                        <TypeBadge type={task.type || "TASK"} />
                      </div>
                      <PriorityBadge priority={task.priority} />
                    </div>

                    <div className="mt-2 flex items-start gap-1.5">
                      <h4 className="text-xs font-medium text-foreground line-clamp-2 leading-snug">
                        {task.title}
                      </h4>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 text-[10px] text-foreground-muted">
                      <div className="flex items-center gap-1.5">
                        {task.storyPoints !== null && (
                          <span className="rounded bg-surface-hover px-1.5 py-0.5 font-semibold text-foreground-secondary">
                            {task.storyPoints} pts
                          </span>
                        )}
                        <span className="font-semibold text-accent">
                          {project.code}-{task.id.slice(-4).toUpperCase()}
                        </span>
                      </div>

                      {task.assignee ? (
                        <Avatar
                          src={task.assignee.image}
                          name={task.assignee.name}
                          size="sm"
                          className="h-5 w-5"
                        />
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

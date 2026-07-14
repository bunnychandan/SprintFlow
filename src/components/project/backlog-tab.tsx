"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, CheckCircle2, Plus, Calendar } from "lucide-react";
import { Button, Badge, PriorityBadge, TypeBadge, Input, Select } from "@/components/ui";

interface BacklogTabProps {
  project: any;
  onTaskClick: (taskId: string) => void;
  onRefresh: () => void;
}

const DURATION_OPTIONS = [
  { value: "1", label: "1 Week" },
  { value: "2", label: "2 Weeks (Recommended)" },
  { value: "3", label: "3 Weeks" },
  { value: "4", label: "4 Weeks" },
];

export default function BacklogTab({
  project,
  onTaskClick,
  onRefresh,
}: BacklogTabProps) {
  const [isCreatingSprint, setIsCreatingSprint] = useState(false);
  const [newSprintName, setNewSprintName] = useState("");
  const [startingSprintId, setStartingSprintId] = useState<string | null>(null);
  const [sprintGoal, setSprintGoal] = useState("");
  const [sprintDuration, setSprintDuration] = useState("2");

  const isManager =
    project.ownerId === project.currentUserId ||
    ["SUPER_ADMIN", "ADMIN"].includes(project.currentUserRole || "") ||
    ["PROJECT_MANAGER", "SCRUM_MASTER"].includes(project.currentUserProjectRole || "");

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSprintName.trim()) return;

    try {
      const res = await fetch("/api/sprints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, name: newSprintName.trim() }),
      });
      if (res.ok) {
        setNewSprintName("");
        setIsCreatingSprint(false);
        onRefresh();
      }
    } catch {
      // handled silently
    }
  };

  const handleStartSprint = async () => {
    if (!startingSprintId) return;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + Number(sprintDuration) * 7);

    try {
      const res = await fetch(`/api/sprints/${startingSprintId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "ACTIVE",
          goal: sprintGoal.trim() || null,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      });
      if (res.ok) {
        setStartingSprintId(null);
        setSprintGoal("");
        onRefresh();
      }
    } catch {
      // handled silently
    }
  };

  const handleCompleteSprint = async (sprintId: string) => {
    try {
      const res = await fetch(`/api/sprints/${sprintId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      if (res.ok) onRefresh();
    } catch {
      // handled silently
    }
  };

  const backlogTasks = (project.tasks || []).filter((t: any) => !t.sprintId);

  return (
    <div className="flex-1 flex flex-col md:grid md:grid-cols-[1.3fr_0.7fr] gap-6 overflow-hidden min-h-0">
      <div className="flex-grow overflow-y-auto space-y-4 pr-1 min-h-0">
        {(project.sprints || []).map((sprint: any) => {
          const sprintTasks = (project.tasks || []).filter(
            (t: any) => t.sprintId === sprint.id
          );
          const doneTasks = sprintTasks.filter((t: any) => t.status === "DONE");
          const progress = sprintTasks.length
            ? Math.round((doneTasks.length / sprintTasks.length) * 100)
            : 0;

          return (
            <motion.div
              key={sprint.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-surface p-5 space-y-3"
            >
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{sprint.name}</h3>
                    <Badge
                      variant={
                        sprint.status === "ACTIVE"
                          ? "primary"
                          : sprint.status === "COMPLETED"
                          ? "success"
                          : "neutral"
                      }
                      size="sm"
                    >
                      {sprint.status}
                    </Badge>
                  </div>
                  {sprint.goal && (
                    <p className="text-xs text-foreground-secondary mt-1">
                      Goal: {sprint.goal}
                    </p>
                  )}
                  {sprint.startDate && (
                    <p className="text-[10px] text-foreground-muted mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-accent" />
                      {new Date(sprint.startDate).toLocaleDateString()} -{" "}
                      {new Date(sprint.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {isManager && (
                  <div className="flex gap-2">
                    {sprint.status === "PLANNING" && (
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Play className="h-3 w-3" />}
                        onClick={() => setStartingSprintId(sprint.id)}
                      >
                        Start Sprint
                      </Button>
                    )}
                    {sprint.status === "ACTIVE" && (
                      <Button
                        variant="success"
                        size="sm"
                        leftIcon={<CheckCircle2 className="h-3 w-3" />}
                        onClick={() => handleCompleteSprint(sprint.id)}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {sprintTasks.length > 0 && sprint.status !== "PLANNING" && (
                <div className="space-y-1.5">
                  <div className="h-1.5 w-full rounded-full bg-surface-hover overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-sky-500 transition-all duration-300 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-foreground-muted">
                    <span>Progress: {progress}%</span>
                    <span>
                      {doneTasks.length} / {sprintTasks.length} completed
                    </span>
                  </div>
                </div>
              )}

              <div className="divide-y divide-border border border-border rounded-xl bg-surface/50 overflow-hidden mt-3">
                {sprintTasks.map((t: any) => (
                  <div
                    key={t.id}
                    onClick={() => onTaskClick(t.id)}
                    className="px-4 py-2.5 hover:bg-surface-hover cursor-pointer flex items-center justify-between gap-3 text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2 overflow-hidden min-w-0">
                      <TypeBadge type={t.type || "TASK"} />
                      <span className="font-semibold text-accent shrink-0">
                        {project.code}-{t.id.slice(-4).toUpperCase()}
                      </span>
                      <span className="text-foreground truncate">{t.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <PriorityBadge priority={t.priority} />
                      <Badge
                        variant={
                          t.status === "DONE"
                            ? "success"
                            : t.status === "IN_PROGRESS"
                            ? "info"
                            : t.status === "BLOCKED"
                            ? "danger"
                            : "neutral"
                        }
                        size="sm"
                      >
                        {t.status}
                      </Badge>
                      {isManager && (
                        <select
                          onClick={(e) => e.stopPropagation()}
                          onChange={async (e) => {
                            await fetch(`/api/tasks/${t.id}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                sprintId: e.target.value || null,
                              }),
                            });
                            onRefresh();
                          }}
                          value={t.sprintId || ""}
                          className="bg-surface-hover border border-border rounded px-1.5 py-0.5 text-[9px] text-foreground focus:outline-none"
                        >
                          <option value="">Backlog</option>
                          {(project.sprints || [])
                            .filter((s: any) => s.status !== "COMPLETED")
                            .map((s: any) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                        </select>
                      )}
                    </div>
                  </div>
                ))}
                {sprintTasks.length === 0 && (
                  <div className="p-4 text-center text-foreground-muted italic text-xs">
                    No tasks in this sprint
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="space-y-4 overflow-y-auto pr-1 min-h-0">
        {isManager && (
          <div className="rounded-2xl border border-border bg-surface p-4">
            <h3 className="text-xs uppercase tracking-wider text-foreground-muted font-semibold mb-3">
              Sprint Cadence
            </h3>
            {isCreatingSprint ? (
              <form onSubmit={handleCreateSprint} className="space-y-3">
                <Input
                  value={newSprintName}
                  onChange={(e) => setNewSprintName(e.target.value)}
                  placeholder="e.g. Sprint 4 - Release hardening"
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    onClick={() => setIsCreatingSprint(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit">
                    Add
                  </Button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsCreatingSprint(true)}
                className="w-full rounded-xl border border-dashed border-border bg-surface/50 py-3 hover:bg-surface-hover transition-all text-xs font-semibold text-accent flex items-center justify-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Create Planning Sprint
              </button>
            )}
          </div>
        )}

        {startingSprintId && (
          <div className="rounded-2xl border border-accent/30 bg-accent-light p-4 space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-accent font-semibold">
              Start Active Sprint
            </h3>
            <Input
              label="Sprint Goal"
              value={sprintGoal}
              onChange={(e) => setSprintGoal(e.target.value)}
              placeholder="e.g. Deliver OAuth & Admin Console"
            />
            <Select
              label="Duration"
              value={sprintDuration}
              onChange={(e) => setSprintDuration(e.target.value)}
              options={DURATION_OPTIONS}
            />
            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setStartingSprintId(null)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleStartSprint}>
                Activate
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
            <h3 className="text-xs uppercase tracking-wider text-foreground-muted font-semibold">
              Backlog
            </h3>
            <span className="rounded-full bg-surface-hover px-2 py-0.5 text-[10px] text-foreground-muted font-bold">
              {backlogTasks.length}
            </span>
          </div>

          <div className="divide-y divide-border space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
            {backlogTasks.map((t: any) => (
              <div
                key={t.id}
                onClick={() => onTaskClick(t.id)}
                className="rounded-xl border border-border/50 bg-surface/30 p-2.5 hover:bg-surface-hover cursor-pointer flex flex-col gap-1.5 text-xs transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
                    <TypeBadge type={t.type || "TASK"} />
                    <span className="font-semibold text-accent">
                      {project.code}-{t.id.slice(-4).toUpperCase()}
                    </span>
                  </div>
                  <PriorityBadge priority={t.priority} />
                </div>
                <p className="text-foreground truncate">{t.title}</p>
                {isManager && (
                  <div
                    className="flex justify-end pt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      onChange={async (e) => {
                        if (!e.target.value) return;
                        await fetch(`/api/tasks/${t.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ sprintId: e.target.value }),
                        });
                        onRefresh();
                      }}
                      className="bg-surface-hover border border-border rounded px-1.5 py-0.5 text-[9px] text-foreground focus:outline-none"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Move to Sprint...
                      </option>
                      {(project.sprints || [])
                        .filter((s: any) => s.status !== "COMPLETED")
                        .map((s: any) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            ))}
            {backlogTasks.length === 0 && (
              <p className="text-foreground-muted italic text-xs text-center py-4">
                No tasks in backlog
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

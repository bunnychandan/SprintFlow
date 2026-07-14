"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, User, Target, ArrowUpDown } from "lucide-react";
import { TaskStatusBadge, TaskPriorityBadge, TaskTypeBadge } from "./task-status-badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/contexts/toast-context";
import type { TaskDetail } from "@/types/task";

interface TaskOverviewProps {
  task: TaskDetail;
  members: Array<{ id: string; name: string | null; email: string; image: string | null; role: string }>;
  onUpdate: (data: Record<string, unknown>) => Promise<any>;
}

const STATUS_OPTIONS = [
  { value: "BACKLOG", label: "Backlog" },
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "QA_TESTING", label: "QA Testing" },
  { value: "DONE", label: "Done" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REOPENED", label: "Reopened" },
];

const PRIORITY_OPTIONS = [
  { value: "LOWEST", label: "Lowest" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "HIGHEST", label: "Highest" },
  { value: "CRITICAL", label: "Critical" },
];

const TYPE_OPTIONS = [
  { value: "EPIC", label: "Epic" },
  { value: "STORY", label: "Story" },
  { value: "TASK", label: "Task" },
  { value: "SUBTASK", label: "Subtask" },
  { value: "BUG", label: "Bug" },
  { value: "SPIKE", label: "Spike" },
  { value: "IMPROVEMENT", label: "Improvement" },
  { value: "TECH_DEBT", label: "Tech Debt" },
  { value: "RESEARCH", label: "Research" },
];

export function TaskOverview({ task, members, onUpdate }: TaskOverviewProps) {
  const { addToast } = useToast();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [saving, setSaving] = useState<string | null>(null);

  const spent = task.timeSpent || 0;
  const remaining = task.timeRemaining ?? task.originalEstimate ?? 0;
  const total = spent + remaining;
  const spentPct = total ? Math.round((spent / total) * 100) : 0;

  const handleUpdate = async (field: string, value: any) => {
    setSaving(field);
    try {
      const payload: Record<string, unknown> = {};
      if (["storyPoints", "originalEstimate"].includes(field) && value !== "") {
        payload[field] = Number(value);
      } else if (["dueDate"].includes(field)) {
        payload[field] = value || null;
      } else if (["assigneeId", "sprintId"].includes(field)) {
        payload[field] = value || null;
      } else {
        payload[field] = value;
      }
      await onUpdate(payload);
      addToast({ message: "Task updated", type: "success" });
    } catch {
      addToast({ message: "Failed to update task", type: "error" });
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="space-y-6">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title !== task.title && handleUpdate("title", title)}
            className="w-full text-xl font-semibold bg-transparent border-b border-transparent hover:border-border focus:border-accent focus:outline-none py-1 text-foreground"
          />
        </div>

        <div>
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => description !== (task.description || "") && handleUpdate("description", description)}
            placeholder="Add a detailed description..."
            rows={4}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {task.labels && task.labels.map((label, i) => (
            <span key={i} className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-surface p-4">
        <h3 className="text-sm font-semibold text-foreground">Details</h3>

        <Select
          label="Type"
          value={task.type}
          onChange={(e) => handleUpdate("type", e.target.value)}
          options={TYPE_OPTIONS}
        />

        <Select
          label="Status"
          value={task.status}
          onChange={(e) => handleUpdate("status", e.target.value)}
          options={STATUS_OPTIONS}
        />

        <Select
          label="Priority"
          value={task.priority}
          onChange={(e) => handleUpdate("priority", e.target.value)}
          options={PRIORITY_OPTIONS}
        />

        <Select
          label="Assignee"
          value={task.assigneeId || ""}
          onChange={(e) => handleUpdate("assigneeId", e.target.value)}
          options={[
            { value: "", label: "Unassigned" },
            ...members.map((m) => ({ value: m.id, label: m.name || m.email })),
          ]}
        />

        <Input
          label="Story Points"
          type="number"
          value={task.storyPoints ?? ""}
          onChange={(e) => {}}
          onBlur={(e: any) => handleUpdate("storyPoints", e.target.value)}
          placeholder="Unestimated"
          min={0}
        />

        <Input
          label="Due Date"
          type="date"
          value={task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
          onChange={(e) => {}}
          onBlur={(e: any) => handleUpdate("dueDate", e.target.value)}
        />

        <div className="pt-4 border-t border-border space-y-3">
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-accent" />
            Time Tracking
          </h4>

          <div className="space-y-1">
            <div className="h-2 w-full rounded-full bg-surface-hover overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-sky-500 transition-all duration-300 rounded-full" style={{ width: `${spentPct}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-foreground-muted font-medium">
              <span>{spent}h logged</span>
              <span>{remaining}h remaining</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex flex-col gap-2 text-xs text-foreground-muted">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>Reporter: {task.reporter?.name || task.reporter?.email}</span>
          </div>
          {task.sprint && (
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span>Sprint: {task.sprint.name}</span>
            </div>
          )}
          {task.createdAt && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

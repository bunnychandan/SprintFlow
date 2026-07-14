"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import {
  ArrowUpDown, GripVertical, CheckCircle2, AlertCircle, Calendar, User,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { BacklogPriorityBadge } from "./backlog-priority-badge";
import type { BacklogTask } from "@/types/agile";

interface BacklogTaskCardProps {
  task: BacklogTask;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, taskId: string) => void;
}

export function BacklogTaskCard({ task, selected, onSelect, onDragStart, onDragOver, onDrop }: BacklogTaskCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, task.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop?.(e, task.id)}
      className={cn(
        "group flex items-center gap-3 rounded-xl border bg-surface px-4 py-3 transition-all cursor-grab active:cursor-grabbing",
        selected ? "border-accent ring-1 ring-accent/30 bg-accent/5" : "border-border hover:border-accent/30 hover:shadow-sm"
      )}
    >
      <div className="flex items-center gap-2 text-foreground-muted">
        <GripVertical className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
        {onSelect && (
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(task.id, e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">{task.title}</span>
          {task.epic && (
            <span
              className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${task.epic.color}20`, color: task.epic.color }}
            >
              {task.epic.title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <BacklogPriorityBadge priority={task.priority} />
          <span className="text-xs text-foreground-secondary capitalize">{task.type}</span>
          <span className={cn(
            "text-xs px-1.5 py-0.5 rounded-full",
            task.status === "DONE" && "bg-emerald-500/10 text-emerald-600",
            task.status === "BLOCKED" && "bg-red-500/10 text-red-600",
            task.status === "IN_PROGRESS" && "bg-amber-500/10 text-amber-600",
            !["DONE","BLOCKED","IN_PROGRESS"].includes(task.status) && "bg-surface-hover text-foreground-secondary"
          )}>
            {task.status.replace(/_/g, " ")}
          </span>
          {task.storyPoints && (
            <span className="text-xs text-foreground-muted">{task.storyPoints} SP</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE" && task.status !== "CANCELLED" && (
          <Calendar className="h-4 w-4 text-red-500" />
        )}
        {task.assignee && (
          <Avatar src={task.assignee.image} name={task.assignee.name || undefined} className="h-6 w-6" />
        )}
      </div>
    </div>
  );
}

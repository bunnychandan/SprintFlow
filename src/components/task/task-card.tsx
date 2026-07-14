"use client";

import Link from "next/link";
import { MessageSquare, Paperclip, Clock, GripVertical } from "lucide-react";
import { cn } from "@/lib/cn";
import { TaskStatusBadge, TaskPriorityBadge, TaskTypeBadge } from "./task-status-badge";
import { Avatar } from "@/components/ui/avatar";
import type { TaskListItem } from "@/types/task";

interface TaskCardProps {
  task: TaskListItem;
  onSelect?: (id: string, selected: boolean) => void;
  selected?: boolean;
  draggable?: boolean;
}

export function TaskCard({ task, onSelect, selected, draggable }: TaskCardProps) {
  const commentCount = task._count?.comments ?? 0;
  const attachmentCount = task._count?.attachments ?? 0;
  const checklistCount = task._count?.checklist ?? 0;

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border bg-surface p-4 transition-all duration-200",
        selected ? "border-accent ring-1 ring-accent/30" : "border-border hover:border-accent/30 hover:shadow-md"
      )}
    >
      {draggable && (
        <div className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab text-foreground-muted opacity-0 group-hover:opacity-100">
          <GripVertical className="h-4 w-4" />
        </div>
      )}

      <div className={cn("flex items-start justify-between", draggable && "pl-4")}>
        <div className="flex items-center gap-2 min-w-0">
          {onSelect && (
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect(task.id, e.target.checked)}
              className="h-4 w-4 rounded border-border shrink-0"
            />
          )}
          <TaskTypeBadge type={task.type} />
        </div>
        <TaskPriorityBadge priority={task.priority} />
      </div>

      <Link href={`/tasks/${task.id}`} className="mt-2 group/title">
        <h3 className="font-medium text-foreground group-hover/title:text-accent transition-colors line-clamp-2">
          {task.title}
        </h3>
      </Link>

      {task.description && (
        <p className="mt-1 text-sm text-foreground-secondary line-clamp-2">{task.description}</p>
      )}

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <TaskStatusBadge status={task.status} />
        {task.storyPoints != null && (
          <span className="text-xs text-foreground-muted">{task.storyPoints} SP</span>
        )}
        {task.labels && task.labels.length > 0 && task.labels.slice(0, 3).map((label, i) => (
          <span key={i} className="inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
            {label}
          </span>
        ))}
      </div>

      {task.dueDate && (
        <div className="mt-2 flex items-center gap-1 text-xs text-foreground-muted">
          <Clock className="h-3 w-3" />
          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-3 text-xs text-foreground-muted">
          {commentCount > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {commentCount}
            </span>
          )}
          {attachmentCount > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip className="h-3.5 w-3.5" />
              {attachmentCount}
            </span>
          )}
          {checklistCount > 0 && (
            <span className="flex items-center gap-1 text-xs">
              ○ {checklistCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {task.project && (
            <Link
              href={`/projects/${task.projectId}`}
              className="text-xs text-foreground-muted hover:text-accent transition-colors"
            >
              {task.project.code}
            </Link>
          )}
          {task.assignee && (
            <Avatar
              src={task.assignee.image}
              name={task.assignee.name ?? task.assignee.email}
              className="h-6 w-6"
            />
          )}
        </div>
      </div>
    </div>
  );
}

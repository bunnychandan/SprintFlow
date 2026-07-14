"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Archive, Trash2, Copy, RotateCcw, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskStatusBadge, TaskPriorityBadge } from "./task-status-badge";
import type { TaskDetail } from "@/types/task";

interface TaskHeaderProps {
  task: TaskDetail;
  onArchive: () => Promise<any>;
  onRestore: () => Promise<any>;
  onDuplicate: () => Promise<any>;
  onDelete: () => Promise<void>;
}

export function TaskHeader({ task, onArchive, onRestore, onDuplicate, onDelete }: TaskHeaderProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-foreground-muted">
        <Link href="/tasks" className="hover:text-accent transition-colors flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Tasks
        </Link>
        {task.project && (
          <>
            <span>/</span>
            <Link href={`/projects/${task.projectId}`} className="hover:text-accent transition-colors">
              {task.project.name}
            </Link>
          </>
        )}
      </div>

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{task.title}</h1>
            <div className="flex items-center gap-2">
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />
            </div>
          </div>
          {task.project && (
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: task.project.color || "#2563eb" }}
            >
              {task.project.code}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {task.archivedAt ? (
            <Button variant="secondary" size="sm" onClick={onRestore}>
              <RotateCcw className="h-4 w-4 mr-1" /> Restore
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={onArchive}>
              <Archive className="h-4 w-4 mr-1" /> Archive
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={onDuplicate}>
            <Copy className="h-4 w-4 mr-1" /> Duplicate
          </Button>
          <Button variant="danger" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

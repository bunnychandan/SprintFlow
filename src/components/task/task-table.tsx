"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { TaskStatusBadge, TaskPriorityBadge, TaskTypeBadge } from "./task-status-badge";
import { Avatar } from "@/components/ui/avatar";
import type { TaskListItem } from "@/types/task";

interface TaskTableProps {
  tasks: TaskListItem[];
  selectedTasks: Set<string>;
  onSelect: (id: string, selected: boolean) => void;
  onSelectAll: () => void;
}

export function TaskTable({ tasks, selectedTasks, onSelect, onSelectAll }: TaskTableProps) {
  const allSelected = tasks.length > 0 && tasks.every((t) => selectedTasks.has(t.id));

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-surface-hover">
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAll}
                className="h-4 w-4 rounded border-border"
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider">Task</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider">Priority</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider">Assignee</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider">Due Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider">Project</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {tasks.map((task) => (
            <tr
              key={task.id}
              className={cn(
                "group transition-colors hover:bg-surface-hover",
                selectedTasks.has(task.id) && "bg-accent/5"
              )}
            >
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedTasks.has(task.id)}
                  onChange={(e) => onSelect(task.id, e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <TaskTypeBadge type={task.type} />
                  <Link
                    href={`/tasks/${task.id}`}
                    className="font-medium text-foreground hover:text-accent transition-colors line-clamp-1"
                  >
                    {task.title}
                  </Link>
                </div>
              </td>
              <td className="px-4 py-3">
                <TaskStatusBadge status={task.status} />
              </td>
              <td className="px-4 py-3">
                <TaskPriorityBadge priority={task.priority} />
              </td>
              <td className="px-4 py-3">
                {task.assignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={task.assignee.image}
                      name={task.assignee.name ?? task.assignee.email}
                      className="h-6 w-6"
                    />
                    <span className="text-sm text-foreground-secondary">
                      {task.assignee.name || task.assignee.email}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-foreground-muted">Unassigned</span>
                )}
              </td>
              <td className="px-4 py-3">
                {task.dueDate ? (
                  <span className="text-sm text-foreground-secondary">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="text-sm text-foreground-muted">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                {task.project && (
                  <Link
                    href={`/projects/${task.projectId}`}
                    className="text-sm text-foreground-muted hover:text-accent transition-colors"
                  >
                    {task.project.code}
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

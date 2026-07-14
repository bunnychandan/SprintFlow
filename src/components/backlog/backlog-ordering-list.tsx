"use client";

import { useState } from "react";
import { BacklogTaskCard } from "./backlog-task-card";
import type { BacklogTask } from "@/types/agile";

interface BacklogOrderingListProps {
  tasks: BacklogTask[];
  selected: Set<string>;
  onSelect: (id: string, checked: boolean) => void;
  onReorder: (taskId: string, targetIndex: number) => void;
  loading?: boolean;
}

export function BacklogOrderingList({ tasks, selected, onSelect, onReorder, loading }: BacklogOrderingListProps) {
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  if (loading) {
    return (
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
    );
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    if (draggedId !== targetTaskId) {
      const targetIndex = tasks.findIndex((t) => t.id === targetTaskId);
      if (targetIndex >= 0) {
        onReorder(draggedId, targetIndex);
      }
    }
    setDragOverId(null);
  };

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          onDragOver={(e) => { handleDragOver(e); setDragOverId(task.id); }}
          onDragLeave={() => setDragOverId(null)}
          className={dragOverId === task.id ? "border-t-2 border-accent" : ""}
        >
          <BacklogTaskCard
            task={task}
            selected={selected.has(task.id)}
            onSelect={onSelect}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        </div>
      ))}
    </div>
  );
}

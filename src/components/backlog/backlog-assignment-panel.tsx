"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, X } from "lucide-react";
import type { BacklogTask } from "@/types/agile";

interface BacklogAssignmentPanelProps {
  tasks: BacklogTask[];
  onClose: () => void;
}

export function BacklogAssignmentPanel({ tasks, onClose }: BacklogAssignmentPanelProps) {
  const [search, setSearch] = useState("");

  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Assign Tasks ({tasks.length})
        </h3>
        <button onClick={onClose} className="text-foreground-muted hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
        <Input
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="max-h-60 overflow-y-auto space-y-1">
        {filtered.map((task) => (
          <div key={task.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-surface-hover">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground truncate">{task.title}</p>
              <p className="text-xs text-foreground-muted capitalize">{task.type} &middot; {task.status.replace(/_/g, " ")}</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-foreground-secondary text-center py-4">No matching tasks</p>
        )}
      </div>
    </Card>
  );
}

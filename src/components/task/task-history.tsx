"use client";

import { History } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

interface HistoryEntry {
  id: string; field: string; oldValue: string | null; newValue: string | null; createdAt: string;
  user: { id: string; name: string | null; image: string | null };
}

interface TaskHistoryProps {
  history: HistoryEntry[];
}

const fieldLabels: Record<string, string> = {
  title: "Title",
  description: "Description",
  status: "Status",
  priority: "Priority",
  type: "Type",
  assigneeId: "Assignee",
  sprintId: "Sprint",
  storyPoints: "Story Points",
  dueDate: "Due Date",
  originalEstimate: "Original Estimate",
  timeRemaining: "Time Remaining",
  timeSpent: "Time Spent",
  labels: "Labels",
};

export function TaskHistory({ history }: TaskHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-foreground-muted">
        <History className="h-8 w-8 mb-2" />
        <p className="text-sm">No history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <History className="h-4 w-4 text-accent" />
        Activity History
      </h3>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {history.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3">
            <Avatar src={entry.user.image} name={entry.user.name ?? undefined} className="h-6 w-6 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground">{entry.user.name}</span>
                <span className="text-[10px] text-foreground-muted">
                  {new Date(entry.createdAt).toLocaleDateString()} {new Date(entry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="text-xs text-foreground-secondary mt-0.5">
                changed <span className="font-medium">{fieldLabels[entry.field] || entry.field}</span>
                {entry.oldValue !== null && entry.newValue !== null ? (
                  <> from &ldquo;<span className="line-through">{entry.oldValue}</span>&rdquo; to &ldquo;<span className="font-medium">{entry.newValue}</span>&rdquo;</>
                ) : entry.oldValue === null && entry.newValue !== null ? (
                  <> to &ldquo;{entry.newValue}&rdquo;</>
                ) : (
                  <> from &ldquo;{entry.oldValue}&rdquo;</>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

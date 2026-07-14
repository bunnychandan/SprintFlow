"use client";

import { useState } from "react";
import { Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/contexts/toast-context";

interface WorkLogEntry {
  id: string; userId: string; description: string | null; timeSpent: number; loggedAt: string; createdAt: string;
  user: { id: string; name: string | null; image: string | null };
}

interface TaskWorkLogProps {
  workLogs: WorkLogEntry[];
  onLogWork: (data: { timeSpent: number; description?: string; loggedAt?: string }) => Promise<any>;
}

export function TaskWorkLog({ workLogs, onLogWork }: TaskWorkLogProps) {
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [timeSpent, setTimeSpent] = useState("");
  const [description, setDescription] = useState("");

  const totalLogged = workLogs.reduce((sum, w) => sum + w.timeSpent, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const minutes = parseInt(timeSpent, 10);
    if (!minutes || minutes < 1) return;

    try {
      await onLogWork({ timeSpent: minutes, description: description || undefined });
      addToast({ message: "Work logged", type: "success" });
      setTimeSpent("");
      setDescription("");
      setShowForm(false);
    } catch {
      addToast({ message: "Failed to log work", type: "error" });
    }
  };

  if (workLogs.length === 0 && !showForm) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-foreground-muted gap-3">
        <Clock className="h-8 w-8" />
        <p className="text-sm">No work logged yet</p>
        <Button variant="secondary" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" /> Log Work
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Clock className="h-4 w-4 text-accent" />
          Time Logged
        </h3>
        {!showForm && (
          <Button variant="secondary" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> Log Work
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-surface p-4 space-y-3">
          <Input
            label="Time Spent (minutes)"
            type="number"
            value={timeSpent}
            onChange={(e) => setTimeSpent(e.target.value)}
            placeholder="e.g. 120"
            min={1}
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What did you work on?"
            rows={2}
          />
          <div className="flex gap-2">
            <Button type="submit" variant="primary" size="sm" disabled={!timeSpent || parseInt(timeSpent) < 1}>
              Log Time
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="text-xs text-foreground-muted mb-2">
        Total: {Math.floor(totalLogged / 60)}h {totalLogged % 60}m logged
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {workLogs.map((log) => (
          <div key={log.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
            <Avatar src={log.user.image} name={log.user.name ?? undefined} className="h-6 w-6" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground">{log.user.name}</span>
                <span className="text-[10px] text-foreground-muted">
                  {new Date(log.loggedAt).toLocaleDateString()}
                </span>
              </div>
              {log.description && (
                <p className="text-xs text-foreground-secondary mt-0.5">{log.description}</p>
              )}
            </div>
            <span className="text-xs font-medium text-foreground whitespace-nowrap">
              {Math.floor(log.timeSpent / 60)}h {log.timeSpent % 60}m
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

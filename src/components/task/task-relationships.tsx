"use client";

import { useState } from "react";
import Link from "next/link";
import { Share2, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { TaskStatusBadge } from "./task-status-badge";
import { useToast } from "@/contexts/toast-context";

interface Relationship {
  id: string; type: string;
  relatedTask: { id: string; title: string; status: string; type: string };
}

interface RelatedFrom {
  id: string; type: string;
  task: { id: string; title: string; status: string; type: string };
}

interface TaskRelationshipsProps {
  relationships: Relationship[];
  relatedFrom: RelatedFrom[];
  onAdd: (relatedTaskId: string, type: string) => Promise<any>;
  onDelete: (relationshipId: string) => Promise<void>;
}

const RELATIONSHIP_TYPES = [
  { value: "BLOCKS", label: "Blocks" },
  { value: "BLOCKED_BY", label: "Blocked By" },
  { value: "PARENT", label: "Parent" },
  { value: "CHILD", label: "Child" },
  { value: "DUPLICATE", label: "Duplicates" },
  { value: "RELATED", label: "Related" },
  { value: "DEPENDS_ON", label: "Depends On" },
];

export function TaskRelationships({ relationships, relatedFrom, onAdd, onDelete }: TaskRelationshipsProps) {
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [relatedTaskId, setRelatedTaskId] = useState("");
  const [type, setType] = useState("RELATED");

  const handleAdd = async () => {
    if (!relatedTaskId.trim()) return;
    try {
      await onAdd(relatedTaskId.trim(), type);
      addToast({ message: "Relationship added", type: "success" });
      setRelatedTaskId("");
      setType("RELATED");
      setShowForm(false);
    } catch {
      addToast({ message: "Failed to add relationship", type: "error" });
    }
  };

  const allRelationships = [
    ...relationships.map((r) => ({ id: r.id, type: r.type, task: r.relatedTask, direction: "outgoing" as const })),
    ...relatedFrom.map((r) => ({ id: r.id, type: r.type, task: r.task, direction: "incoming" as const })),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Share2 className="h-4 w-4 text-accent" />
          Relationships
        </h3>
        {!showForm && (
          <Button variant="secondary" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        )}
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
          <input
            type="text"
            value={relatedTaskId}
            onChange={(e) => setRelatedTaskId(e.target.value)}
            placeholder="Related task ID..."
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
          />
          <Select value={type} onChange={(e) => setType(e.target.value)} options={RELATIONSHIP_TYPES} />
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleAdd} disabled={!relatedTaskId.trim()}>
              Add
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {allRelationships.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-8 text-foreground-muted">
          <Share2 className="h-8 w-8 mb-2" />
          <p className="text-sm">No relationships yet</p>
        </div>
      )}

      <div className="space-y-2">
        {allRelationships.map((rel) => (
          <div key={rel.id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className={cn(
                "text-[10px] font-medium uppercase px-1.5 py-0.5 rounded",
                rel.direction === "outgoing" ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"
              )}>
                {rel.type.replace(/_/g, " ")}
              </span>
              <Link href={`/tasks/${rel.task.id}`} className="text-sm font-medium text-foreground hover:text-accent transition-colors truncate">
                {rel.task.title}
              </Link>
              <TaskStatusBadge status={rel.task.status} />
            </div>
            <button onClick={() => onDelete(rel.id)} className="shrink-0 text-foreground-muted hover:text-destructive transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

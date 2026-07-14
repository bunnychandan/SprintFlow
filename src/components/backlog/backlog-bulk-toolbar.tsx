"use client";

import { X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

interface BacklogBulkToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  sprints?: Array<{ id: string; name: string }>;
  epics?: Array<{ id: string; title: string }>;
  releases?: Array<{ id: string; name: string }>;
  onAssignSprint?: (sprintId: string) => void;
  onAssignEpic?: (epicId: string) => void;
  onAssignRelease?: (releaseId: string) => void;
  onBulkDelete?: () => void;
}

export function BacklogBulkToolbar({
  selectedCount, onClearSelection,
  sprints, epics, releases,
  onAssignSprint, onAssignEpic, onAssignRelease,
  onBulkDelete,
}: BacklogBulkToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-2.5 animate-in fade-in">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-accent">{selectedCount} selected</span>
        <button onClick={onClearSelection} className="text-foreground-muted hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="h-5 w-px bg-border" />

      <div className="flex items-center gap-2 flex-wrap">
        {sprints && onAssignSprint && (
          <Select
            value=""
            onChange={(e) => e.target.value && onAssignSprint(e.target.value)}
            options={[
              { value: "", label: "Assign Sprint..." },
              ...sprints.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />
        )}

        {epics && onAssignEpic && (
          <Select
            value=""
            onChange={(e) => e.target.value && onAssignEpic(e.target.value)}
            options={[
              { value: "", label: "Assign Epic..." },
              ...epics.map((e) => ({ value: e.id, label: e.title })),
            ]}
          />
        )}

        {releases && onAssignRelease && (
          <Select
            value=""
            onChange={(e) => e.target.value && onAssignRelease(e.target.value)}
            options={[
              { value: "", label: "Assign Release..." },
              ...releases.map((r) => ({ value: r.id, label: r.name })),
            ]}
          />
        )}

        {onBulkDelete && (
          <Button variant="danger" size="sm" onClick={onBulkDelete}>
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}

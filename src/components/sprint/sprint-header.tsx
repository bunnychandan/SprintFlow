"use client";

import { Play, CheckCircle2, XCircle, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SprintStatusBadge } from "./sprint-status-badge";
import type { SprintDetail } from "@/types/sprint";

interface SprintHeaderProps {
  sprint: SprintDetail;
  onStart?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
  onEdit?: () => void;
}

export function SprintHeader({ sprint, onStart, onComplete, onCancel, onEdit }: SprintHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{sprint.name}</h1>
          <p className="text-sm text-foreground-secondary mt-1">{sprint.project.name} &middot; {sprint.project.code}</p>
        </div>
        <SprintStatusBadge status={sprint.status} />
      </div>

      <div className="flex items-center gap-2">
        {sprint.status === "PLANNING" && onStart && (
          <Button variant="gradient" size="sm" leftIcon={<Play className="h-4 w-4" />} onClick={onStart}>
            Start Sprint
          </Button>
        )}
        {sprint.status === "PLANNING" && onEdit && (
          <Button variant="outline" size="sm" leftIcon={<Edit3 className="h-4 w-4" />} onClick={onEdit}>
            Edit
          </Button>
        )}
        {sprint.status === "ACTIVE" && onComplete && (
          <Button variant="gradient" size="sm" leftIcon={<CheckCircle2 className="h-4 w-4" />} onClick={onComplete}>
            Complete
          </Button>
        )}
        {(sprint.status === "PLANNING" || sprint.status === "ACTIVE") && onCancel && (
          <Button variant="danger" size="sm" leftIcon={<XCircle className="h-4 w-4" />} onClick={onCancel}>
            Cancel Sprint
          </Button>
        )}
      </div>
    </div>
  );
}

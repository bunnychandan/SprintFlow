"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface PipelineRunDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pipelineName: string;
  loading?: boolean;
}

export function PipelineRunDialog({ isOpen, onClose, onConfirm, pipelineName, loading }: PipelineRunDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Run Pipeline" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-foreground-secondary">Are you sure you want to run <strong className="text-foreground">{pipelineName}</strong>?</p>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="gradient" size="sm" leftIcon={<Play className="h-4 w-4" />} onClick={onConfirm} isLoading={loading}>
            Run
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

"use client";

import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, RotateCcw } from "lucide-react";
import type { DocumentVersionItem } from "@/types/documentation";

interface DocumentVersionHistoryProps {
  versions: DocumentVersionItem[];
  loading?: boolean;
  onRestore?: (version: number) => void;
  className?: string;
}

export function DocumentVersionHistory({ versions, loading, onRestore, className }: DocumentVersionHistoryProps) {
  if (loading) {
    return <Card className={cn("p-5", className)}><div className="animate-pulse h-32 rounded bg-surface-hover" /></Card>;
  }

  return (
    <Card className={cn("p-5", className)}>
      <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Version History</h4>
      {!versions || versions.length === 0 ? (
        <p className="text-sm text-foreground-muted text-center py-4">No versions</p>
      ) : (
        <div className="space-y-3">
          {versions.map((v) => (
            <div key={v.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-light/30">
                  <Clock className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">v{v.version} - {v.title}</p>
                  <p className="text-xs text-foreground-muted">{v.createdByName} · {new Date(v.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              {onRestore && (
                <Button variant="ghost" size="sm" onClick={() => onRestore(v.version)} leftIcon={<RotateCcw className="h-3.5 w-3.5" />}>
                  Restore
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

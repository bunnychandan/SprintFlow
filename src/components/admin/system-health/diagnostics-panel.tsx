"use client";

import { Card, Badge, Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw } from "lucide-react";
import type { DiagnosticsResult } from "@/types/admin";

interface DiagnosticsPanelProps {
  result: DiagnosticsResult | null;
  running: boolean;
  onRun: () => void;
  className?: string;
}

export function DiagnosticsPanel({ result, running, onRun, className }: DiagnosticsPanelProps) {
  return (
    <Card className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Diagnostics</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onRun}
          isLoading={running}
          leftIcon={!running ? <RefreshCw className="h-4 w-4" /> : undefined}
        >
          {running ? "Running..." : "Run Diagnostics"}
        </Button>
      </div>

      {!result && !running && (
        <div className="py-8 text-center text-sm text-foreground-muted">
          Click "Run Diagnostics" to check system health
        </div>
      )}

      {running && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-xl bg-surface-hover/50">
              <div className="h-5 w-5 rounded-full bg-surface-hover" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-40 bg-surface-hover rounded" />
                <div className="h-3 w-64 bg-surface-hover rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {result && !running && (
        <>
          <div className="flex items-center gap-3">
            <Badge variant="success" size="md">{result.summary.pass} Passed</Badge>
            {result.summary.fail > 0 && <Badge variant="danger" size="md">{result.summary.fail} Failed</Badge>}
            {result.summary.warning > 0 && <Badge variant="warning" size="md">{result.summary.warning} Warnings</Badge>}
            <span className="text-xs text-foreground-muted ml-auto">
              {new Date(result.timestamp).toLocaleTimeString()}
            </span>
          </div>

          <div className="space-y-2">
            {result.checks.map((check, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border transition-colors",
                  check.status === "PASS" && "border-success/20 bg-success/5",
                  check.status === "FAIL" && "border-destructive/20 bg-destructive/5",
                  check.status === "WARNING" && "border-warning/20 bg-warning/5",
                )}
              >
                {check.status === "PASS" ? (
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                ) : check.status === "FAIL" ? (
                  <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{check.name}</p>
                  <p className="text-xs text-foreground-secondary mt-0.5">{check.message}</p>
                  {check.details && (
                    <p className="text-[11px] text-foreground-muted mt-1 font-mono">{check.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

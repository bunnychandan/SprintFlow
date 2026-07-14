"use client";

import { Target, Clock, Zap } from "lucide-react";

interface SprintProgressWidgetProps {
  name: string;
  totalPoints: number;
  completedPoints: number;
  completionPct: number;
  daysRemaining: number | null;
  velocity: number;
}

export function SprintProgressWidget({
  name,
  totalPoints,
  completedPoints,
  completionPct,
  daysRemaining,
  velocity,
}: SprintProgressWidgetProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">{name}</h3>
        </div>
        <span className="text-xs text-foreground-muted">{completedPoints}/{totalPoints} SP</span>
      </div>

      <div className="space-y-1">
        <div className="h-2.5 w-full rounded-full bg-surface-hover overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 transition-all duration-500"
            style={{ width: `${Math.min(completionPct, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-foreground-muted">
          <span>{completionPct}% complete</span>
          {daysRemaining != null && <span>{daysRemaining} day{daysRemaining !== 1 ? "s" : ""} left</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-yellow-500" />
          <div>
            <p className="text-[10px] text-foreground-muted">Velocity</p>
            <p className="text-sm font-semibold text-foreground">{velocity} SP</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-foreground-muted" />
          <div>
            <p className="text-[10px] text-foreground-muted">Days Remaining</p>
            <p className="text-sm font-semibold text-foreground">{daysRemaining ?? "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

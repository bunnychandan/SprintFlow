"use client";

import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import { CalendarDays, Clock } from "lucide-react";

interface SprintProgressProps {
  startDate: string | null;
  endDate: string | null;
  completionPercentage: number;
  remainingDays: number;
  totalDays: number;
  elapsedDays: number;
  className?: string;
}

export function SprintProgress({
  startDate, endDate, completionPercentage,
  remainingDays, totalDays, elapsedDays,
  className,
}: SprintProgressProps) {
  const timeProgress = totalDays > 0 ? Math.min(100, Math.round((elapsedDays / totalDays) * 100)) : 0;

  return (
    <Card className={cn("p-5", className)}>
      <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Progress</h4>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-foreground-secondary">Task Completion</span>
            <span className="font-semibold text-foreground">{completionPercentage}%</span>
          </div>
          <div className="h-3 rounded-full bg-surface-hover overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(completionPercentage, 100)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-foreground-secondary">Time Elapsed</span>
            <span className="font-semibold text-foreground">{timeProgress}%</span>
          </div>
          <div className="h-3 rounded-full bg-surface-hover overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                timeProgress > 100 ? "bg-red-500" : "bg-blue-500"
              )}
              style={{ width: `${Math.min(timeProgress, 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{remainingDays}</p>
            <p className="text-xs text-foreground-secondary flex items-center justify-center gap-1 mt-1">
              <Clock className="h-3 w-3" /> Remaining
            </p>
          </div>
          <div className="text-center border-x border-border">
            <p className="text-2xl font-bold text-foreground">{elapsedDays}</p>
            <p className="text-xs text-foreground-secondary flex items-center justify-center gap-1 mt-1">
              <CalendarDays className="h-3 w-3" /> Elapsed
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{totalDays}</p>
            <p className="text-xs text-foreground-secondary flex items-center justify-center gap-1 mt-1">
              <CalendarDays className="h-3 w-3" /> Total
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

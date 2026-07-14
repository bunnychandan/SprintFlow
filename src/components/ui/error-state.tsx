"use client";

import { cn } from "@/lib/cn";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center",
        className
      )}
    >
      <div className="text-destructive mb-4">
        <AlertTriangle className="h-12 w-12" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-foreground-secondary max-w-sm">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          className="mt-6"
          onClick={onRetry}
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          Try Again
        </Button>
      )}
    </div>
  );
}

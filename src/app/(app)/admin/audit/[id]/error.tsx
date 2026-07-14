"use client";

import { ErrorState } from "@/components/ui";

export default function AuditDetailError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <ErrorState title="Failed to load audit event" message={error.message} onRetry={reset} />
    </div>
  );
}

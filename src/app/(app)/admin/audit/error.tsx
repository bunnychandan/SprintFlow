"use client";

import { ErrorState } from "@/components/ui";

export default function AuditError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <ErrorState title="Audit Log Error" message={error.message} onRetry={reset} />
    </div>
  );
}

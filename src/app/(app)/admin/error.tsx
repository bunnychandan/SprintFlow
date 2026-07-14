"use client";

import { ErrorState } from "@/components/ui";

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <ErrorState
        title="Admin Error"
        message={error.message || "Something went wrong in the admin area."}
        onRetry={reset}
      />
    </div>
  );
}

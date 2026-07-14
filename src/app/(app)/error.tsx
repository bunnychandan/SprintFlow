"use client";

import { ErrorState } from "@/components/ui";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <ErrorState
        title="Something went wrong"
        message={error.message || "An unexpected error occurred in this section."}
        onRetry={reset}
      />
    </main>
  );
}

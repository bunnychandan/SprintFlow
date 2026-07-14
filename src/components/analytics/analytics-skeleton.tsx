"use client";

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-border bg-surface p-5">
            <div className="h-4 w-24 rounded bg-surface-hover" />
            <div className="mt-2 h-8 w-16 rounded bg-surface-hover" />
          </div>
        ))}
      </div>
      <div className="animate-pulse rounded-2xl border border-border bg-surface p-6">
        <div className="h-4 w-32 rounded bg-surface-hover mb-4" />
        <div className="h-48 rounded bg-surface-hover" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-border bg-surface p-6">
            <div className="h-4 w-32 rounded bg-surface-hover mb-4" />
            <div className="h-32 rounded bg-surface-hover" />
          </div>
        ))}
      </div>
    </div>
  );
}

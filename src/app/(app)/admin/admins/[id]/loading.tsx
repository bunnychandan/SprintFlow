import SectionHeader from "@/components/admin/section-header";
import { Card } from "@/components/ui";

export default function Loading() {
  return (
    <div>
      <SectionHeader
        title="Loading..."
        description="Fetching admin profile"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Admins", href: "/admin/admins" },
          { label: "Loading..." },
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface p-4 animate-pulse">
            <div className="h-8 w-24 bg-foreground-muted/20 rounded" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card variant="glass" className="p-6 animate-pulse">
            <div className="h-6 w-48 bg-foreground-muted/20 rounded mb-4" />
            <div className="space-y-3">
              <div className="h-4 w-full bg-foreground-muted/20 rounded" />
              <div className="h-4 w-3/4 bg-foreground-muted/20 rounded" />
              <div className="h-4 w-1/2 bg-foreground-muted/20 rounded" />
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card variant="glass" className="p-6 animate-pulse">
            <div className="h-6 w-36 bg-foreground-muted/20 rounded mb-4" />
            <div className="space-y-2">
              <div className="h-12 w-full bg-foreground-muted/20 rounded" />
              <div className="h-12 w-full bg-foreground-muted/20 rounded" />
              <div className="h-12 w-full bg-foreground-muted/20 rounded" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

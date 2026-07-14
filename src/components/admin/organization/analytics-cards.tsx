import { Users, Shield, LayoutGrid, Mail, ScrollText, Calendar, Clock, Flag } from "lucide-react";

interface AnalyticsCardsProps {
  totalUsers: number;
  activeUsers: number;
  totalAdmins: number;
  totalProjects: number;
  totalInvitations: number;
  totalAuditEvents: number;
  orgAgeDays: number;
  totalFeatureFlags: number;
}

export function AnalyticsCards({
  totalUsers, activeUsers, totalAdmins, totalProjects,
  totalInvitations, totalAuditEvents, orgAgeDays, totalFeatureFlags,
}: AnalyticsCardsProps) {
  const cards = [
    { label: "Total Users", value: totalUsers.toLocaleString(), icon: Users, color: "text-accent", bg: "bg-accent-light" },
    { label: "Active Users", value: activeUsers.toLocaleString(), icon: Users, color: "text-success", bg: "bg-success/10" },
    { label: "Total Admins", value: totalAdmins, icon: Shield, color: "text-warning", bg: "bg-warning/10" },
    { label: "Projects", value: totalProjects.toLocaleString(), icon: LayoutGrid, color: "text-accent", bg: "bg-accent-light" },
    { label: "Invitations", value: totalInvitations.toLocaleString(), icon: Mail, color: "text-accent", bg: "bg-accent-light" },
    { label: "Audit Events", value: totalAuditEvents.toLocaleString(), icon: ScrollText, color: "text-foreground", bg: "bg-foreground-muted/10" },
    { label: "Organization Age", value: `${orgAgeDays} days`, icon: Clock, color: "text-accent", bg: "bg-accent-light" },
    { label: "Feature Flags", value: totalFeatureFlags, icon: Flag, color: "text-accent", bg: "bg-accent-light" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-border bg-surface p-4 flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bg} ${card.color}`}>
            <card.icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-foreground-secondary">{card.label}</p>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

import { ScrollText, Activity, AlertTriangle, TrendingUp, Shield } from "lucide-react";

interface AuditCardsProps {
  totalEvents: number;
  eventsToday: number;
  eventsThisWeek: number;
  failedOperations: number;
  activeAdmins: number;
}

export function AuditCards({ totalEvents, eventsToday, eventsThisWeek, failedOperations, activeAdmins }: AuditCardsProps) {
  const cards = [
    {
      label: "Total Events",
      value: totalEvents.toLocaleString(),
      icon: ScrollText,
      color: "text-accent",
      bg: "bg-accent-light",
    },
    {
      label: "Today",
      value: eventsToday.toLocaleString(),
      icon: Activity,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "This Week",
      value: eventsThisWeek.toLocaleString(),
      icon: TrendingUp,
      color: "text-accent",
      bg: "bg-accent-light",
    },
    {
      label: "Failed Operations",
      value: failedOperations.toLocaleString(),
      icon: AlertTriangle,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      label: "Active Admins",
      value: activeAdmins,
      icon: Shield,
      color: "text-warning",
      bg: "bg-warning/10",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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

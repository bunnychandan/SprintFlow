interface Stat {
  label: string;
  value: number;
  icon: React.ReactNode;
}

interface AdminStatsCardsProps {
  stats: Stat[];
}

export default function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-border bg-surface p-4 flex items-center gap-4"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-light text-accent">
            {stat.icon}
          </div>
          <div>
            <p className="text-sm text-foreground-secondary">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

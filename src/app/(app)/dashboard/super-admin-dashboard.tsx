import { prisma } from "@/lib/prisma";
import {
  Users,
  Briefcase,
  ListChecks,
  Target,
  ShieldAlert,
  Activity,
  CheckCircle2,
  UserCheck,
  Server,
} from "lucide-react";
import { PageHeader, StatCard, Badge, TypeBadge } from "@/components/ui";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface SuperAdminDashboardProps {
  user: { id: string; name: string | null; email: string; role: string };
}

export default async function SuperAdminDashboard({
  user,
}: SuperAdminDashboardProps) {
  const [
    totalUsers,
    activeUsers,
    totalProjects,
    totalTasks,
    openTasks,
    completedTasks,
    totalSprints,
    activeSprints,
    recentLogs,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.project.count(),
    prisma.task.count(),
    prisma.task.count({ where: { NOT: { status: "DONE" } } }),
    prisma.task.count({ where: { status: "DONE" } }),
    prisma.sprint.count(),
    prisma.sprint.count({ where: { status: "ACTIVE" } }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { actor: { select: { name: true, image: true } } },
    }),
    prisma.user.findMany({
      orderBy: { lastLoginAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, role: true, image: true, isActive: true },
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8 overflow-y-auto">
      <PageHeader
        title={`Welcome, ${user.name ?? "Super Admin"}`}
        subtitle="Full platform oversight. Manage users, projects, and monitor system health."
        metadata="Super Admin Console"
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={totalUsers}
          icon={<Users className="h-8 w-8" />}
        />
        <StatCard
          label="Active Users"
          value={activeUsers}
          icon={<UserCheck className="h-8 w-8" />}
        />
        <StatCard
          label="Active Projects"
          value={totalProjects}
          icon={<Briefcase className="h-8 w-8" />}
        />
        <StatCard
          label="Active Sprints"
          value={activeSprints}
          icon={<Target className="h-8 w-8" />}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <Card variant="glass">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Server className="h-5 w-5 text-accent" />
              Platform Overview
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-surface p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{totalTasks}</p>
                <p className="text-xs text-foreground-muted mt-1">Total Tasks</p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{openTasks}</p>
                <p className="text-xs text-foreground-muted mt-1">Open Tasks</p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-4 text-center">
                <p className="text-2xl font-bold text-success">{completedTasks}</p>
                <p className="text-xs text-foreground-muted mt-1">Completed</p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{totalSprints}</p>
                <p className="text-xs text-foreground-muted mt-1">Total Sprints</p>
              </div>
            </div>
          </Card>

          <Card variant="glass">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              System Audit Trail
            </h2>
            <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl border border-border bg-surface p-3 text-xs"
                >
                  <div className="flex items-center justify-between text-foreground-muted">
                    <span className="font-semibold text-foreground-secondary">
                      {log.actor?.name || "System"}
                    </span>
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-1 text-foreground-secondary">{log.details || log.action}</p>
                </div>
              ))}
              {recentLogs.length === 0 && (
                <p className="text-foreground-muted text-xs italic text-center py-4">
                  No audit logs yet.
                </p>
              )}
            </div>
          </Card>
        </section>

        <aside className="space-y-6">
          <Card variant="glass">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              Recent Users
            </h2>
            <div className="mt-4 space-y-3">
              {recentUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-sky-500 text-xs font-semibold text-slate-950 shrink-0">
                      {u.name?.slice(0, 2).toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {u.name || "Unnamed"}
                      </p>
                      <p className="text-[10px] text-foreground-muted truncate">
                        {u.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={
                        u.role === "SUPER_ADMIN"
                          ? "danger"
                          : u.role === "ADMIN"
                          ? "warning"
                          : "neutral"
                      }
                      size="sm"
                    >
                      {u.role}
                    </Badge>
                    {!u.isActive && (
                      <Badge variant="danger" size="sm">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card variant="gradient">
            <h2 className="text-lg font-semibold text-accent">
              Quick Actions
            </h2>
            <div className="mt-4 space-y-3">
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-xl border border-accent/20 bg-accent-light p-3 text-sm text-foreground hover:bg-accent/20 transition-colors"
              >
                <ShieldAlert className="h-5 w-5 text-accent" />
                <span>Manage Users & Roles</span>
              </Link>
              <Link
                href="/projects"
                className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 text-sm text-foreground hover:bg-surface-hover transition-colors"
              >
                <Briefcase className="h-5 w-5 text-accent" />
                <span>View All Projects</span>
              </Link>
              <Link
                href="/api/health"
                className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 text-sm text-foreground hover:bg-surface-hover transition-colors"
              >
                <Activity className="h-5 w-5 text-accent" />
                <span>System Health</span>
              </Link>
            </div>
          </Card>
        </aside>
      </div>
    </main>
  );
}

import { prisma } from "@/lib/prisma";
import {
  Briefcase,
  ListChecks,
  Target,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { PageHeader, StatCard, StatusBadge, TypeBadge } from "@/components/ui";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface UserDashboardProps {
  user: { id: string; name: string | null; email: string; role: string };
}

export default async function UserDashboard({ user }: UserDashboardProps) {
  const userProjects = await prisma.project.findMany({
    where: { members: { some: { userId: user.id } } },
    include: { members: true, tasks: true, sprints: true },
    orderBy: { createdAt: "desc" },
  });

  const myProjectIds = userProjects.map((p) => p.id);

  const [myOpenTasks, completedTasksCount, activeSprints, notifications] = await Promise.all([
    prisma.task.findMany({
      where: { assigneeId: user.id, NOT: { status: "DONE" } },
      include: { project: true },
      orderBy: { priority: "desc" },
    }),
    prisma.task.count({ where: { assigneeId: user.id, status: "DONE" } }),
    prisma.sprint.findMany({
      where: { projectId: { in: myProjectIds }, status: "ACTIVE" },
      include: { project: true, tasks: true },
    }),
    prisma.notification.findMany({
      where: { recipientId: user.id, readAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8 overflow-y-auto">
      <PageHeader
        title={`Welcome, ${user.name ?? "User"}`}
        subtitle="Track your tasks, sprint progress, and project activity."
        metadata="My Dashboard"
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="My Projects"
          value={userProjects.length}
          icon={<Briefcase className="h-8 w-8" />}
        />
        <StatCard
          label="Open Tasks"
          value={myOpenTasks.length}
          icon={<ListChecks className="h-8 w-8" />}
        />
        <StatCard
          label="Completed"
          value={completedTasksCount}
          icon={<CheckCircle2 className="h-8 w-8" />}
        />
        <StatCard
          label="Active Sprints"
          value={activeSprints.length}
          icon={<Target className="h-8 w-8" />}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <Card variant="glass">
            <h2 className="text-lg font-semibold text-foreground">
              My Open Tasks
            </h2>
            <div className="mt-4 divide-y divide-border border border-border rounded-xl bg-surface overflow-hidden">
              {myOpenTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/projects/${task.projectId}`}
                  className="px-4 py-3 hover:bg-surface-hover flex items-center justify-between gap-3 text-xs transition-colors"
                >
                  <div className="flex items-center gap-2 overflow-hidden min-w-0">
                    <TypeBadge type={task.type || "TASK"} />
                    <span className="font-semibold text-accent shrink-0">
                      {task.project.code}-
                      {task.id.slice(-4).toUpperCase()}
                    </span>
                    <span className="text-foreground truncate">
                      {task.title}
                    </span>
                  </div>
                  <StatusBadge status={task.status} />
                </Link>
              ))}
              {myOpenTasks.length === 0 && (
                <p className="text-foreground-muted text-xs italic text-center py-6">
                  No pending tasks. Great work!
                </p>
              )}
            </div>
          </Card>

          <Card variant="glass">
            <h2 className="text-lg font-semibold text-foreground">
              Sprint Progress
            </h2>
            <div className="mt-4 space-y-4">
              {activeSprints.map((sprint) => {
                const total = sprint.tasks.length;
                const completed = sprint.tasks.filter(
                  (t) => t.status === "DONE"
                ).length;
                const pct = total
                  ? Math.round((completed / total) * 100)
                  : 0;

                return (
                  <div
                    key={sprint.id}
                    className="rounded-xl border border-border bg-surface p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">
                          {sprint.name}
                        </h3>
                        <p className="text-[10px] text-accent font-semibold">
                          {sprint.project.name}
                        </p>
                      </div>
                      <span className="text-[10px] text-foreground-secondary">
                        {completed}/{total} done
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-surface-hover overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-sky-500 transition-all duration-300 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {activeSprints.length === 0 && (
                <p className="text-foreground-muted text-xs italic text-center py-4">
                  No active sprints in your projects.
                </p>
              )}
            </div>
          </Card>
        </section>

        <aside className="space-y-6">
          <Card variant="glass">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              Notifications
              {notifications.length > 0 && (
                <span className="ml-auto rounded-full bg-destructive/10 text-destructive text-[10px] font-bold px-2 py-0.5">
                  {notifications.length}
                </span>
              )}
            </h2>
            <div className="mt-4 space-y-2">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="rounded-xl border border-border bg-surface p-3 text-xs"
                >
                  <p className="font-semibold text-foreground">{n.title}</p>
                  <p className="text-foreground-muted mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-foreground-muted mt-1">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-foreground-muted text-xs italic text-center py-4">
                  No new notifications.
                </p>
              )}
            </div>
          </Card>

          <Card variant="glass">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-accent" />
              My Projects
            </h2>
            <div className="mt-4 space-y-2">
              {userProjects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface p-3 text-xs hover:bg-surface-hover transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-accent">{p.code}</span>
                    <span className="text-foreground truncate">{p.name}</span>
                  </div>
                  <span className="text-foreground-muted shrink-0">
                    {p.tasks.filter((t) => t.status !== "DONE").length} open
                  </span>
                </Link>
              ))}
              {userProjects.length === 0 && (
                <p className="text-foreground-muted text-xs italic text-center py-4">
                  You are not assigned to any projects.
                </p>
              )}
            </div>
          </Card>
        </aside>
      </div>
    </main>
  );
}

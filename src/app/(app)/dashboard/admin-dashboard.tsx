import { prisma } from "@/lib/prisma";
import {
  Briefcase,
  ListChecks,
  Target,
  CheckCircle2,
  Users,
  FolderKanban,
  Plus,
} from "lucide-react";
import { PageHeader, StatCard, Badge, StatusBadge, TypeBadge } from "@/components/ui";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface AdminDashboardProps {
  user: { id: string; name: string | null; email: string; role: string };
}

export default async function AdminDashboard({ user }: AdminDashboardProps) {
  const [totalProjects, projects, _openTasks, completedTasks, activeSprints, myOpenTasks] =
    await Promise.all([
      prisma.project.count(),
      prisma.project.findMany({
        include: { members: true, tasks: true, sprints: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.task.count({
        where: {
          project: { members: { some: { userId: user.id } } },
          NOT: { status: "DONE" },
        },
      }),
      prisma.task.count({
        where: {
          project: { members: { some: { userId: user.id } } },
          status: "DONE",
        },
      }),
      prisma.sprint.findMany({
        where: {
          project: { members: { some: { userId: user.id } } },
          status: "ACTIVE",
        },
        include: { project: true, tasks: true },
      }),
      prisma.task.findMany({
        where: { assigneeId: user.id, NOT: { status: "DONE" } },
        include: { project: true },
        orderBy: { priority: "desc" },
      }),
    ]);

  const totalMembers = projects.reduce(
    (sum, p) => sum + p.members.length,
    0
  );

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8 overflow-y-auto">
      <PageHeader
        title={`Welcome, ${user.name ?? "Admin"}`}
        subtitle="Manage projects, sprints, tasks, and team members."
        metadata="Admin Dashboard"
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Projects"
          value={totalProjects}
          icon={<Briefcase className="h-8 w-8" />}
        />
        <StatCard
          label="Team Members"
          value={totalMembers}
          icon={<Users className="h-8 w-8" />}
        />
        <StatCard
          label="My Open Tasks"
          value={myOpenTasks.length}
          icon={<ListChecks className="h-8 w-8" />}
        />
        <StatCard
          label="Completed"
          value={completedTasks}
          icon={<CheckCircle2 className="h-8 w-8" />}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <Card variant="glass">
            <h2 className="text-lg font-semibold text-foreground">
              Active Sprints
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
                    {sprint.goal && (
                      <p className="mt-2 text-xs text-foreground-muted">
                        Goal: {sprint.goal}
                      </p>
                    )}
                  </div>
                );
              })}
              {activeSprints.length === 0 && (
                <p className="text-foreground-muted text-xs italic text-center py-4">
                  No active sprints.
                </p>
              )}
            </div>
          </Card>

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
                      {task.project.code}-{task.id.slice(-4).toUpperCase()}
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
                  You have no pending tasks assigned.
                </p>
              )}
            </div>
          </Card>
        </section>

        <aside className="space-y-6">
          <Card variant="glass">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-accent" />
              Project Quick View
            </h2>
            <div className="mt-4 space-y-2">
              {projects.slice(0, 5).map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface p-3 text-xs hover:bg-surface-hover transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="primary" size="sm">
                      {p.code}
                    </Badge>
                    <span className="text-foreground truncate">{p.name}</span>
                  </div>
                  <span className="text-foreground-muted shrink-0">
                    {p.members.length} members
                  </span>
                </Link>
              ))}
              <Link
                href="/projects"
                className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border p-3 text-xs text-accent hover:bg-surface-hover transition-colors mt-2"
              >
                <Plus className="h-3.5 w-3.5" />
                View All Projects
              </Link>
            </div>
          </Card>

          <Card variant="gradient">
            <h2 className="text-lg font-semibold text-accent">
              Management Summary
            </h2>
            <ul className="mt-4 space-y-3 text-xs text-foreground-secondary">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span>
                  {totalProjects} active projects across the organization
                </span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span>
                  {totalMembers} total team members across all projects
                </span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span>
                  {activeSprints.length} active{" "}
                  {activeSprints.length === 1 ? "sprint" : "sprints"} in
                  progress
                </span>
              </li>
            </ul>
          </Card>
        </aside>
      </div>
    </main>
  );
}

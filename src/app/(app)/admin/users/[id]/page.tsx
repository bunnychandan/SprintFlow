import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import SectionHeader from "@/components/admin/section-header";
import AdminStatsCards from "@/components/admin/admin-stats-cards";
import { Card, Badge, Avatar } from "@/components/ui";
import { Users, ListChecks, Target, Clock, Shield, Activity, ScrollText, Bell } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const [user, projects, assignedTasks, createdTasks, recentActivity, recentAuditLogs, notifications] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id },
        select: {
          id: true, name: true, email: true, image: true, role: true,
          isActive: true, department: true, designation: true,
          lastLoginAt: true, deletedAt: true, createdAt: true, updatedAt: true,
        },
      }),
      prisma.projectMember.findMany({
        where: { userId: id },
        include: { project: { select: { id: true, name: true, code: true, status: true } } },
      }),
      prisma.task.findMany({
        where: { assigneeId: id, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, title: true, status: true, priority: true, project: { select: { code: true } } },
      }),
      prisma.task.findMany({
        where: { reporterId: id, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, title: true, status: true, project: { select: { code: true } } },
      }),
      prisma.activityLog.findMany({
        where: { userId: id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.auditLog.findMany({
        where: { actorId: id },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { actor: { select: { name: true, image: true } } },
      }),
      prisma.notification.findMany({
        where: { recipientId: id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  if (!user) notFound();

  const sprintCount = await prisma.sprint.count({
    where: { tasks: { some: { assigneeId: id } } },
  });

  const taskCounts = await Promise.all([
    prisma.task.count({ where: { assigneeId: id, deletedAt: null } }),
    prisma.task.count({ where: { reporterId: id, deletedAt: null } }),
    prisma.task.count({ where: { assigneeId: id, deletedAt: null, status: "DONE" } }),
  ]);

  return (
    <div>
      <SectionHeader
        title={user.name || user.email}
        description={`User profile and activity overview`}
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Users", href: "/admin/users" },
          { label: user.name || user.email },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="rounded-xl border border-border bg-surface p-4 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-light text-accent">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-foreground-secondary">Projects</p>
            <p className="text-2xl font-bold text-foreground">{projects.length}</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-light text-accent">
            <ListChecks className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-foreground-secondary">Assigned Tasks</p>
            <p className="text-2xl font-bold text-foreground">{taskCounts[0]}</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-light text-accent">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-foreground-secondary">Sprints</p>
            <p className="text-2xl font-bold text-foreground">{sprintCount}</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-light text-accent">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-foreground-secondary">Last Login</p>
            <p className="text-lg font-bold text-foreground">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <Card variant="glass" className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Profile Information
            </h2>
            <div className="flex items-center gap-4 mb-6">
              <Avatar name={user.name || user.email} src={user.image || undefined} size="lg" />
              <div>
                <h3 className="text-xl font-bold text-foreground">{user.name || "Unnamed"}</h3>
                <p className="text-sm text-foreground-secondary">{user.email}</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-foreground-secondary">Department</dt>
                <dd className="text-foreground font-medium">{user.department || "—"}</dd>
              </div>
              <div>
                <dt className="text-foreground-secondary">Designation</dt>
                <dd className="text-foreground font-medium">{user.designation || "—"}</dd>
              </div>
              <div>
                <dt className="text-foreground-secondary">System Role</dt>
                <dd>
                  <Badge variant={user.role === "SUPER_ADMIN" ? "danger" : user.role === "ADMIN" ? "warning" : "neutral"} size="sm">
                    {user.role}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-foreground-secondary">Account Status</dt>
                <dd>
                  <Badge variant={user.deletedAt ? "danger" : user.isActive ? "success" : "danger"} size="sm">
                    {user.deletedAt ? "Deleted" : user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-foreground-secondary">Created</dt>
                <dd className="text-foreground">{new Date(user.createdAt).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-foreground-secondary">Last Updated</dt>
                <dd className="text-foreground">{new Date(user.updatedAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </Card>

          {projects.length > 0 && (
            <Card variant="glass" className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                Assigned Projects
              </h2>
              <div className="space-y-2">
                {projects.map((pm) => (
                  <Link key={pm.project.id} href={`/projects/${pm.project.id}`}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface p-3 text-sm hover:bg-surface-hover transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-accent">{pm.project.code}</span>
                      <span className="text-foreground">{pm.project.name}</span>
                    </div>
                    <Badge variant="primary" size="sm">{pm.roleInProject}</Badge>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {assignedTasks.length > 0 && (
            <Card variant="glass" className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-accent" />
                Assigned Tasks
              </h2>
              <div className="divide-y divide-border border border-border rounded-xl bg-surface overflow-hidden">
                {assignedTasks.map((task) => (
                  <div key={task.id} className="px-4 py-3 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-accent">{task.project.code}-{task.id.slice(-4).toUpperCase()}</span>
                      <span className="text-foreground">{task.title}</span>
                    </div>
                    <Badge variant={task.status === "DONE" ? "success" : "warning"} size="sm">{task.status}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </section>

        <aside className="space-y-6">
          {recentAuditLogs.length > 0 && (
            <Card variant="glass" className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <ScrollText className="h-5 w-5 text-accent" />
                Recent Activity
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentAuditLogs.map((log) => (
                  <div key={log.id} className="rounded-lg border border-border bg-surface p-3 text-xs">
                    <div className="flex items-center justify-between text-foreground-muted">
                      <span className="font-semibold text-foreground-secondary">{log.action}</span>
                      <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                    </div>
                    {log.details && <p className="mt-1 text-foreground-secondary">{log.details}</p>}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {notifications.length > 0 && (
            <Card variant="glass" className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-accent" />
                Recent Notifications
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="rounded-lg border border-border bg-surface p-3 text-xs">
                    <p className="font-semibold text-foreground">{n.title}</p>
                    <p className="text-foreground-muted mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-foreground-muted mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {recentActivity.length > 0 && (
            <Card variant="glass" className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-accent" />
                Activity Log
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentActivity.map((act: any) => (
                  <div key={act.id} className="rounded-lg border border-border bg-surface p-3 text-xs">
                    <p className="text-foreground">{act.action}</p>
                    {act.metadata && <p className="text-foreground-muted mt-0.5">{JSON.stringify(act.metadata)}</p>}
                    <p className="text-[10px] text-foreground-muted mt-1">{new Date(act.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}

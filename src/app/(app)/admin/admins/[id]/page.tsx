import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import SectionHeader from "@/components/admin/section-header";
import { Card, Badge, Avatar } from "@/components/ui";
import { ADMIN_PERMISSIONS } from "@/lib/constants";
import {
  Users, ListChecks, Target, Shield, Activity, ScrollText, Bell, CheckCircle2, Key,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminProfilePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, image: true, role: true,
      isActive: true, department: true, designation: true,
      lastLoginAt: true, deletedAt: true, createdAt: true, updatedAt: true,
      permissions: true,
    },
  });
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) notFound();

  const managedProjects: Array<{
    project: {
      id: string;
      name: string;
      code: string;
      status: string;
      _count: { members: number; tasks: number };
    };
  }> = await prisma.projectMember.findMany({
    where: { userId: id, roleInProject: "PROJECT_MANAGER" },
    include: { project: { select: { id: true, name: true, code: true, status: true, _count: { select: { members: true, tasks: true } } } } },
  });

  const managedProjectIds = managedProjects.map((mp) => mp.project.id);

  const [openTasks, completedTasks, recentAuditLogs, notifications, totalSprints, completedSprints] =
    await Promise.all([
      prisma.task.count({ where: { projectId: { in: managedProjectIds }, deletedAt: null, NOT: { status: "DONE" } } }),
      prisma.task.count({ where: { projectId: { in: managedProjectIds }, deletedAt: null, status: "DONE" } }),
      prisma.auditLog.findMany({
        where: { actorId: id },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { actor: { select: { name: true, image: true } } },
      }),
      prisma.notification.findMany({
        where: { recipientId: id, readAt: null },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.sprint.count({ where: { projectId: { in: managedProjectIds } } }),
      prisma.sprint.count({ where: { projectId: { in: managedProjectIds }, status: "COMPLETED" } }),
    ]);

  const permissions = (user.permissions as Record<string, boolean>) || {};

  return (
    <div>
      <SectionHeader
        title={user.name || user.email}
        description="Admin profile and performance overview"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Admins", href: "/admin/admins" },
          { label: user.name || user.email },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="rounded-xl border border-border bg-surface p-4 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-light text-accent">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-foreground-secondary">Projects Managed</p>
            <p className="text-2xl font-bold text-foreground">{managedProjects.length}</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-light text-accent">
            <ListChecks className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-foreground-secondary">Open Tasks</p>
            <p className="text-2xl font-bold text-foreground">{openTasks}</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-light text-accent">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-foreground-secondary">Completed Tasks</p>
            <p className="text-2xl font-bold text-foreground">{completedTasks}</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-light text-accent">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-foreground-secondary">Sprint Completion</p>
            <p className="text-2xl font-bold text-foreground">
              {totalSprints > 0 ? `${Math.round((completedSprints / totalSprints) * 100)}%` : "—"}
            </p>
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
                <dd><Badge variant={user.role === "SUPER_ADMIN" ? "danger" : "warning"} size="sm">{user.role}</Badge></dd>
              </div>
              <div>
                <dt className="text-foreground-secondary">Account Status</dt>
                <dd><Badge variant={user.deletedAt ? "danger" : user.isActive ? "success" : "danger"} size="sm">
                  {user.deletedAt ? "Deleted" : user.isActive ? "Active" : "Inactive"}
                </Badge></dd>
              </div>
              <div><dt className="text-foreground-secondary">Last Login</dt><dd className="text-foreground">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}</dd></div>
              <div><dt className="text-foreground-secondary">Created</dt><dd className="text-foreground">{new Date(user.createdAt).toLocaleDateString()}</dd></div>
            </dl>
          </Card>

          <Card variant="glass" className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Key className="h-5 w-5 text-accent" />
              Permissions
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {ADMIN_PERMISSIONS.map((p) => (
                <div key={p.key} className="flex items-center gap-2 text-sm">
                  <div className={`h-2 w-2 rounded-full ${permissions[p.key] ? "bg-success" : "bg-foreground-muted"}`} />
                  <span className={permissions[p.key] ? "text-foreground" : "text-foreground-muted"}>
                    {p.label}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {managedProjects.length > 0 && (
            <Card variant="glass" className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                Managed Projects ({managedProjects.length})
              </h2>
              <div className="space-y-2">
                {managedProjects.map((mp) => (
                  <div key={mp.project.id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-3 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-accent">{mp.project.code}</span>
                      <span className="text-foreground">{mp.project.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-foreground-secondary">
                      <span>{mp.project._count.members} members</span>
                      <span>{mp.project._count.tasks} tasks</span>
                      <Badge variant={mp.project.status === "ACTIVE" ? "success" : "neutral"} size="sm">{mp.project.status}</Badge>
                    </div>
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

          <Card variant="glass" className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              Performance Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Projects Managed</span>
                <span className="text-foreground font-medium">{managedProjects.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Open Tasks</span>
                <span className="text-foreground font-medium">{openTasks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Completed Tasks</span>
                <span className="text-foreground font-medium">{completedTasks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Total Sprints</span>
                <span className="text-foreground font-medium">{totalSprints}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Sprint Completion Rate</span>
                <span className="text-foreground font-medium">
                  {totalSprints > 0 ? `${Math.round((completedSprints / totalSprints) * 100)}%` : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Completion Rate</span>
                <span className="text-foreground font-medium">
                  {openTasks + completedTasks > 0
                    ? `${Math.round((completedTasks / (openTasks + completedTasks)) * 100)}%`
                    : "—"}
                </span>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

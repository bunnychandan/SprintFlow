import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Session } from "next-auth";

export interface RoleCheckResult {
  ok: boolean;
  status?: number;
  user?: { id: string; role: string };
  session?: Session | null;
  member?: { roleInProject: string } | null;
}

export function isSuperAdmin(role: string): boolean {
  return role === "SUPER_ADMIN";
}

export function isAdmin(role: string): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({ where: { id: session.user.id } });
}

export async function requireRole(allowed: string[]): Promise<RoleCheckResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, status: 401 };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });
  if (!user || !allowed.includes(user.role)) return { ok: false, status: 403 };

  return { ok: true, user, session };
}

export async function requireSuperAdmin(): Promise<RoleCheckResult> {
  return requireRole(["SUPER_ADMIN"]);
}

export async function requireAdmin(): Promise<RoleCheckResult> {
  return requireRole(["SUPER_ADMIN", "ADMIN"]);
}

export async function requireProjectAccess(
  projectId: string,
  allowedProjectRoles?: string[]
): Promise<RoleCheckResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, status: 401 };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });
  if (!user) return { ok: false, status: 403 };

  if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
    return { ok: true, user, session };
  }

  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId: user.id },
    },
  });

  if (!member) return { ok: false, status: 403 };

  if (allowedProjectRoles && !allowedProjectRoles.includes(member.roleInProject)) {
    return { ok: false, status: 403 };
  }

  return { ok: true, user, session, member };
}

export async function requireTaskAccess(
  taskId: string,
  allowedProjectRoles?: string[]
): Promise<RoleCheckResult & { task?: { projectId: string; reporterId: string; assigneeId: string | null } }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, status: 401 };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });
  if (!user) return { ok: false, status: 403 };

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { projectId: true, reporterId: true, assigneeId: true },
  });
  if (!task) return { ok: false, status: 404 };

  if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
    return { ok: true, user, session, task };
  }

  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: { projectId: task.projectId, userId: user.id },
    },
  });

  if (!member) return { ok: false, status: 403 };

  if (allowedProjectRoles && !allowedProjectRoles.includes(member.roleInProject)) {
    return { ok: false, status: 403 };
  }

  return { ok: true, user, session, member, task };
}

export const SYSTEM_ROLES = ["SUPER_ADMIN", "ADMIN", "USER"] as const;
export type SystemRole = (typeof SYSTEM_ROLES)[number];

export const PROJECT_ROLES = [
  "PROJECT_MANAGER",
  "SCRUM_MASTER",
  "DEVELOPER",
  "TESTER",
  "BUSINESS_ANALYST",
  "VIEWER",
] as const;
export type ProjectRole = (typeof PROJECT_ROLES)[number];

export const ALL_SYSTEM_ACCESS = ["SUPER_ADMIN", "ADMIN"] as const;
export const BACKLOG_MANAGER_ROLES = ["PROJECT_MANAGER", "SCRUM_MASTER"] as const;
export const TASK_CREATOR_ROLES = ["PROJECT_MANAGER", "SCRUM_MASTER", "DEVELOPER"] as const;

export const ADMIN_PERMISSIONS = [
  { key: "project:create", label: "Project Creation", description: "Create new projects", default: true },
  { key: "project:archive", label: "Project Archive", description: "Archive and delete projects", default: true },
  { key: "user:create", label: "User Creation", description: "Create platform users", default: true },
  { key: "invitation:manage", label: "Invitation Management", description: "Send and manage invitations", default: true },
  { key: "sprint:manage", label: "Sprint Management", description: "Manage sprint lifecycle", default: true },
  { key: "reporting", label: "Reporting", description: "Access reports and dashboards", default: true },
  { key: "exports", label: "Exports", description: "Export data (CSV, Excel)", default: false },
  { key: "settings", label: "Settings", description: "Modify platform settings", default: false },
  { key: "audit:access", label: "Audit Access", description: "View audit logs", default: false },
] as const;

export type AdminPermissionKey = (typeof ADMIN_PERMISSIONS)[number]["key"];

export function defaultAdminPermissions(): Record<string, boolean> {
  const perms: Record<string, boolean> = {};
  for (const p of ADMIN_PERMISSIONS) {
    perms[p.key] = p.default;
  }
  return perms;
}

export function hasPermission(
  permissions: Record<string, boolean> | null | undefined,
  permission: AdminPermissionKey,
): boolean {
  return permissions?.[permission] ?? false;
}

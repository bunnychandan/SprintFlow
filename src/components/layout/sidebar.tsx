"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  ShieldAlert,
  LogOut,
  ChevronRight,
  Plus,
  Moon,
  Sun,
  Bell,
  Package,
  BarChart3,
  Users,
  Rocket,
  BookOpen,
  Bot,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/theme-context";
import CreateProjectModal from "@/components/create-project-modal";

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { toggleTheme, isDark } = useTheme();
  const [projects, setProjects] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch {
      // Silently fail
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchProjects();
    }
  }, [session]);

  const isAdmin =
    session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN";

  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === path;
    return pathname?.startsWith(path);
  };

  return (
    <>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-background/80 backdrop-blur-xl transition-all duration-200",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className={cn("flex items-center border-b border-border p-4", collapsed ? "justify-center" : "gap-3")}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-gradient-to-br from-cyan-400 via-sky-500 to-teal-500 shadow-sm shadow-accent/20">
            <svg viewBox="0 0 64 64" className="h-5 w-5" aria-label="SprintFlow logo">
              <rect x="8" y="17" width="30" height="10" rx="4" fill="rgba(255,255,255,0.95)" transform="rotate(-12 23 22)" />
              <rect x="18" y="31" width="34" height="10" rx="4" fill="rgba(255,255,255,0.95)" transform="rotate(-6 35 36)" />
              <rect x="4" y="4" width="5" height="5" rx="1" fill="#7dd3fc" />
              <rect x="12" y="4" width="4" height="4" rx="1" fill="#22d3ee" />
              <rect x="18" y="4" width="5" height="5" rx="1" fill="#2dd4bf" />
            </svg>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-base font-bold tracking-tight text-foreground leading-none">SprintFlow</h1>
              <span className="text-[9px] uppercase tracking-[0.2em] text-accent font-medium">Workspace</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div className="space-y-1">
            {!collapsed && (
              <p className="text-[9px] uppercase tracking-widest text-foreground-muted font-semibold px-2 mb-2">Workspace</p>
            )}
            <NavItem
              href="/dashboard"
              icon={<LayoutDashboard className="h-4 w-4" />}
              label="Dashboard"
              active={isActive("/dashboard")}
              collapsed={collapsed}
            />
            <NavItem
              href="/projects"
              icon={<FolderKanban className="h-4 w-4" />}
              label="Projects"
              active={isActive("/projects")}
              collapsed={collapsed}
            />
            <NavItem
              href="/epics"
              icon={<LayoutDashboard className="h-4 w-4" />}
              label="Epics"
              active={isActive("/epics")}
              collapsed={collapsed}
            />
            <NavItem
              href="/releases"
              icon={<Package className="h-4 w-4" />}
              label="Releases"
              active={isActive("/releases")}
              collapsed={collapsed}
            />
            <NavItem
              href="/analytics"
              icon={<BarChart3 className="h-4 w-4" />}
              label="Analytics"
              active={isActive("/analytics")}
              collapsed={collapsed}
            />
            <NavItem
              href="/notifications"
              icon={<Bell className="h-4 w-4" />}
              label="Notifications"
              active={isActive("/notifications")}
              collapsed={collapsed}
            />
            <NavItem
              href="/resources"
              icon={<Users className="h-4 w-4" />}
              label="Resources"
              active={isActive("/resources")}
              collapsed={collapsed}
            />
            <NavItem
              href="/devops"
              icon={<Rocket className="h-4 w-4" />}
              label="DevOps"
              active={isActive("/devops")}
              collapsed={collapsed}
            />
            <NavItem
              href="/knowledge"
              icon={<BookOpen className="h-4 w-4" />}
              label="Knowledge"
              active={isActive("/knowledge") || isActive("/documents")}
              collapsed={collapsed}
            />
            <NavItem
              href="/ai"
              icon={<Bot className="h-4 w-4" />}
              label="AI Assistant"
              active={isActive("/ai")}
              collapsed={collapsed}
            />
            <NavItem
              href="/settings/integrations"
              icon={<Settings className="h-4 w-4" />}
              label="Integrations"
              active={isActive("/settings")}
              collapsed={collapsed}
            />
            {isAdmin && (
              <NavItem
                href="/admin/dashboard"
                icon={<ShieldAlert className="h-4 w-4" />}
                label="Admin"
                active={isActive("/admin")}
                collapsed={collapsed}
              />
            )}
          </div>

          {!collapsed && (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 mb-2">
                <p className="text-[9px] uppercase tracking-widest text-foreground-muted font-semibold">Projects</p>
                {isAdmin && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-foreground-muted hover:text-accent transition-colors p-0.5 rounded hover:bg-surface-hover"
                    aria-label="Create project"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="space-y-0.5">
                {projects.map((proj) => {
                  const projActive = pathname?.includes(`/projects/${proj.id}`);
                  return (
                    <Link
                      key={proj.id}
                      href={`/projects/${proj.id}`}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all",
                        projActive
                          ? "bg-surface-hover text-foreground font-medium"
                          : "text-foreground-secondary hover:bg-surface-hover hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2 overflow-hidden min-w-0">
                        <span className="font-bold text-accent shrink-0">{proj.code}</span>
                        <span className="truncate">{proj.name}</span>
                      </div>
                      <ChevronRight className="h-3 w-3 shrink-0 opacity-50" />
                    </Link>
                  );
                })}
                {projects.length === 0 && (
                  <p className="text-[11px] text-foreground-muted italic px-3 py-2">No projects</p>
                )}
              </div>
            </div>
          )}
        </nav>

        {/* Bottom section: Theme toggle + User */}
        <div className="border-t border-border p-3 space-y-2">
          <button
            onClick={toggleTheme}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-foreground-secondary hover:bg-surface-hover hover:text-foreground transition-all w-full",
              collapsed && "justify-center"
            )}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {!collapsed && <span>{isDark ? "Light Mode" : "Dark Mode"}</span>}
          </button>

          {session?.user && (
            <div className={cn("space-y-2", collapsed && "flex flex-col items-center")}>
              <div className={cn("flex items-center gap-3 overflow-hidden", collapsed ? "flex-col" : "")}>
                <Avatar
                  src={session.user.image}
                  name={session.user.name || undefined}
                  size="sm"
                />
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate leading-tight">
                      {session.user.name}
                    </p>
                    <p className="text-[10px] text-foreground-muted truncate leading-none mt-0.5">
                      {session.user.email}
                    </p>
                    <div className="mt-1">
                      <RoleBadge role={session.user.role || "USER"} />
                    </div>
                  </div>
                )}
              </div>

              {!collapsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-xs"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  leftIcon={<LogOut className="h-3.5 w-3.5" />}
                >
                  Sign Out
                </Button>
              )}
            </div>
          )}
        </div>
      </aside>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProjects}
      />

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "fixed bottom-4 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-foreground-muted hover:text-foreground transition-all",
          collapsed ? "left-[17px]" : "left-[59px]"
        )}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronRight className={cn("h-3 w-3 transition-transform", collapsed && "rotate-180")} />
      </button>
    </>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
  collapsed,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
        active
          ? "bg-accent-light text-accent font-semibold"
          : "text-foreground-secondary hover:bg-surface-hover hover:text-foreground",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? label : undefined}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

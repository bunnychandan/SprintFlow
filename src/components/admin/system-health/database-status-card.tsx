"use client";

import { Card, Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import { Database, Wifi, Timer, Users, FolderKanban, ListChecks, ScrollText, Mail, HardDrive } from "lucide-react";

interface DatabaseStatusCardProps {
  database: {
    connected: boolean;
    avgQueryTimeMs: number;
    migrationStatus: string;
    prismaClientVersion: string;
    databaseVersion: string;
    totalUsers: number;
    totalProjects: number;
    totalTasks: number;
    totalSprints: number;
    totalAuditLogs: number;
    totalInvitations: number;
    databaseSizeMB: number;
  };
  className?: string;
}

export function DatabaseStatusCard({ database, className }: DatabaseStatusCardProps) {
  const statItems = [
    { icon: Users, label: "Users", value: database.totalUsers.toLocaleString() },
    { icon: FolderKanban, label: "Projects", value: database.totalProjects.toLocaleString() },
    { icon: ListChecks, label: "Tasks", value: database.totalTasks.toLocaleString() },
    { icon: ListChecks, label: "Sprints", value: database.totalSprints.toLocaleString() },
    { icon: ScrollText, label: "Audit Logs", value: database.totalAuditLogs.toLocaleString() },
    { icon: Mail, label: "Invitations", value: database.totalInvitations.toLocaleString() },
  ];

  return (
    <Card className={cn("space-y-5", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Database</h3>
            <p className="text-xs text-foreground-muted">{database.databaseVersion}</p>
          </div>
        </div>
        <Badge variant={database.connected ? "success" : "danger"} size="sm">
          {database.connected ? "Connected" : "Disconnected"}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 text-xs text-foreground-secondary">
          <Wifi className="h-3.5 w-3.5" />
          Query: {database.avgQueryTimeMs}ms
        </div>
        <div className="flex items-center gap-2 text-xs text-foreground-secondary">
          <Timer className="h-3.5 w-3.5" />
          Migrations: {database.migrationStatus}
        </div>
        <div className="flex items-center gap-2 text-xs text-foreground-secondary">
          <HardDrive className="h-3.5 w-3.5" />
          Prisma: {database.prismaClientVersion}
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="text-center p-2 rounded-lg bg-surface-hover/50">
              <Icon className="h-4 w-4 mx-auto text-foreground-muted mb-1" />
              <p className="text-sm font-semibold text-foreground">{item.value}</p>
              <p className="text-[10px] text-foreground-muted uppercase tracking-wider">{item.label}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

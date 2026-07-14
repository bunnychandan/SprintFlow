"use client";

import Link from "next/link";
import { Star, Users, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { ProjectStatusBadge } from "./project-status-badge";
import { Avatar } from "@/components/ui/avatar";
import type { ProjectListItem } from "@/types/project";

interface ProjectCardProps {
  project: ProjectListItem;
  onToggleFavorite: (id: string, favorited: boolean) => void;
  onSelect?: (id: string, selected: boolean) => void;
  selected?: boolean;
}

export function ProjectCard({ project, onToggleFavorite, onSelect, selected }: ProjectCardProps) {
  const taskCount = (project as any)._count?.tasks ?? 0;
  const memberCount = (project as any)._count?.members ?? project.members?.length ?? 0;

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-surface p-5 transition-all duration-200",
        selected ? "border-accent ring-1 ring-accent/30" : "border-border hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
      )}
    >
      {onSelect && (
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(project.id, e.target.checked)}
          className="absolute left-3 top-3 h-4 w-4 rounded border-border"
        />
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: project.color || "#2563eb" }}
          >
            {project.code?.slice(0, 2)}
          </div>
          <div>
            <Link
              href={`/projects/${project.id}`}
              className="font-semibold text-foreground hover:text-accent transition-colors line-clamp-1"
            >
              {project.name}
            </Link>
            <p className="text-xs text-foreground-secondary mt-0.5">{project.code}</p>
          </div>
        </div>

        <button
          onClick={() => onToggleFavorite(project.id, !project.isFavorited)}
          className={cn(
            "shrink-0 p-1 rounded-lg transition-colors",
            project.isFavorited ? "text-amber-400" : "text-foreground-muted opacity-0 group-hover:opacity-100"
          )}
        >
          <Star className={cn("h-4 w-4", project.isFavorited && "fill-amber-400")} />
        </button>
      </div>

      {project.description && (
        <p className="mt-3 text-sm text-foreground-secondary line-clamp-2">{project.description}</p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <ProjectStatusBadge status={project.status} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-3 text-xs text-foreground-secondary">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {taskCount} {taskCount === 1 ? "task" : "tasks"}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </span>
        </div>

        <Link
          href={`/projects/${project.id}`}
          className="flex items-center gap-1 text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity"
        >
          View <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {project.members && project.members.length > 0 && (
        <div className="mt-3 flex items-center">
          <div className="flex -space-x-2">
            {project.members.slice(0, 4).map((m) => (
              <Avatar
                key={m.userId}
                src={m.user.image}
                name={m.user.name || m.user.email}
                className="h-6 w-6 border-2 border-surface"
              />
            ))}
            {project.members.length > 4 && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-hover text-[10px] font-medium text-foreground-secondary border-2 border-surface">
                +{project.members.length - 4}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

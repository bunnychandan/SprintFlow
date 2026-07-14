"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/ui/badge";
import { ArrowRight, Briefcase, Building2 } from "lucide-react";
import type { Resource } from "@/types/resources";

interface ResourceCardProps {
  resource: Resource;
  className?: string;
}

export function ResourceCard({ resource, className }: ResourceCardProps) {
  return (
    <Link href={`/resources/${resource.id}`}>
      <Card className={cn("p-5 hover:shadow-md transition-all cursor-pointer", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar src={resource.image} name={resource.name || resource.email} className="h-10 w-10" />
            <div>
              <p className="text-sm font-semibold text-foreground">{resource.name || resource.email}</p>
              <p className="text-xs text-foreground-muted">{resource.email}</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-foreground-muted" />
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs text-foreground-secondary">
          {resource.designation && (
            <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{resource.designation}</span>
          )}
          {resource.department && (
            <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{resource.department}</span>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <RoleBadge role={resource.role} />
          <span className="text-xs text-foreground-muted">{resource.totalAllocation}% allocated</span>
        </div>
      </Card>
    </Link>
  );
}

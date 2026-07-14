"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { ChevronRight, Home } from "lucide-react";
import type { DocumentItem } from "@/types/documentation";

interface DocumentBreadcrumbProps {
  items: { label: string; href: string }[];
  className?: string;
}

export function DocumentBreadcrumb({ items, className }: DocumentBreadcrumbProps) {
  return (
    <nav className={cn("flex items-center gap-1.5 text-xs text-foreground-secondary", className)}>
      <Link href="/documents" className="hover:text-accent transition-colors"><Home className="h-3.5 w-3.5" /></Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3" />
          {i < items.length - 1 ? (
            <Link href={item.href} className="hover:text-accent transition-colors">{item.label}</Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

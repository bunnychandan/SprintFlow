"use client";

import { cn } from "@/lib/cn";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  metadata?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  metadata,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-border bg-surface/80 backdrop-blur-xl p-6 shadow-card",
        className
      )}
    >
      <div>
        {metadata && (
          <p className="text-xs uppercase tracking-[0.35em] text-accent font-medium">
            {metadata}
          </p>
        )}
        <h1 className={cn("text-2xl font-semibold text-foreground", metadata && "mt-1")}>
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-foreground-secondary">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </motion.div>
  );
}

"use client";

import { cn } from "@/lib/cn";

interface CardProps {
  variant?: "default" | "elevated" | "glass" | "gradient";
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
}

const variantStyles = {
  default: "border border-border bg-surface",
  elevated:
    "border border-border bg-surface-elevated shadow-card",
  glass:
    "border border-border bg-surface/60 backdrop-blur-xl shadow-card",
  gradient:
    "border border-accent/20 bg-gradient-to-br from-accent-light via-accent/5 to-accent/10",
};

export function Card({
  variant = "default",
  className,
  children,
  onClick,
  hoverable,
}: CardProps) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      className={cn(
        "rounded-2xl p-5 text-left transition-all duration-150",
        variantStyles[variant],
        hoverable && "hover:border-accent/30 hover:bg-surface-hover cursor-pointer",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </Component>
  );
}

export function CardGrid({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <Card variant="glass" className={cn("flex items-center justify-between", className)}>
      <div>
        <p className="text-xs text-foreground-secondary uppercase tracking-wider font-medium">
          {label}
        </p>
        <p className="mt-1 text-3xl font-semibold text-foreground">{value}</p>
      </div>
      <div className="text-accent opacity-80">{icon}</div>
    </Card>
  );
}

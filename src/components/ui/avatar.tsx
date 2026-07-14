"use client";

import { cn } from "@/lib/cn";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function Avatar({ src, alt, name, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || "Avatar"}
        className={cn("rounded-full border border-border object-cover", sizeMap[size], className)}
      />
    );
  }

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-sky-500 font-semibold text-slate-950",
        sizeMap[size],
        className
      )}
      aria-label={name || "Avatar"}
    >
      {initials}
    </div>
  );
}

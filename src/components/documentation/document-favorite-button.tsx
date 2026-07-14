"use client";

import { cn } from "@/lib/cn";
import { Star } from "lucide-react";

interface DocumentFavoriteButtonProps {
  isFavorited: boolean;
  onClick: () => void;
  className?: string;
}

export function DocumentFavoriteButton({ isFavorited, onClick, className }: DocumentFavoriteButtonProps) {
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
      className={cn("p-1 rounded transition-colors hover:bg-surface-hover", className)}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Star className={cn("h-4 w-4 transition-colors", isFavorited ? "fill-amber-400 text-amber-400" : "text-foreground-muted")} />
    </button>
  );
}

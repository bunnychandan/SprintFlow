"use client";

import { Button } from "@/components/ui/button";
import { CheckSquare, Square, ArrowUpDown } from "lucide-react";

interface BacklogToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  allSelected: boolean;
}

export function BacklogToolbar({ selectedCount, totalCount, onSelectAll, onDeselectAll, allSelected }: BacklogToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
          onClick={allSelected ? onDeselectAll : onSelectAll}
        >
          {allSelected ? "Deselect All" : "Select All"}
        </Button>
        {selectedCount > 0 && (
          <span className="text-sm text-accent font-medium">{selectedCount} selected</span>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-foreground-secondary">
        <ArrowUpDown className="h-3.5 w-3.5" />
        <span>Drag to reorder</span>
      </div>
    </div>
  );
}

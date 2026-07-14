"use client";

import { useState } from "react";
import { CheckSquare, Plus, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChecklistItem {
  id: string; title: string; isChecked: boolean; order: number;
}

interface TaskChecklistProps {
  items: ChecklistItem[];
  onAdd: (title: string) => Promise<any>;
  onUpdate: (itemId: string, data: Record<string, unknown>) => Promise<any>;
  onDelete: (itemId: string) => Promise<void>;
}

export function TaskChecklist({ items, onAdd, onUpdate, onDelete }: TaskChecklistProps) {
  const [newTitle, setNewTitle] = useState("");
  const checkedCount = items.filter((i) => i.isChecked).length;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await onAdd(newTitle.trim());
    setNewTitle("");
  };

  const handleToggle = (item: ChecklistItem) => {
    onUpdate(item.id, { isChecked: !item.isChecked });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CheckSquare className="h-4 w-4 text-accent" />
        <h3 className="text-sm font-semibold text-foreground">Checklist</h3>
        {items.length > 0 && (
          <span className="text-xs text-foreground-muted">
            {checkedCount}/{items.length}
          </span>
        )}
      </div>

      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.id} className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-hover transition-colors">
            <input
              type="checkbox"
              checked={item.isChecked}
              onChange={() => handleToggle(item)}
              className="h-4 w-4 rounded border-border shrink-0"
            />
            <span
              className={cn(
                "flex-1 text-sm transition-all",
                item.isChecked && "line-through text-foreground-muted"
              )}
            >
              {item.title}
            </span>
            <button
              onClick={() => onDelete(item.id)}
              className="shrink-0 text-foreground-muted hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          placeholder="Add checklist item..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="text-sm"
        />
        <Button type="submit" size="sm" variant="secondary" disabled={!newTitle.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

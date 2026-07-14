"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Save } from "lucide-react";

interface AIPromptEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; category: string; description?: string; prompt: string; isPublic: boolean }) => void;
  initial?: { name: string; category: string; description?: string; prompt: string; isPublic: boolean };
  loading?: boolean;
}

export function AIPromptEditor({ isOpen, onClose, onSave, initial, loading }: AIPromptEditorProps) {
  const [name, setName] = useState(initial?.name || "");
  const [category, setCategory] = useState(initial?.category || "GENERAL");
  const [description, setDescription] = useState(initial?.description || "");
  const [prompt, setPrompt] = useState(initial?.prompt || "");
  const [isPublic, setIsPublic] = useState(initial?.isPublic || false);

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={initial ? "Edit Prompt" : "New Prompt"} size="md">
      <div className="space-y-4">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Prompt name" />
        <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} options={[{ value: "GENERAL", label: "General" }, { value: "PROJECT", label: "Project" }, { value: "TASK", label: "Task" }, { value: "SPRINT", label: "Sprint" }, { value: "DOCUMENTATION", label: "Documentation" }, { value: "DEVOPS", label: "DevOps" }, { value: "ANALYTICS", label: "Analytics" }, { value: "RESOURCE", label: "Resource" }, { value: "CUSTOM", label: "Custom" }]} />
        <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" />
        <div>
          <label className="text-xs font-medium text-foreground-secondary">Prompt Template</label>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={6} className="mt-1 w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent/30" placeholder="Enter your prompt template..." />
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="rounded border-border" /> Make public</label>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="gradient" size="sm" leftIcon={<Save className="h-4 w-4" />} onClick={() => onSave({ name, category, description: description || undefined, prompt, isPublic })} isLoading={loading} disabled={!name || !prompt}>Save</Button>
        </div>
      </div>
    </Dialog>
  );
}

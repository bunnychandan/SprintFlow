"use client";

import { useState, useEffect } from "react";
import { usePromptTemplates } from "@/hooks/use-ai";
import { AIPromptLibrary } from "@/components/ai/ai-prompt-library";
import { AIPromptEditor } from "@/components/ai/ai-prompt-editor";
import { AIEmptyState } from "@/components/ai/ai-empty-state";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Plus } from "lucide-react";

export default function PromptsPage() {
  const [category, setCategory] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const { data, loading, fetch, create } = usePromptTemplates();

  useEffect(() => { fetch(category || undefined); }, [category, fetch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Prompt Templates</h1>
          <p className="text-sm text-foreground-secondary mt-1">Manage AI prompt templates</p>
        </div>
        <Button variant="gradient" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setEditorOpen(true)}>New Prompt</Button>
      </div>

      <div className="max-w-xs">
        <Select value={category} onChange={(e) => setCategory(e.target.value)} options={[{ value: "", label: "All Categories" }, { value: "GENERAL", label: "General" }, { value: "PROJECT", label: "Project" }, { value: "TASK", label: "Task" }, { value: "SPRINT", label: "Sprint" }, { value: "DOCUMENTATION", label: "Documentation" }, { value: "DEVOPS", label: "DevOps" }, { value: "ANALYTICS", label: "Analytics" }, { value: "RESOURCE", label: "Resource" }, { value: "CUSTOM", label: "Custom" }]} />
      </div>

      {data.length === 0 && !loading ? <AIEmptyState title="No Prompts" description="Create your first prompt template." /> : <AIPromptLibrary prompts={data} loading={loading} onSelect={() => {}} />}

      <AIPromptEditor isOpen={editorOpen} onClose={() => setEditorOpen(false)} onSave={async (d) => { await create(d as any); setEditorOpen(false); fetch(); }} />
    </div>
  );
}

"use client";

import { cn } from "@/lib/cn";
import { Select } from "@/components/ui/select";

interface AIProviderSelectorProps {
  value: string;
  onChange: (provider: string) => void;
  className?: string;
}

export function AIProviderSelector({ value, onChange, className }: AIProviderSelectorProps) {
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)} options={[
      { value: "OPENAI", label: "OpenAI" },
      { value: "ANTHROPIC", label: "Anthropic" },
      { value: "GOOGLE", label: "Google AI" },
      { value: "OLLAMA", label: "Ollama (Local)" },
      { value: "CUSTOM", label: "Custom" },
    ]} className={className} />
  );
}

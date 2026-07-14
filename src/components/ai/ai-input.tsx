"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIInputProps {
  onSend: (message: string) => void;
  loading?: boolean;
  placeholder?: string;
  className?: string;
}

export function AIInput({ onSend, loading, placeholder = "Ask anything about your projects...", className }: AIInputProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className={cn("flex gap-2 p-4 border-t border-border bg-background", className)}>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        placeholder={placeholder}
        className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
      <Button variant="gradient" size="sm" onClick={handleSend} disabled={!input.trim() || loading} className="shrink-0">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </Button>
    </div>
  );
}

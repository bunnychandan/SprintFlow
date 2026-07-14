"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

interface DocumentEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function DocumentEditor({ initialContent, onChange, placeholder = "Start writing...", className }: DocumentEditorProps) {
  const [content, setContent] = useState(initialContent);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [synced, setSynced] = useState(true);

  const handleChange = useCallback((value: string) => {
    setContent(value);
    setSynced(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange(value);
      setSynced(true);
    }, 1500);
  }, [onChange]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return (
    <div className={cn("relative", className)}>
      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[400px] p-4 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-muted resize-y focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
      <div className="absolute bottom-3 right-3 flex items-center gap-2">
        {!synced && <span className="text-xs text-amber-500">Saving...</span>}
        {synced && content === initialContent && <span className="text-xs text-emerald-500">Saved</span>}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

interface JsonViewerProps {
  data: Record<string, unknown> | null | undefined;
  label?: string;
}

function JsonNode({ keyName, value, depth = 0 }: { keyName?: string; value: unknown; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);

  if (value === null || value === undefined) {
    return (
      <div className="flex items-start gap-2 text-xs" style={{ paddingLeft: depth * 16 }}>
        {keyName && <span className="text-accent font-medium">{keyName}: </span>}
        <span className="text-foreground-muted italic">null</span>
      </div>
    );
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      return (
        <div className="flex items-start gap-2 text-xs" style={{ paddingLeft: depth * 16 }}>
          {keyName && <span className="text-accent font-medium">{keyName}: </span>}
          <span className="text-foreground-muted">{'{}'}</span>
        </div>
      );
    }

    return (
      <div style={{ paddingLeft: depth * 16 }}>
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs text-foreground-secondary hover:text-foreground">
          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          {keyName && <span className="text-accent font-medium">{keyName}: </span>}
          <span className="text-foreground-muted">{'{'}{entries.length}{'}'}</span>
        </button>
        {expanded && (
          <div className="border-l border-border ml-1.5 pl-3">
            {entries.map(([k, v]) => (
              <JsonNode key={k} keyName={k} value={v} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <div className="flex items-start gap-2 text-xs" style={{ paddingLeft: depth * 16 }}>
          {keyName && <span className="text-accent font-medium">{keyName}: </span>}
          <span className="text-foreground-muted">[]</span>
        </div>
      );
    }

    return (
      <div style={{ paddingLeft: depth * 16 }}>
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs text-foreground-secondary hover:text-foreground">
          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          {keyName && <span className="text-accent font-medium">{keyName}: </span>}
          <span className="text-foreground-muted">[{value.length}]</span>
        </button>
        {expanded && (
          <div className="border-l border-border ml-1.5 pl-3">
            {value.map((v, i) => (
              <JsonNode key={i} keyName={`[${i}]`} value={v} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const display = typeof value === "string" ? `"${value}"` : String(value);
  const color = typeof value === "string" ? "text-success" : typeof value === "number" ? "text-accent" : "text-foreground";

  return (
    <div className="flex items-start gap-2 text-xs" style={{ paddingLeft: depth * 16 }}>
      {keyName && <span className="text-accent font-medium">{keyName}: </span>}
      <span className={color}>{display}</span>
    </div>
  );
}

export function AuditJsonViewer({ data, label }: JsonViewerProps) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-xs text-foreground-muted italic">No metadata</p>;
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      {label && <h4 className="text-xs font-semibold text-foreground mb-2">{label}</h4>}
      <div className="font-mono">
        <JsonNode value={data} depth={0} />
      </div>
    </div>
  );
}

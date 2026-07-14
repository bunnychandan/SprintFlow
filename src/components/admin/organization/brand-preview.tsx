"use client";

import { Card } from "@/components/ui";

interface BrandPreviewProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export function BrandPreview({ primaryColor, secondaryColor, accentColor }: BrandPreviewProps) {
  return (
    <Card variant="glass" className="p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">Brand Preview</h3>
      <div className="space-y-4">
        <div className="rounded-xl border border-border p-4" style={{ background: primaryColor + "10" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-lg" style={{ background: primaryColor }} />
            <div>
              <p className="text-sm font-bold" style={{ color: primaryColor }}>SprintFlow</p>
              <p className="text-xs" style={{ color: secondaryColor }}>Enterprise Project Management</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 text-xs font-medium rounded-full text-white" style={{ background: primaryColor }}>Primary</span>
            <span className="px-3 py-1 text-xs font-medium rounded-full text-white" style={{ background: secondaryColor }}>Secondary</span>
            <span className="px-3 py-1 text-xs font-medium rounded-full text-white" style={{ background: accentColor }}>Accent</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg p-3 text-center">
            <p className="text-xs text-foreground-secondary mb-1">Primary</p>
            <div className="h-8 rounded-md mb-1" style={{ background: primaryColor }} />
            <p className="text-[10px] font-mono text-foreground-muted">{primaryColor}</p>
          </div>
          <div className="rounded-lg p-3 text-center">
            <p className="text-xs text-foreground-secondary mb-1">Secondary</p>
            <div className="h-8 rounded-md mb-1" style={{ background: secondaryColor }} />
            <p className="text-[10px] font-mono text-foreground-muted">{secondaryColor}</p>
          </div>
          <div className="rounded-lg p-3 text-center">
            <p className="text-xs text-foreground-secondary mb-1">Accent</p>
            <div className="h-8 rounded-md mb-1" style={{ background: accentColor }} />
            <p className="text-[10px] font-mono text-foreground-muted">{accentColor}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

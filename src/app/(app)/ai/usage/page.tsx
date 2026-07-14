"use client";

import { useEffect } from "react";
import { useAIUsage } from "@/hooks/use-ai";
import { AIUsageCards } from "@/components/ai/ai-usage-cards";
import { AIUsageChart } from "@/components/ai/ai-usage-chart";
import { Card } from "@/components/ui/card";

export default function AIUsagePage() {
  const { data, loading, fetch } = useAIUsage();

  useEffect(() => { fetch({ period: "daily" }); }, [fetch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Usage</h1>
        <p className="text-sm text-foreground-secondary mt-1">Monitor AI API usage and costs</p>
      </div>

      <AIUsageCards data={data} loading={loading} />
      <AIUsageChart data={data} loading={loading} />

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5">
            <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">By Provider</h4>
            {data.byProvider.length === 0 ? <p className="text-sm text-foreground-muted">No data</p> : (
              <div className="space-y-2">
                {data.byProvider.map((p) => (
                  <div key={p.provider} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-foreground">{p.provider}</span>
                    <span className="text-sm text-foreground-muted">{p.tokens.toLocaleString()} tokens · ${p.cost.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card className="p-5">
            <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">By Model</h4>
            {data.byModel.length === 0 ? <p className="text-sm text-foreground-muted">No data</p> : (
              <div className="space-y-2">
                {data.byModel.map((m) => (
                  <div key={m.model} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-foreground">{m.model}</span>
                    <span className="text-sm text-foreground-muted">{m.tokens.toLocaleString()} tokens · ${m.cost.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

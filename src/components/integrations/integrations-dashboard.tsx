"use client";

import { useIntegrationDashboard } from "@/hooks/integrations";
import { useOrganization } from "@/hooks/use-organization";
import { Card } from "@/components/ui/card";
import { Wifi, WifiOff, AlertTriangle, Clock, RefreshCw } from "lucide-react";

export function IntegrationsDashboard() {
  const { organizationId: orgId } = useOrganization();
  const { data, isLoading } = useIntegrationDashboard(orgId);

  if (isLoading) return <div className="grid gap-4 md:grid-cols-4">{Array.from({length:4}).map((_,i) => <Card key={i} className="p-4 h-24 animate-pulse bg-muted"><div/></Card>)}</div>;
  if (!data) return <Card className="p-6 text-center text-muted-foreground"><p>No integration data available</p></Card>;

  const stats = [
    { label: "Total", value: data.total, icon: RefreshCw, className: "text-blue-500" },
    { label: "Connected", value: data.connected, icon: Wifi, className: "text-green-500" },
    { label: "Error", value: data.error, icon: AlertTriangle, className: "text-red-500" },
    { label: "Pending", value: data.pending, icon: Clock, className: "text-yellow-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4 flex items-center gap-4">
            <div className={`p-2 rounded-lg bg-muted`}>
              <stat.icon className={`h-5 w-5 ${stat.className}`} />
            </div>
            <div><p className="text-2xl font-bold">{stat.value}</p><p className="text-xs text-muted-foreground">{stat.label}</p></div>
          </Card>
        ))}
      </div>

      {data.byType.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">By Type</h3>
          <div className="space-y-2">
            {data.byType.map((item) => (
              <div key={item.type} className="flex items-center justify-between text-sm">
                <span className="capitalize">{item.type.replace(/_/g, " ").toLowerCase()}</span>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

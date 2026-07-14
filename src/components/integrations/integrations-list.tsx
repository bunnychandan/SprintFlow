"use client";

import { useState } from "react";
import { useIntegrationsList } from "@/hooks/integrations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useOrganization } from "@/hooks/use-organization";
import { Plus, Search, RefreshCw, Wifi, WifiOff, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";
import type { IntegrationItem } from "@/types/integrations";
import { IntegrationConnectModal } from "./integration-connect-modal";

const providerLabels: Record<string, string> = {
  GITHUB: "GitHub", GITLAB: "GitLab", SLACK: "Slack", MICROSOFT_TEAMS: "Teams",
  GOOGLE_CALENDAR: "Google Calendar", OUTLOOK: "Outlook", ZOOM: "Zoom",
  GOOGLE_MEET: "Google Meet", JENKINS: "Jenkins", ARGOCD: "ArgoCD",
};

const statusConfig: Record<string, { icon: typeof Wifi; className: string }> = {
  CONNECTED: { icon: Wifi, className: "text-green-500" },
  DISCONNECTED: { icon: WifiOff, className: "text-gray-400" },
  ERROR: { icon: AlertTriangle, className: "text-red-500" },
  PENDING: { icon: Clock, className: "text-yellow-500" },
};

export function IntegrationsList() {
  const { organizationId: orgId } = useOrganization();
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showConnect, setShowConnect] = useState(false);

  const { data, isLoading, refetch } = useIntegrationsList(orgId, { search, provider: providerFilter, status: statusFilter });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Integrations</h1>
        <Button onClick={() => setShowConnect(true)}>
          <Plus className="mr-2 h-4 w-4" /> Connect Integration
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search integrations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select className="border rounded-md px-3 py-2 text-sm" value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)}>
          <option value="">All Providers</option>
          {Object.entries(providerLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="border rounded-md px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="CONNECTED">Connected</option>
          <option value="DISCONNECTED">Disconnected</option>
          <option value="ERROR">Error</option>
          <option value="PENDING">Pending</option>
        </select>
        <Button variant="outline" size="sm" className="px-2" onClick={() => refetch()}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Card key={i} className="h-32 animate-pulse bg-muted"><div /></Card>)}
        </div>
      ) : !data?.data.length ? (
        <Card className="p-12 text-center text-muted-foreground">
          <Wifi className="mx-auto h-12 w-12 mb-4 opacity-20" />
          <p className="text-lg font-medium">No integrations yet</p>
          <p className="text-sm mt-1">Connect your first integration to get started.</p>
          <Button className="mt-4" onClick={() => setShowConnect(true)}><Plus className="mr-2 h-4 w-4" /> Connect Integration</Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.data.map((item) => <IntegrationCard key={item.id} integration={item} />)}
        </div>
      )}

      {showConnect && <IntegrationConnectModal isOpen={showConnect} onClose={() => setShowConnect(false)} orgId={orgId} />}
    </div>
  );
}

function IntegrationCard({ integration }: { integration: IntegrationItem }) {
  const StatusIcon = statusConfig[integration.status]?.icon || Clock;
  return (
    <Link href={`/settings/integrations/${integration.id}`}>
      <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer group">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
              {integration.provider.slice(0, 2)}
            </div>
            <div>
              <p className="font-semibold group-hover:text-primary transition-colors">{integration.name}</p>
              <p className="text-xs text-muted-foreground">{providerLabels[integration.provider] || integration.provider}</p>
            </div>
          </div>
          <Badge variant={integration.status === "CONNECTED" ? "success" : integration.status === "ERROR" ? "danger" : "neutral"}>
            <StatusIcon className="mr-1 h-3 w-3 inline" />
            {integration.status.charAt(0) + integration.status.slice(1).toLowerCase()}
          </Badge>
        </div>
        {integration.description && <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{integration.description}</p>}
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <span>{integration.type.replace(/_/g, " ").toLowerCase()}</span>
          {integration.lastSyncAt && <span>Synced {new Date(integration.lastSyncAt).toLocaleDateString()}</span>}
        </div>
      </Card>
    </Link>
  );
}

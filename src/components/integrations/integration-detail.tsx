"use client";

import { useIntegration, useConnectIntegration, useDisconnectIntegration, useSyncIntegration, useDeleteIntegration } from "@/hooks/integrations";
import { useOrganization } from "@/hooks/use-organization";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wifi, WifiOff, RefreshCw, Trash2, ArrowLeft, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function IntegrationDetailView({ id }: { id: string }) {
  const { organizationId: orgId } = useOrganization();
  const router = useRouter();

  const { data, isLoading, error, refetch } = useIntegration(id, orgId);
  const connectMutation = useConnectIntegration(orgId);
  const disconnectMutation = useDisconnectIntegration(orgId);
  const syncMutation = useSyncIntegration(orgId);
  const deleteMutation = useDeleteIntegration(orgId);

  if (error) return <div className="p-8 text-center"><p className="text-red-500 mb-2">{error}</p><button onClick={() => refetch()} className="text-sm underline">Retry</button></div>;
  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!data) return <div className="text-center py-20 text-muted-foreground">Integration not found</div>;

  const handleDelete = async () => {
    if (!confirm("Delete this integration?")) return;
    await deleteMutation.mutateAsync(id);
    router.push("/settings/integrations");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/settings/integrations"><Button variant="ghost" size="sm" className="px-2"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">{data.provider.slice(0, 2)}</div>
          <div><h1 className="text-2xl font-bold">{data.name}</h1><p className="text-sm text-muted-foreground">{data.provider}</p></div>
        </div>
        <Badge variant={data.status === "CONNECTED" ? "success" : data.status === "ERROR" ? "danger" : "neutral"}>
          {data.status === "CONNECTED" ? <Wifi className="mr-1 h-3 w-3 inline" /> : data.status === "ERROR" ? <AlertTriangle className="mr-1 h-3 w-3 inline" /> : <Clock className="mr-1 h-3 w-3 inline" />}
          {data.status.charAt(0) + data.status.slice(1).toLowerCase()}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="font-semibold mb-4">Details</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-muted-foreground">Provider</dt><dd>{data.provider}</dd></div>
              <div><dt className="text-muted-foreground">Type</dt><dd>{data.type.replace(/_/g, " ")}</dd></div>
              <div><dt className="text-muted-foreground">Description</dt><dd>{data.description || "—"}</dd></div>
              <div><dt className="text-muted-foreground">Last Sync</dt><dd>{data.lastSyncAt ? new Date(data.lastSyncAt).toLocaleString() : "Never"}</dd></div>
              <div><dt className="text-muted-foreground">Created By</dt><dd>{data.createdByName || "Unknown"}</dd></div>
              <div><dt className="text-muted-foreground">Created At</dt><dd>{new Date(data.createdAt).toLocaleDateString()}</dd></div>
            </dl>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold mb-4">Configuration</h2>
            {data.configuration && Object.keys(data.configuration).length > 0 ? (
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">{JSON.stringify(data.configuration, null, 2)}</pre>
            ) : <p className="text-sm text-muted-foreground">No configuration data</p>}
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold mb-4">Activity Log</h2>
            {!data.logs?.length ? <p className="text-sm text-muted-foreground">No activity recorded yet</p> : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {data.logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant={log.status === "CONNECTED" || log.status === "SUCCESS" ? "success" : log.status === "ERROR" ? "danger" : "neutral"} className="text-xs">{log.status}</Badge>
                      <span className="font-medium">{log.action}</span>
                      {log.message && <span className="text-muted-foreground truncate max-w-[300px]">— {log.message}</span>}
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4 space-y-3">
            <h2 className="font-semibold">Actions</h2>
            {data.status !== "CONNECTED" && <Button className="w-full" onClick={() => connectMutation.mutateAsync(id)} disabled={connectMutation.isPending}>{connectMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wifi className="mr-2 h-4 w-4" />} Connect</Button>}
            {data.status === "CONNECTED" && <Button className="w-full" variant="secondary" onClick={() => disconnectMutation.mutateAsync(id)} disabled={disconnectMutation.isPending}>{disconnectMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WifiOff className="mr-2 h-4 w-4" />} Disconnect</Button>}
            {data.status === "CONNECTED" && <Button className="w-full" variant="outline" onClick={() => syncMutation.mutateAsync(id)} disabled={syncMutation.isPending}>{syncMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />} Sync Now</Button>}
            <Button className="w-full" variant="danger" onClick={handleDelete} disabled={deleteMutation.isPending}>{deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />} Delete</Button>
          </Card>

          {data.webhooks?.length > 0 && (
            <Card className="p-4">
              <h2 className="font-semibold mb-3">Recent Webhooks</h2>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {data.webhooks.slice(0, 10).map((wh) => (
                  <div key={wh.id} className="flex items-center justify-between text-sm py-1">
                    <Badge variant="neutral" className="text-xs">{wh.event}</Badge>
                    <span className="text-xs text-muted-foreground">{wh.processed ? "Processed" : "Pending"}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

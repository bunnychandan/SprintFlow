"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, Shield, ExternalLink } from "lucide-react";
import SectionHeader from "@/components/admin/section-header";
import { Card, Badge, Avatar, Button } from "@/components/ui";
import { AuditJsonViewer } from "@/components/admin/audit/audit-json-viewer";
import { AuditTimeline } from "@/components/admin/audit/audit-timeline";
import type { AuditDetailResponse } from "@/types/admin";

const ACTION_COLORS: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  CREATE: "success",
  UPDATE: "warning",
  DELETE: "danger",
  REVOKE: "danger",
  CANCEL: "neutral",
};

function getActionColor(action: string): "success" | "warning" | "danger" | "neutral" {
  for (const [prefix, color] of Object.entries(ACTION_COLORS)) {
    if (action.startsWith(prefix)) return color;
  }
  return "neutral";
}

export default function AuditDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<AuditDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/audit/${id}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Audit log not found");
        if (res.status === 403) throw new Error("Access denied");
        throw new Error("Failed to load audit log");
      }
      const result = await res.json();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load audit log");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="p-6 animate-pulse space-y-4">
        <div className="h-8 w-64 bg-foreground-muted/20 rounded" />
        <div className="h-48 bg-foreground-muted/20 rounded-xl" />
        <div className="h-32 bg-foreground-muted/20 rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {error ?? "Audit log not found"}
          <button onClick={fetchData} className="ml-2 underline hover:no-underline">Retry</button>
        </div>
      </div>
    );
  }

  const { log, previousLogs, relatedUser, relatedProject } = data;
  const metadata = log.metadata as Record<string, unknown> | null;
  const previousValues = metadata?.previousValues as Record<string, unknown> | null;
  const newValues = metadata?.newValues as Record<string, unknown> | null;
  const requestInfo = metadata?.request as Record<string, unknown> | null;

  return (
    <div>
      <SectionHeader
        title="Audit Event Detail"
        description={`${log.action} — ${log.entityType}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Audit Center", href: "/admin/audit" },
          { label: log.action },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <Card variant="glass" className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Event Information</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-foreground-secondary">Action</dt><dd><Badge variant={getActionColor(log.action)} size="sm">{log.action}</Badge></dd></div>
              <div><dt className="text-foreground-secondary">Entity Type</dt><dd className="text-foreground font-medium">{log.entityType}</dd></div>
              <div><dt className="text-foreground-secondary">Entity ID</dt><dd className="text-foreground text-xs font-mono">{log.entityId}</dd></div>
              <div><dt className="text-foreground-secondary">Timestamp</dt><dd className="text-foreground">{new Date(log.createdAt).toLocaleString()}</dd></div>
              <div><dt className="text-foreground-secondary">Status</dt><dd>
                {log.success === null ? <span className="text-foreground-muted">Unknown</span> :
                 log.success ? <span className="text-success">Success</span> :
                 <span className="text-destructive">Failed</span>}
              </dd></div>
              {log.ipAddress && <div><dt className="text-foreground-secondary">IP Address</dt><dd className="text-foreground text-xs font-mono">{log.ipAddress}</dd></div>}
              {log.userAgent && <div className="col-span-2"><dt className="text-foreground-secondary">User Agent</dt><dd className="text-foreground text-xs font-mono break-all">{log.userAgent}</dd></div>}
              {log.correlationId && <div><dt className="text-foreground-secondary">Correlation ID</dt><dd className="text-foreground text-xs font-mono">{log.correlationId}</dd></div>}
              {log.requestId && <div><dt className="text-foreground-secondary">Request ID</dt><dd className="text-foreground text-xs font-mono">{log.requestId}</dd></div>}
            </dl>
            {log.details && (
              <div className="mt-4 p-3 rounded-lg bg-accent/5 border border-accent/10">
                <p className="text-xs text-foreground-secondary font-medium mb-1">Details</p>
                <p className="text-sm text-foreground">{log.details}</p>
              </div>
            )}
          </Card>

          {previousValues && (
            <Card variant="glass" className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Previous Values</h2>
              <AuditJsonViewer data={previousValues} />
            </Card>
          )}

          {newValues && (
            <Card variant="glass" className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">New Values</h2>
              <AuditJsonViewer data={newValues} />
            </Card>
          )}

          {requestInfo && (
            <Card variant="glass" className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Request Information</h2>
              <AuditJsonViewer data={requestInfo} label="Request Metadata" />
            </Card>
          )}

          {metadata && !previousValues && !newValues && !requestInfo && (
            <Card variant="glass" className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Metadata</h2>
              <AuditJsonViewer data={metadata} />
            </Card>
          )}

          {previousLogs.length > 0 && (
            <Card variant="glass" className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Related Audit Events</h2>
              <AuditTimeline
                events={previousLogs.map((l) => ({
                  id: l.id,
                  action: l.action,
                  details: l.details,
                  createdAt: l.createdAt.toISOString ? l.createdAt.toISOString() : String(l.createdAt),
                  actor: l.actor,
                  entityType: log.entityType,
                }))}
              />
            </Card>
          )}
        </section>

        <aside className="space-y-6">
          {log.actor && (
            <Card variant="glass" className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-accent" />
                Actor Information
              </h2>
              <div className="flex items-center gap-3 mb-4">
                <Avatar name={log.actor.name ?? log.actor.email} src={log.actor.image ?? undefined} size="md" />
                <div>
                  <p className="text-sm font-medium text-foreground">{log.actor.name ?? log.actor.email}</p>
                  <p className="text-xs text-foreground-secondary">{log.actor.email}</p>
                </div>
              </div>
              <div className="text-sm space-y-2">
                <div className="flex justify-between"><span className="text-foreground-secondary">Role</span><Badge variant={log.actor.role === "SUPER_ADMIN" ? "danger" : log.actor.role === "ADMIN" ? "warning" : "success"} size="sm">{log.actor.role}</Badge></div>
              </div>
            </Card>
          )}

          {relatedUser && (
            <Card variant="glass" className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-accent" />
                Linked User
              </h2>
              <div className="text-sm space-y-2">
                <div className="flex justify-between"><span className="text-foreground-secondary">Name</span><span className="text-foreground">{relatedUser.name ?? relatedUser.email}</span></div>
                <div className="flex justify-between"><span className="text-foreground-secondary">Email</span><span className="text-foreground">{relatedUser.email}</span></div>
                <div className="flex justify-between"><span className="text-foreground-secondary">Role</span><Badge variant={relatedUser.role === "SUPER_ADMIN" ? "danger" : relatedUser.role === "ADMIN" ? "warning" : "success"} size="sm">{relatedUser.role}</Badge></div>
                <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => router.push(`/admin/users/${relatedUser.id}`)}>
                  <ExternalLink className="h-3.5 w-3.5 mr-1" /> View User
                </Button>
              </div>
            </Card>
          )}

          {relatedProject && (
            <Card variant="glass" className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" />
                Linked Project
              </h2>
              <div className="text-sm space-y-2">
                <div className="flex justify-between"><span className="text-foreground-secondary">Name</span><span className="text-foreground">{relatedProject.name}</span></div>
                <div className="flex justify-between"><span className="text-foreground-secondary">Code</span><span className="text-foreground font-mono">{relatedProject.code}</span></div>
              </div>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}

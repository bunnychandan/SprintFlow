"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Send, Clock, Copy, Trash2, ToggleLeft } from "lucide-react";
import SectionHeader from "@/components/admin/section-header";
import { Card, Badge, Button, Dialog } from "@/components/ui";
import { getInvitation, resendInvitation, extendInvitation, duplicateInvitation, deleteInvitation } from "@/services/invitations";
import { useToast } from "@/contexts/toast-context";
import type { InvitationDetailResponse } from "@/types/admin";

const STATUS_COLORS: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  PENDING: "warning",
  ACCEPTED: "success",
  EXPIRED: "danger",
  REVOKED: "danger",
  CANCELLED: "neutral",
};

export default function InvitationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast: showToast } = useToast();
  const id = params.id as string;

  const [data, setData] = useState<InvitationDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendDate, setExtendDate] = useState("");
  const [extendLoading, setExtendLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteAction, setDeleteAction] = useState<"revoke" | "cancel">("revoke");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getInvitation(id);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load invitation");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleResend = async () => {
    setActionLoading(true);
    try {
      await resendInvitation(id);
      showToast({ message: "Invitation resent", type: "success" });
      fetchData();
    } catch (e) {
      showToast({ message: e instanceof Error ? e.message : "Failed to resend", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicate = async () => {
    setActionLoading(true);
    try {
      const result = await duplicateInvitation(id);
      showToast({ message: "Invitation duplicated", type: "success" });
      router.push(`/admin/invitations/${result.invitation.id}`);
    } catch (e) {
      showToast({ message: e instanceof Error ? e.message : "Failed to duplicate", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtend = async () => {
    if (!extendDate) return;
    setExtendLoading(true);
    try {
      await extendInvitation(id, new Date(extendDate).toISOString());
      showToast({ message: "Invitation extended", type: "success" });
      setShowExtendModal(false);
      setExtendDate("");
      fetchData();
    } catch (e) {
      showToast({ message: e instanceof Error ? e.message : "Failed to extend", type: "error" });
    } finally {
      setExtendLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteInvitation(id, deleteAction);
      showToast({ message: `Invitation ${deleteAction}d`, type: "success" });
      setShowDeleteModal(false);
      router.push("/admin/invitations");
    } catch (e) {
      showToast({ message: e instanceof Error ? e.message : `Failed to ${deleteAction}`, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-foreground-muted/20 rounded" />
          <div className="h-48 bg-foreground-muted/20 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {error ?? "Invitation not found"}
          <button onClick={fetchData} className="ml-2 underline hover:no-underline">Retry</button>
        </div>
      </div>
    );
  }

  const { invitation, auditLogs, linkedUser } = data;
  const isPending = invitation.status === "PENDING";

  return (
    <div>
      <SectionHeader
        title={invitation.email}
        description={`${invitation.type} Invitation`}
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Invitations", href: "/admin/invitations" },
          { label: invitation.email },
        ]}
      />

      {isPending && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Button size="sm" onClick={handleResend} disabled={actionLoading}>
            <Send className="h-4 w-4 mr-1" /> Resend
          </Button>
          <Button size="sm" variant="secondary" onClick={handleDuplicate} disabled={actionLoading}>
            <Copy className="h-4 w-4 mr-1" /> Duplicate
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setShowExtendModal(true)}>
            <Clock className="h-4 w-4 mr-1" /> Extend
          </Button>
          <Button size="sm" variant="danger" onClick={() => { setDeleteAction("revoke"); setShowDeleteModal(true); }} disabled={actionLoading}>
            <ToggleLeft className="h-4 w-4 mr-1" /> Revoke
          </Button>
          <Button size="sm" variant="danger" onClick={() => { setDeleteAction("cancel"); setShowDeleteModal(true); }} disabled={actionLoading}>
            <Trash2 className="h-4 w-4 mr-1" /> Cancel
          </Button>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <Card variant="glass" className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Invitation Details</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-foreground-secondary">Email</dt><dd className="text-foreground font-medium">{invitation.email}</dd></div>
              <div><dt className="text-foreground-secondary">Type</dt><dd><Badge variant={invitation.type === "ADMIN" ? "warning" : "success"} size="sm">{invitation.type}</Badge></dd></div>
              <div><dt className="text-foreground-secondary">Status</dt><dd>{STATUS_COLORS[invitation.status] ? <Badge variant={STATUS_COLORS[invitation.status]} size="sm">{invitation.status}</Badge> : invitation.status}</dd></div>
              <div><dt className="text-foreground-secondary">Invited By</dt><dd className="text-foreground">{invitation.sender?.name ?? invitation.sender?.email ?? "—"}</dd></div>
              <div><dt className="text-foreground-secondary">Department</dt><dd className="text-foreground">{invitation.department || "—"}</dd></div>
              <div><dt className="text-foreground-secondary">Designation</dt><dd className="text-foreground">{invitation.designation || "—"}</dd></div>
              <div><dt className="text-foreground-secondary">Expires</dt><dd className={new Date(invitation.expiresAt) < new Date() && isPending ? "text-destructive" : "text-foreground"}>{new Date(invitation.expiresAt).toLocaleDateString()}</dd></div>
              <div><dt className="text-foreground-secondary">Created</dt><dd className="text-foreground">{new Date(invitation.createdAt).toLocaleDateString()}</dd></div>
              {invitation.acceptedAt && <div><dt className="text-foreground-secondary">Accepted</dt><dd className="text-foreground">{new Date(invitation.acceptedAt).toLocaleDateString()}</dd></div>}
              {invitation.revokedAt && <div><dt className="text-foreground-secondary">Revoked</dt><dd className="text-foreground">{new Date(invitation.revokedAt).toLocaleDateString()}</dd></div>}
              {invitation.cancelledAt && <div><dt className="text-foreground-secondary">Cancelled</dt><dd className="text-foreground">{new Date(invitation.cancelledAt).toLocaleDateString()}</dd></div>}
              <div><dt className="text-foreground-secondary">Token</dt><dd className="text-foreground text-xs font-mono truncate max-w-[200px]" title={invitation.token}>{invitation.token}</dd></div>
            </dl>
          </Card>

          <Card variant="glass" className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Timeline</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-accent" />
                <span className="text-foreground-secondary">Created — {new Date(invitation.createdAt).toLocaleString()}</span>
              </div>
              {invitation.acceptedAt && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-foreground-secondary">Accepted — {new Date(invitation.acceptedAt).toLocaleString()}</span>
                </div>
              )}
              {invitation.revokedAt && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-destructive" />
                  <span className="text-foreground-secondary">Revoked — {new Date(invitation.revokedAt).toLocaleString()}</span>
                </div>
              )}
              {invitation.cancelledAt && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-foreground-muted" />
                  <span className="text-foreground-secondary">Cancelled — {new Date(invitation.cancelledAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </Card>

          {auditLogs.length > 0 && (
            <Card variant="glass" className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Audit Events ({auditLogs.length})</h2>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {auditLogs.map((log: Record<string, unknown>) => (
                  <div key={log.id as string} className="rounded-lg border border-border bg-surface p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground-secondary">{log.action as string}</span>
                      <span className="text-foreground-muted">{new Date(log.createdAt as string).toLocaleString()}</span>
                    </div>
                    {(log.details as string) && <p className="mt-1 text-foreground-secondary">{log.details as string}</p>}
                    {(log.actor as Record<string, string> | null) && (
                      <p className="mt-1 text-foreground-muted">by {(log.actor as Record<string, string>).name ?? (log.actor as Record<string, string>).email}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </section>

        <aside className="space-y-6">
          {linkedUser && (
            <Card variant="glass" className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Linked User</h2>
              <div className="text-sm space-y-2">
                <div className="flex justify-between"><span className="text-foreground-secondary">Name</span><span className="text-foreground">{linkedUser.name ?? linkedUser.email}</span></div>
                <div className="flex justify-between"><span className="text-foreground-secondary">Email</span><span className="text-foreground">{linkedUser.email}</span></div>
                <div className="flex justify-between"><span className="text-foreground-secondary">Role</span><Badge variant={linkedUser.role === "SUPER_ADMIN" ? "danger" : linkedUser.role === "ADMIN" ? "warning" : "success"} size="sm">{linkedUser.role}</Badge></div>
                <div className="flex justify-between"><span className="text-foreground-secondary">Status</span><Badge variant={linkedUser.isActive ? "success" : "danger"} size="sm">{linkedUser.isActive ? "Active" : "Inactive"}</Badge></div>
                <div className="flex justify-between"><span className="text-foreground-secondary">Created</span><span className="text-foreground">{new Date(linkedUser.createdAt).toLocaleDateString()}</span></div>
                <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => router.push(`/admin/users/${linkedUser.id}`)}>
                  View User Profile
                </Button>
              </div>
            </Card>
          )}

          <Card variant="glass" className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Status</span>
                <Badge variant={STATUS_COLORS[invitation.status] ?? "neutral"} size="sm">{invitation.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Type</span>
                <Badge variant={invitation.type === "ADMIN" ? "warning" : "success"} size="sm">{invitation.type}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Expired</span>
                <span className="text-foreground">{new Date(invitation.expiresAt) < new Date() ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Days Remaining</span>
                <span className="text-foreground">
                  {isPending
                    ? Math.max(0, Math.ceil((new Date(invitation.expiresAt).getTime() - Date.now()) / 86400000)) + " days"
                    : "—"}
                </span>
              </div>
            </div>
          </Card>
        </aside>
      </div>

      <Dialog isOpen={showExtendModal} onClose={() => { setShowExtendModal(false); setExtendDate(""); }} title="Extend Invitation" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">New Expiration Date *</label>
            <input type="date" value={extendDate}
              onChange={(e) => setExtendDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => { setShowExtendModal(false); setExtendDate(""); }}>Cancel</Button>
            <Button onClick={handleExtend} disabled={extendLoading || !extendDate}>{extendLoading ? "Extending..." : "Extend"}</Button>
          </div>
        </div>
      </Dialog>

      <Dialog isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title={deleteAction === "revoke" ? "Revoke Invitation" : "Cancel Invitation"} size="sm">
        <p className="text-sm text-foreground-secondary mb-4">
          Are you sure you want to {deleteAction} the invitation for <strong className="text-foreground">{invitation.email}</strong>?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Keep</Button>
          <Button variant="danger" onClick={handleDelete} disabled={actionLoading}>
            {actionLoading ? "Processing..." : deleteAction === "revoke" ? "Revoke" : "Cancel"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

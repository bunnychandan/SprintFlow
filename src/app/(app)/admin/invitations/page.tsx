"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Download, Columns, Trash2, ToggleLeft, ToggleRight, RotateCcw, Clock, Send, Copy } from "lucide-react";
import SectionHeader from "@/components/admin/section-header";
import AdminDataTable from "@/components/admin/admin-data-table";
import AdminToolbar from "@/components/admin/admin-toolbar";
import DeleteConfirmationDialog from "@/components/admin/delete-confirmation-dialog";
import { Button, Badge, Dialog } from "@/components/ui";
import { getInvitations, createInvitation, deleteInvitation, resendInvitation, extendInvitation, duplicateInvitation, bulkInvitationAction, exportInvitations } from "@/services/invitations";
import { useToast } from "@/contexts/toast-context";
import type { TableColumn } from "@/types/admin";

interface InvitationRow extends Record<string, unknown> {
  id: string;
  email: string;
  type: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  acceptedAt: string | null;
  sender: { id: string; name: string | null; email: string };
  department: string | null;
  designation: string | null;
  projectId: string | null;
}

const ALL_COLUMNS = [
  { key: "email", label: "Email", default: true },
  { key: "type", label: "Type", default: true },
  { key: "status", label: "Status", default: true },
  { key: "sender", label: "Invited By", default: true },
  { key: "department", label: "Department", default: false },
  { key: "designation", label: "Designation", default: false },
  { key: "expiresAt", label: "Expires", default: true },
  { key: "createdAt", label: "Created", default: true },
  { key: "acceptedAt", label: "Accepted", default: false },
];

const STATUS_COLORS: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  PENDING: "warning",
  ACCEPTED: "success",
  EXPIRED: "danger",
  REVOKED: "danger",
  CANCELLED: "neutral",
};

const TYPE_COLORS: Record<string, "warning" | "success"> = {
  ADMIN: "warning",
  USER: "success",
};

export default function AdminInvitationsPage() {
  const router = useRouter();
  const { addToast: showToast } = useToast();

  const [invitations, setInvitations] = useState<InvitationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(ALL_COLUMNS.filter((c) => c.default).map((c) => c.key))
  );
  const [actionLoading, setActionLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ email: "", type: "USER", department: "", designation: "", projectId: "" });
  const [createLoading, setCreateLoading] = useState(false);

  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendingId, setExtendingId] = useState<string | null>(null);
  const [extendDate, setExtendDate] = useState("");
  const [extendLoading, setExtendLoading] = useState(false);

  const [deletingInvitation, setDeletingInvitation] = useState<InvitationRow | null>(null);
  const [deleteAction, setDeleteAction] = useState<"revoke" | "cancel">("revoke");

  const saveColumnVisibility = (cols: Set<string>) => {
    setVisibleColumns(cols);
    localStorage.setItem("admin-invitations-columns", JSON.stringify([...cols]));
  };

  useEffect(() => {
    const saved = localStorage.getItem("admin-invitations-columns");
    if (saved) {
      try { setVisibleColumns(new Set(JSON.parse(saved))); } catch { /* ignore */ }
    }
  }, []);

  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getInvitations({
        page, pageSize,
        search: search || undefined,
        sortBy, sortOrder,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
      });
      setInvitations(result.invitations as unknown as InvitationRow[]);
      setTotal(result.pagination.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load invitations");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, sortBy, sortOrder, statusFilter, typeFilter]);

  useEffect(() => { fetchInvitations(); }, [fetchInvitations]);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const getStatusBadge = (status: string) => (
    <Badge variant={STATUS_COLORS[status] ?? "neutral"} size="sm">{status}</Badge>
  );

  const getTypeBadge = (type: string) => (
    <Badge variant={TYPE_COLORS[type] ?? "success"} size="sm">{type}</Badge>
  );

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString();
  };

  const columns: TableColumn<InvitationRow>[] = useMemo(() => {
    const cols: TableColumn<InvitationRow>[] = [];

    if (visibleColumns.has("email")) {
      cols.push({
        key: "email", label: "Email", sortable: true,
        render: (item) => (
          <button onClick={() => router.push(`/admin/invitations/${item.id}`)} className="text-accent hover:underline text-left font-medium">{item.email}</button>
        ),
      });
    }
    if (visibleColumns.has("type")) {
      cols.push({ key: "type", label: "Type", sortable: true, render: (item) => getTypeBadge(item.type) });
    }
    if (visibleColumns.has("status")) {
      cols.push({ key: "status", label: "Status", sortable: true, render: (item) => getStatusBadge(item.status) });
    }
    if (visibleColumns.has("sender")) {
      cols.push({ key: "sender", label: "Invited By", render: (item) => item.sender?.name ?? item.sender?.email ?? "—" });
    }
    if (visibleColumns.has("department")) {
      cols.push({ key: "department", label: "Department", render: (item) => item.department || "—" });
    }
    if (visibleColumns.has("designation")) {
      cols.push({ key: "designation", label: "Designation", render: (item) => item.designation || "—" });
    }
    if (visibleColumns.has("expiresAt")) {
      cols.push({ key: "expiresAt", label: "Expires", sortable: true, render: (item) => {
        const expired = new Date(item.expiresAt) < new Date() && item.status === "PENDING";
        return <span className={expired ? "text-destructive" : ""}>{formatDate(item.expiresAt)}</span>;
      }});
    }
    if (visibleColumns.has("createdAt")) {
      cols.push({ key: "createdAt", label: "Created", sortable: true, render: (item) => formatDate(item.createdAt) });
    }
    if (visibleColumns.has("acceptedAt")) {
      cols.push({ key: "acceptedAt", label: "Accepted", sortable: true, render: (item) => formatDate(item.acceptedAt) });
    }

    return cols;
  }, [visibleColumns, router]);

  const handleBulkAction = async (action: string) => {
    if (selected.size === 0) return;
    setActionLoading(true);
    try {
      await bulkInvitationAction(action, [...selected]);
      showToast({ message: `Successfully performed ${action} on ${selected.size} invitation(s)`, type: "success" });
      setSelected(new Set());
      fetchInvitations();
    } catch (e) {
      showToast({ message: e instanceof Error ? e.message : "Bulk action failed", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.email) { showToast({ message: "Email is required", type: "error" }); return; }
    setCreateLoading(true);
    try {
      await createInvitation({
        email: formData.email,
        type: formData.type,
        department: formData.department || undefined,
        designation: formData.designation || undefined,
      });
      showToast({ message: "Invitation created successfully", type: "success" });
      setShowCreateModal(false);
      setFormData({ email: "", type: "USER", department: "", designation: "", projectId: "" });
      fetchInvitations();
    } catch (e) {
      showToast({ message: e instanceof Error ? e.message : "Failed to create invitation", type: "error" });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleResend = async (id: string) => {
    setActionLoading(true);
    try {
      await resendInvitation(id);
      showToast({ message: "Invitation resent", type: "success" });
      fetchInvitations();
    } catch (e) {
      showToast({ message: e instanceof Error ? e.message : "Failed to resend", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    setActionLoading(true);
    try {
      await duplicateInvitation(id);
      showToast({ message: "Invitation duplicated", type: "success" });
      fetchInvitations();
    } catch (e) {
      showToast({ message: e instanceof Error ? e.message : "Failed to duplicate", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtend = async () => {
    if (!extendingId || !extendDate) return;
    setExtendLoading(true);
    try {
      await extendInvitation(extendingId, new Date(extendDate).toISOString());
      showToast({ message: "Invitation extended", type: "success" });
      setShowExtendModal(false);
      setExtendingId(null);
      setExtendDate("");
      fetchInvitations();
    } catch (e) {
      showToast({ message: e instanceof Error ? e.message : "Failed to extend", type: "error" });
    } finally {
      setExtendLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingInvitation) return;
    setActionLoading(true);
    try {
      await deleteInvitation(deletingInvitation.id, deleteAction);
      showToast({ message: `Invitation ${deleteAction}d`, type: "success" });
      setDeletingInvitation(null);
      fetchInvitations();
    } catch (e) {
      showToast({ message: e instanceof Error ? e.message : `Failed to ${deleteAction}`, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const renderActions = (item: InvitationRow) => {
    if (item.status !== "PENDING") return null;
    return (
      <div className="flex items-center gap-1">
        <button onClick={(e) => { e.stopPropagation(); handleResend(item.id); }} className="p-1 text-foreground-secondary hover:text-accent" title="Resend">
          <Send className="h-4 w-4" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); handleDuplicate(item.id); }} className="p-1 text-foreground-secondary hover:text-accent" title="Duplicate">
          <Copy className="h-4 w-4" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); setExtendingId(item.id); setShowExtendModal(true); }} className="p-1 text-foreground-secondary hover:text-accent" title="Extend">
          <Clock className="h-4 w-4" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); setDeleteAction("revoke"); setDeletingInvitation(item); }} className="p-1 text-foreground-secondary hover:text-destructive" title="Revoke">
          <ToggleLeft className="h-4 w-4" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); setDeleteAction("cancel"); setDeletingInvitation(item); }} className="p-1 text-foreground-secondary hover:text-destructive" title="Cancel">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <div>
      <SectionHeader
        title="Invitations"
        description="Manage user and admin invitations"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Invitations" }]}
      />

      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        filters={
          <div className="flex items-center gap-2">
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="rounded-lg border border-border bg-surface py-1.5 px-2.5 text-xs text-foreground focus:border-accent focus:outline-none">
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="EXPIRED">Expired</option>
              <option value="REVOKED">Revoked</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="rounded-lg border border-border bg-surface py-1.5 px-2.5 text-xs text-foreground focus:border-accent focus:outline-none">
              <option value="">All Types</option>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-1" /> Send Invitation
            </Button>
            <button onClick={() => exportInvitations({ status: statusFilter || undefined, type: typeFilter || undefined })}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground-secondary hover:text-foreground flex items-center gap-1">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <ColumnsDropdown
              columns={ALL_COLUMNS}
              visible={visibleColumns}
              onChange={saveColumnVisibility}
            />
            {selected.size > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-foreground-secondary">{selected.size} selected</span>
                <Button variant="danger" size="sm" onClick={() => handleBulkAction("revoke")} disabled={actionLoading}>
                  <ToggleLeft className="h-4 w-4 mr-1" /> Revoke
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleBulkAction("cancel")} disabled={actionLoading}>
                  <Trash2 className="h-4 w-4 mr-1" /> Cancel
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleBulkAction("delete")} disabled={actionLoading}>
                  Delete
                </Button>
              </div>
            ) : null}
          </div>
        }
      />

      <AdminDataTable
        columns={columns}
        data={invitations}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        sortKey={sortBy}
        sortDirection={sortOrder}
        onSort={handleSort}
        selectable
        selectedIds={selected}
        onSelectionChange={setSelected}
        loading={loading}
        emptyMessage="No invitations found"
        actions={renderActions}
      />

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
          <button onClick={fetchInvitations} className="ml-2 underline hover:no-underline">Retry</button>
        </div>
      )}

      <Dialog isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Send Invitation" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
            <input type="email" value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" placeholder="user@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Type *</label>
            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none">
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Department</label>
              <input type="text" value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Designation</label>
              <input type="text" value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createLoading}>{createLoading ? "Sending..." : "Send Invitation"}</Button>
          </div>
        </div>
      </Dialog>

      <Dialog isOpen={showExtendModal} onClose={() => { setShowExtendModal(false); setExtendingId(null); }} title="Extend Invitation" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">New Expiration Date *</label>
            <input type="date" value={extendDate}
              onChange={(e) => setExtendDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => { setShowExtendModal(false); setExtendingId(null); }}>Cancel</Button>
            <Button onClick={handleExtend} disabled={extendLoading || !extendDate}>{extendLoading ? "Extending..." : "Extend"}</Button>
          </div>
        </div>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={!!deletingInvitation}
        onClose={() => setDeletingInvitation(null)}
        onConfirm={handleDelete}
        title={deleteAction === "revoke" ? "Revoke Invitation" : "Cancel Invitation"}
        message={`Are you sure you want to ${deleteAction} the invitation for ${deletingInvitation?.email ?? "this user"}?`}
        loading={actionLoading}
      />
    </div>
  );
}

function ColumnsDropdown({
  columns,
  visible,
  onChange,
}: {
  columns: { key: string; label: string }[];
  visible: Set<string>;
  onChange: (cols: Set<string>) => void;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (key: string) => {
    const next = new Set(visible);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(next);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground-secondary hover:text-foreground flex items-center gap-1">
        <Columns className="h-3.5 w-3.5" /> Columns
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl border border-border bg-popover p-2 shadow-lg">
          {columns.map((col) => (
            <label key={col.key} className="flex items-center gap-2 px-2 py-1.5 text-sm text-foreground hover:bg-accent/5 rounded-lg cursor-pointer">
              <input type="checkbox" checked={visible.has(col.key)} onChange={() => toggle(col.key)} className="rounded border-border" />
              {col.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

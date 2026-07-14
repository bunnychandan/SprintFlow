"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Download, Columns, Trash2, ToggleLeft, ToggleRight, RotateCcw, Shield, UserCog, Key } from "lucide-react";
import SectionHeader from "@/components/admin/section-header";
import AdminDataTable from "@/components/admin/admin-data-table";
import AdminToolbar from "@/components/admin/admin-toolbar";
import DeleteConfirmationDialog from "@/components/admin/delete-confirmation-dialog";
import { Button, Badge, Avatar, Select, Dialog } from "@/components/ui";
import { getAdmins, createAdmin, updateAdmin, deleteAdmin, bulkAdminAction, exportAdmins } from "@/services/admins";
import { ADMIN_PERMISSIONS, defaultAdminPermissions } from "@/lib/constants";
import { useToast } from "@/contexts/toast-context";
import type { TableColumn } from "@/types/admin";

interface AdminRow extends Record<string, unknown> {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  isActive: boolean;
  department: string | null;
  designation: string | null;
  lastLoginAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  permissions: Record<string, boolean> | null;
  managedProjects: number;
  managedUsers: number;
  _count?: { projects: number; tasksAssigned: number; tasksReported: number };
}

const ALL_COLUMNS = [
  { key: "name", label: "Name", default: true },
  { key: "email", label: "Email", default: true },
  { key: "department", label: "Department", default: true },
  { key: "designation", label: "Designation", default: true },
  { key: "role", label: "Role", default: true },
  { key: "isActive", label: "Status", default: true },
  { key: "lastLoginAt", label: "Last Login", default: false },
  { key: "createdAt", label: "Created", default: true },
  { key: "managedProjects", label: "Projects Managed", default: true },
  { key: "managedUsers", label: "Users Managed", default: false },
];

export default function AdminAdminsPage() {
  const router = useRouter();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminRow | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAdmin, setDeletingAdmin] = useState<AdminRow | null>(null);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(ALL_COLUMNS.filter((c) => c.default).map((c) => c.key)));

  const [formData, setFormData] = useState({
    email: "", name: "", department: "", designation: "", isActive: true,
  });
  const [formPermissions, setFormPermissions] = useState<Record<string, boolean>>(defaultAdminPermissions());
  const [formError, setFormError] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin-admins-columns");
      if (saved) setVisibleColumns(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  const saveColumnVisibility = (cols: Set<string>) => {
    setVisibleColumns(cols);
    localStorage.setItem("admin-admins-columns", JSON.stringify([...cols]));
  };

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdmins({
        page, pageSize,
        search: search || undefined,
        sortBy, sortOrder,
        role: roleFilter || undefined,
        isActive: statusFilter || undefined,
      });
      setAdmins(result.admins as AdminRow[]);
      setTotal(result.pagination.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load admins");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, sortBy, sortOrder, roleFilter, statusFilter]);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const columns: TableColumn<AdminRow>[] = useMemo(() => {
    const cols: TableColumn<AdminRow>[] = [
      {
        key: "name", label: "Name", sortable: true,
        render: (u) => (
          <button onClick={() => router.push(`/admin/admins/${u.id}`)} className="flex items-center gap-3 text-left hover:text-accent transition-colors">
            <Avatar name={u.name || u.email} src={u.image || undefined} size="sm" />
            <span className="font-medium text-foreground">{u.name || "—"}</span>
          </button>
        ),
      },
      { key: "email", label: "Email", sortable: true },
      { key: "department", label: "Department", sortable: true },
      { key: "designation", label: "Designation", sortable: true },
      {
        key: "role", label: "Role", sortable: true,
        render: (u) => (
          <Badge variant={u.role === "SUPER_ADMIN" ? "danger" : "warning"} size="sm">{u.role}</Badge>
        ),
      },
      {
        key: "isActive", label: "Status",
        render: (u) => (
          <Badge variant={u.deletedAt ? "danger" : u.isActive ? "success" : "danger"} size="sm">
            {u.deletedAt ? "Deleted" : u.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      { key: "lastLoginAt", label: "Last Login", render: (u) => u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "—" },
      { key: "createdAt", label: "Created", render: (u) => new Date(u.createdAt).toLocaleDateString() },
      { key: "managedProjects", label: "Managed Projects", render: (u) => <span className="text-foreground-secondary">{u.managedProjects ?? 0}</span> },
      { key: "managedUsers", label: "Managed Users", render: (u) => <span className="text-foreground-secondary">{u.managedUsers ?? 0}</span> },
    ];
    return cols.filter((c) => visibleColumns.has(c.key));
  }, [visibleColumns, router]);

  const handleBulkAction = async (action: "activate" | "deactivate" | "delete" | "restore") => {
    if (selected.size === 0) return;
    setActionLoading(true);
    try {
      await bulkAdminAction([...selected], action);
      toast?.addToast({ message: `Bulk ${action} completed`, type: "success" });
      setSelected(new Set());
      fetchAdmins();
    } catch (e) {
      toast?.addToast({ message: e instanceof Error ? e.message : "Action failed", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingAdmin) return;
    setActionLoading(true);
    try {
      await deleteAdmin(deletingAdmin.id);
      toast?.addToast({ message: "Admin deleted", type: "success" });
      setShowDeleteConfirm(false);
      setDeletingAdmin(null);
      fetchAdmins();
    } catch (e) {
      toast?.addToast({ message: e instanceof Error ? e.message : "Delete failed", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreate = async () => {
    setFormError("");
    if (!formData.email) { setFormError("Email is required"); return; }
    setActionLoading(true);
    try {
      await createAdmin({ ...formData, isActive: true, permissions: formPermissions });
      toast?.addToast({ message: "Admin created", type: "success" });
      setShowCreateModal(false);
      setFormData({ email: "", name: "", department: "", designation: "", isActive: true });
      setFormPermissions(defaultAdminPermissions());
      fetchAdmins();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to create admin");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editingAdmin) return;
    setFormError("");
    setActionLoading(true);
    try {
      await updateAdmin(editingAdmin.id, formData);
      toast?.addToast({ message: "Admin updated", type: "success" });
      setShowEditModal(false);
      setEditingAdmin(null);
      fetchAdmins();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to update admin");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePermissionsSave = async () => {
    if (!editingAdmin) return;
    setActionLoading(true);
    try {
      await updateAdmin(editingAdmin.id, { permissions: formPermissions });
      toast?.addToast({ message: "Permissions updated", type: "success" });
      setShowPermissionsModal(false);
      setEditingAdmin(null);
      fetchAdmins();
    } catch (e) {
      toast?.addToast({ message: e instanceof Error ? e.message : "Failed to update permissions", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (admin: AdminRow) => {
    setEditingAdmin(admin);
    setFormData({
      email: admin.email, name: admin.name || "",
      department: admin.department || "",
      designation: admin.designation || "",
      isActive: admin.isActive,
    });
    setFormError("");
    setShowEditModal(true);
  };

  const openPermissionsModal = (admin: AdminRow) => {
    setEditingAdmin(admin);
    setFormPermissions((admin.permissions as Record<string, boolean>) || defaultAdminPermissions());
    setShowPermissionsModal(true);
  };

  const handleExport = async () => {
    try {
      const blob = await (await fetch("/api/admin/admins/export")).blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `admins-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast?.addToast({ message: "Export failed", type: "error" });
    }
  };

  const renderActions = (admin: AdminRow) => (
    <div className="flex items-center gap-1">
      <button onClick={() => { openPermissionsModal(admin); }} className="p-1.5 rounded-lg text-foreground-secondary hover:text-accent hover:bg-accent-light transition-colors" title="Permissions">
        <Key className="h-4 w-4" />
      </button>
      <button onClick={() => openEditModal(admin)} className="p-1.5 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-colors" title="Edit">
        <UserCog className="h-4 w-4" />
      </button>
      <button onClick={() => { setDeletingAdmin(admin); setShowDeleteConfirm(true); }} className="p-1.5 rounded-lg text-foreground-secondary hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  const PermissionCheckbox = ({ permission }: { permission: typeof ADMIN_PERMISSIONS[number] }) => (
    <label className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-hover cursor-pointer transition-colors">
      <input
        type="checkbox"
        checked={formPermissions[permission.key] ?? false}
        onChange={() => setFormPermissions({ ...formPermissions, [permission.key]: !formPermissions[permission.key] })}
        className="rounded border-border text-accent focus:ring-accent"
      />
      <div>
        <p className="text-sm font-medium text-foreground">{permission.label}</p>
        <p className="text-xs text-foreground-muted">{permission.description}</p>
      </div>
    </label>
  );

  return (
    <div>
      <SectionHeader
        title="Admins"
        description="Manage administrator accounts and permissions"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Admins" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
            <Button variant="primary" size="sm" onClick={() => {
              setFormData({ email: "", name: "", department: "", designation: "", isActive: true });
              setFormPermissions(defaultAdminPermissions());
              setFormError("");
              setShowCreateModal(true);
            }}>
              <Plus className="h-4 w-4 mr-1" /> Create Admin
            </Button>
          </div>
        }
      />

      <AdminToolbar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search name, email, department..."
        filters={
          <>
            <Select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              options={[
                { value: "", label: "All Roles" },
                { value: "SUPER_ADMIN", label: "Super Admin" },
                { value: "ADMIN", label: "Admin" },
              ]}
            />
            <Select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              options={[
                { value: "", label: "All Status" },
                { value: "true", label: "Active" },
                { value: "false", label: "Inactive" },
              ]}
            />
            <div className="relative">
              <Button variant="ghost" size="sm" onClick={() => setShowColumnMenu(!showColumnMenu)}>
                <Columns className="h-4 w-4 mr-1" /> Columns
              </Button>
              {showColumnMenu && (
                <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-xl shadow-dropdown p-2 z-50 min-w-[180px]">
                  {ALL_COLUMNS.map((col) => (
                    <label key={col.key} className="flex items-center gap-2 px-2 py-1.5 text-xs text-foreground hover:bg-surface-hover rounded-lg cursor-pointer">
                      <input type="checkbox" checked={visibleColumns.has(col.key)}
                        onChange={() => {
                          const next = new Set(visibleColumns);
                          if (next.has(col.key)) next.delete(col.key); else next.add(col.key);
                          saveColumnVisibility(next);
                        }}
                        className="rounded border-border text-accent focus:ring-accent"
                      />
                      {col.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </>
        }
        actions={
          selected.size > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-foreground-secondary">{selected.size} selected</span>
              <Button variant="ghost" size="sm" onClick={() => handleBulkAction("activate")} disabled={actionLoading}>
                <ToggleRight className="h-4 w-4 mr-1" /> Activate
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleBulkAction("deactivate")} disabled={actionLoading}>
                <ToggleLeft className="h-4 w-4 mr-1" /> Deactivate
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleBulkAction("restore")} disabled={actionLoading}>
                <RotateCcw className="h-4 w-4 mr-1" /> Restore
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleBulkAction("delete")} disabled={actionLoading}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </div>
          ) : null
        }
      />

      <AdminDataTable
        columns={columns}
        data={admins}
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
        emptyMessage="No admins found"
        actions={renderActions}
      />

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
          <button onClick={fetchAdmins} className="ml-2 underline hover:no-underline">Retry</button>
        </div>
      )}

      <Dialog isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Admin" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
            <input type="email" value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Name</label>
            <input type="text" value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Department</label>
              <input type="text" value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Designation</label>
              <input type="text" value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Permissions</label>
            <div className="border border-border rounded-xl divide-y divide-border max-h-48 overflow-y-auto">
              {ADMIN_PERMISSIONS.map((p) => (
                <PermissionCheckbox key={p.key} permission={p} />
              ))}
            </div>
          </div>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate} disabled={actionLoading}>
              {actionLoading ? "Creating..." : "Create Admin"}
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Admin" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Name</label>
            <input type="text" value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Department</label>
              <input type="text" value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Designation</label>
              <input type="text" value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
            </div>
          </div>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleEdit} disabled={actionLoading}>
              {actionLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog isOpen={showPermissionsModal} onClose={() => setShowPermissionsModal(false)} title="Manage Permissions" size="md">
        <div className="space-y-4">
          <p className="text-sm text-foreground-secondary">
            Configure permissions for {editingAdmin?.name || editingAdmin?.email}
          </p>
          <div className="border border-border rounded-xl divide-y divide-border max-h-72 overflow-y-auto">
            {ADMIN_PERMISSIONS.map((p) => (
              <PermissionCheckbox key={p.key} permission={p} />
            ))}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowPermissionsModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handlePermissionsSave} disabled={actionLoading}>
              {actionLoading ? "Saving..." : "Save Permissions"}
            </Button>
          </div>
        </div>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setDeletingAdmin(null); }}
        onConfirm={handleDelete}
        title="Delete Admin"
        message={`Are you sure you want to delete ${deletingAdmin?.name || deletingAdmin?.email}? This will soft-delete the account.`}
        loading={actionLoading}
      />
    </div>
  );
}

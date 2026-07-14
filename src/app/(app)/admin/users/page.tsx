"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Download, Columns, Trash2, ToggleLeft, ToggleRight, RotateCcw, Shield, UserCog } from "lucide-react";
import SectionHeader from "@/components/admin/section-header";
import AdminDataTable from "@/components/admin/admin-data-table";
import AdminToolbar from "@/components/admin/admin-toolbar";
import SearchBar from "@/components/admin/search-bar";
import DeleteConfirmationDialog from "@/components/admin/delete-confirmation-dialog";
import { Button, Badge, Avatar, Select, Dialog } from "@/components/ui";
import { useUsers } from "@/hooks/use-users";
import { bulkUserAction, deleteUser, createUser, updateUser } from "@/services/users";
import { useToast } from "@/contexts/toast-context";
import type { TableColumn } from "@/types/admin";
import type { User } from "@prisma/client";

type UserRow = User & { _count: { projects: number; tasksAssigned: number; tasksReported: number } };

const ALL_COLUMNS: { key: string; label: string; default: boolean }[] = [
  { key: "name", label: "Name", default: true },
  { key: "email", label: "Email", default: true },
  { key: "department", label: "Department", default: true },
  { key: "designation", label: "Designation", default: true },
  { key: "role", label: "Role", default: true },
  { key: "isActive", label: "Status", default: true },
  { key: "lastLoginAt", label: "Last Login", default: false },
  { key: "createdAt", label: "Created", default: true },
  { key: "projects", label: "Projects", default: false },
  { key: "tasksAssigned", label: "Assigned", default: false },
  { key: "tasksReported", label: "Reported", default: false },
];

export default function AdminUsersPage() {
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserRow | null>(null);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(ALL_COLUMNS.filter((c) => c.default).map((c) => c.key)));
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "", name: "", role: "USER" as string,
    department: "", designation: "",
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin-users-columns");
      if (saved) setVisibleColumns(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  const saveColumnVisibility = (cols: Set<string>) => {
    setVisibleColumns(cols);
    localStorage.setItem("admin-users-columns", JSON.stringify([...cols]));
  };

  const { users, total, loading, error, refetch } = useUsers({
    page, pageSize, search: search || undefined,
    sortBy, sortOrder,
    role: roleFilter || undefined,
    isActive: statusFilter || undefined,
  });

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const columns: TableColumn<UserRow>[] = useMemo(() => {
    const cols: TableColumn<UserRow>[] = [
      {
        key: "name", label: "Name", sortable: true,
        render: (u) => (
          <button onClick={() => router.push(`/admin/users/${u.id}`)} className="flex items-center gap-3 text-left hover:text-accent transition-colors">
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
          <Badge variant={u.role === "SUPER_ADMIN" ? "danger" : u.role === "ADMIN" ? "warning" : "neutral"} size="sm">
            {u.role}
          </Badge>
        ),
      },
      {
        key: "isActive", label: "Status",
        render: (u) => (
          <Badge variant={u.isActive ? "success" : u.deletedAt ? "danger" : "danger"} size="sm">
            {u.deletedAt ? "Deleted" : u.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      { key: "lastLoginAt", label: "Last Login", render: (u) => u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "—" },
      { key: "createdAt", label: "Created", render: (u) => new Date(u.createdAt).toLocaleDateString() },
      {
        key: "projects", label: "Projects",
        render: (u) => <span className="text-foreground-secondary">{u._count?.projects ?? 0}</span>,
      },
      {
        key: "tasksAssigned", label: "Assigned",
        render: (u) => <span className="text-foreground-secondary">{u._count?.tasksAssigned ?? 0}</span>,
      },
      {
        key: "tasksReported", label: "Reported",
        render: (u) => <span className="text-foreground-secondary">{u._count?.tasksReported ?? 0}</span>,
      },
    ];
    return cols.filter((c) => visibleColumns.has(c.key));
  }, [visibleColumns, router]);

  const selectedUsers = users.filter((u) => selected.has(u.id));

  const handleBulkAction = async (action: "activate" | "deactivate" | "delete" | "restore") => {
    if (selected.size === 0) return;
    setActionLoading(true);
    try {
      await bulkUserAction([...selected], action);
      toast?.addToast?.({ message: "Bulk action completed", description: `Bulk ${action} completed`, type: "success" });
      setSelected(new Set());
      refetch();
    } catch (e) {
      toast?.addToast?.({ message: "Action failed", description: e instanceof Error ? e.message : "Action failed", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setActionLoading(true);
    try {
      await deleteUser(deletingUser.id);
      toast?.addToast?.({ message: "User deleted", type: "success" });
      setShowDeleteConfirm(false);
      setDeletingUser(null);
      refetch();
    } catch (e) {
      toast?.addToast?.({ message: "Delete failed", description: e instanceof Error ? e.message : "Delete failed", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateUser = async () => {
    setFormError("");
    if (!formData.email) { setFormError("Email is required"); return; }
    setActionLoading(true);
    try {
      await createUser(formData);
      toast?.addToast?.({ message: "User created", type: "success" });
      setShowCreateModal(false);
      setFormData({ email: "", name: "", role: "USER", department: "", designation: "" });
      refetch();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to create user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;
    setFormError("");
    setActionLoading(true);
    try {
      await updateUser(editingUser.id, formData);
      toast?.addToast?.({ message: "User updated", type: "success" });
      setShowEditModal(false);
      setEditingUser(null);
      refetch();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to update user");
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (user: UserRow) => {
    setEditingUser(user);
    setFormData({
      email: user.email, name: user.name || "",
      role: user.role, department: user.department || "",
      designation: user.designation || "",
    });
    setFormError("");
    setShowEditModal(true);
  };

  const handleExport = async () => {
    try {
      const blob = await (await fetch("/api/admin/users/export")).blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast?.addToast?.({ message: "Export failed", type: "error" });
    }
  };

  const renderActions = (user: UserRow) => (
    <div className="flex items-center gap-1">
      <button onClick={() => openEditModal(user)} className="p-1.5 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-colors" title="Edit">
        <UserCog className="h-4 w-4" />
      </button>
      <button onClick={() => { setDeletingUser(user); setShowDeleteConfirm(true); }} className="p-1.5 rounded-lg text-foreground-secondary hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div>
      <SectionHeader
        title="Users"
        description="Manage platform users, roles, and permissions"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Users" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
            <Button variant="primary" size="sm" onClick={() => { setFormData({ email: "", name: "", role: "USER", department: "", designation: "" }); setFormError(""); setShowCreateModal(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Create User
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
                { value: "USER", label: "User" },
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
                      <input
                        type="checkbox"
                        checked={visibleColumns.has(col.key)}
                        onChange={() => {
                          const next = new Set(visibleColumns);
                          if (next.has(col.key)) next.delete(col.key);
                          else next.add(col.key);
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
        data={users}
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
        emptyMessage="No users found matching your criteria"
        actions={renderActions}
      />

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
          <button onClick={refetch} className="ml-2 underline hover:no-underline">Retry</button>
        </div>
      )}

      <Dialog isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create User" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Department</label>
              <input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Designation</label>
              <input type="text" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Role</label>
            <Select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={[
                { value: "USER", label: "User" },
                { value: "ADMIN", label: "Admin" },
                { value: "SUPER_ADMIN", label: "Super Admin" },
              ]} />
          </div>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateUser} disabled={actionLoading}>
              {actionLoading ? "Creating..." : "Create User"}
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit User" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Department</label>
              <input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Designation</label>
              <input type="text" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Role</label>
            <Select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={[
                { value: "USER", label: "User" },
                { value: "ADMIN", label: "Admin" },
                { value: "SUPER_ADMIN", label: "Super Admin" },
              ]} />
          </div>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleEditUser} disabled={actionLoading}>
              {actionLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setDeletingUser(null); }}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete ${deletingUser?.name || deletingUser?.email}? This will soft-delete the account and revoke access.`}
        loading={actionLoading}
      />
    </div>
  );
}

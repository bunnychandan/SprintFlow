"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Download, Columns, RefreshCw, ScrollText, Clock } from "lucide-react";
import SectionHeader from "@/components/admin/section-header";
import AdminDataTable from "@/components/admin/admin-data-table";
import AdminToolbar from "@/components/admin/admin-toolbar";
import { Badge, Avatar } from "@/components/ui";
import { getAuditLogs, getAuditDashboard, exportAuditLogs } from "@/services/audit";
import { AuditCards } from "@/components/admin/audit/audit-cards";
import { AuditFilterPanel } from "@/components/admin/audit/audit-filter-panel";
import { AuditExportDialog } from "@/components/admin/audit/audit-export-dialog";
import { AuditActivityFeed } from "@/components/admin/audit/audit-activity-feed";
import type { TableColumn } from "@/types/admin";

interface AuditRow extends Record<string, unknown> {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string | null;
  createdAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  success: boolean | null;
  actor: { id: string; name: string | null; email: string; image: string | null; role: string } | null;
  projectId: string | null;
}

const ALL_COLUMNS = [
  { key: "timestamp", label: "Timestamp", default: true },
  { key: "actor", label: "Actor", default: true },
  { key: "action", label: "Action", default: true },
  { key: "entityType", label: "Entity", default: true },
  { key: "entityId", label: "Entity ID", default: false },
  { key: "details", label: "Details", default: true },
  { key: "status", label: "Status", default: true },
  { key: "ipAddress", label: "IP Address", default: false },
];

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

const ENTITY_TYPE_OPTIONS = ["USER", "PROJECT", "TASK", "SPRINT", "INVITATION", "AUDIT", "COMMENT"];
const ACTION_OPTIONS: string[] = [];

export default function AdminAuditPage() {
  const router = useRouter();

  const [logs, setLogs] = useState<AuditRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(ALL_COLUMNS.filter((c) => c.default).map((c) => c.key))
  );

  const [filters, setFilters] = useState({
    action: "", entityType: "", actorId: "", success: "", projectId: "", dateFrom: "", dateTo: "",
  });

  const [dashboard, setDashboard] = useState<Record<string, unknown> | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  const [showExport, setShowExport] = useState(false);

  const saveColumnVisibility = (cols: Set<string>) => {
    setVisibleColumns(cols);
    localStorage.setItem("admin-audit-columns", JSON.stringify([...cols]));
  };

  useEffect(() => {
    const saved = localStorage.getItem("admin-audit-columns");
    if (saved) {
      try { setVisibleColumns(new Set(JSON.parse(saved))); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    getAuditDashboard().then((d) => { setDashboard(d); setDashboardLoading(false); }).catch(() => setDashboardLoading(false));
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAuditLogs({
        page, pageSize,
        search: search || undefined,
        sortBy, sortOrder,
        action: filters.action || undefined,
        entityType: filters.entityType || undefined,
        actorId: filters.actorId || undefined,
        success: filters.success || undefined,
        projectId: filters.projectId || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
      });
      setLogs(result.logs as unknown as AuditRow[]);
      setTotal(result.pagination.total);

      if (ACTION_OPTIONS.length === 0 && result.logs.length > 0) {
        const actions = new Set<string>();
        result.logs.forEach((l: Record<string, unknown>) => {
          if (l.action) actions.add(l.action as string);
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, sortBy, sortOrder, filters]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const columns: TableColumn<AuditRow>[] = useMemo(() => {
    const cols: TableColumn<AuditRow>[] = [];

    if (visibleColumns.has("timestamp")) {
      cols.push({
        key: "createdAt", label: "Timestamp", sortable: true,
        render: (item) => (
          <span className="text-xs text-foreground-secondary whitespace-nowrap">{formatDate(item.createdAt)}</span>
        ),
      });
    }
    if (visibleColumns.has("actor")) {
      cols.push({
        key: "actor", label: "Actor",
        render: (item) => (
          <div className="flex items-center gap-2">
            <Avatar name={item.actor?.name ?? item.actor?.email ?? "S"} src={item.actor?.image ?? undefined} size="sm" />
            <span className="text-sm text-foreground">{item.actor?.name ?? item.actor?.email ?? "System"}</span>
          </div>
        ),
      });
    }
    if (visibleColumns.has("action")) {
      cols.push({
        key: "action", label: "Action", sortable: true,
        render: (item) => <Badge variant={getActionColor(item.action)} size="sm">{item.action}</Badge>,
      });
    }
    if (visibleColumns.has("entityType")) {
      cols.push({
        key: "entityType", label: "Entity", sortable: true,
        render: (item) => (
          <span className="text-xs font-medium text-foreground-secondary">{item.entityType}</span>
        ),
      });
    }
    if (visibleColumns.has("entityId")) {
      cols.push({
        key: "entityId", label: "Entity ID",
        render: (item) => (
          <span className="text-xs font-mono text-foreground-muted truncate max-w-[120px] block" title={item.entityId}>
            {item.entityId}
          </span>
        ),
      });
    }
    if (visibleColumns.has("details")) {
      cols.push({
        key: "details", label: "Details",
        render: (item) => (
          <span className="text-xs text-foreground-secondary truncate max-w-[250px] block" title={item.details ?? ""}>
            {item.details ?? "—"}
          </span>
        ),
      });
    }
    if (visibleColumns.has("status")) {
      cols.push({
        key: "success", label: "Status",
        render: (item) => (
          item.success === null ? <span className="text-xs text-foreground-muted">—</span> :
          item.success ? <span className="text-xs text-success">Success</span> :
          <span className="text-xs text-destructive">Failed</span>
        ),
      });
    }
    if (visibleColumns.has("ipAddress")) {
      cols.push({
        key: "ipAddress", label: "IP Address",
        render: (item) => <span className="text-xs text-foreground-muted">{item.ipAddress ?? "—"}</span>,
      });
    }

    return cols;
  }, [visibleColumns]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ action: "", entityType: "", actorId: "", success: "", projectId: "", dateFrom: "", dateTo: "" });
    setSearch("");
    setPage(1);
  };

  return (
    <div>
      <SectionHeader
        title="Audit Center"
        description="Enterprise audit trail with search, filters, and export"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Audit Center" }]}
      />

      {!dashboardLoading && dashboard && (
        <div className="mb-6">
          <AuditCards
            totalEvents={(dashboard.totalEvents as number) ?? 0}
            eventsToday={(dashboard.eventsToday as number) ?? 0}
            eventsThisWeek={(dashboard.eventsThisWeek as number) ?? 0}
            failedOperations={(dashboard.failedOperations as number) ?? 0}
            activeAdmins={(dashboard.activeAdmins as number) ?? 0}
          />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <AdminToolbar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search actions, entities, details..."
            filters={
              <AuditFilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={clearFilters}
                actions={ACTION_OPTIONS}
                entityTypes={ENTITY_TYPE_OPTIONS}
              />
            }
            actions={
              <div className="flex items-center gap-2">
                <button onClick={() => setShowExport(true)}
                  className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground-secondary hover:text-foreground flex items-center gap-1">
                  <Download className="h-3.5 w-3.5" /> Export
                </button>
                <ColumnsDropdown
                  columns={ALL_COLUMNS}
                  visible={visibleColumns}
                  onChange={saveColumnVisibility}
                />
              </div>
            }
          />

          <AdminDataTable
            columns={columns}
            data={logs}
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
            emptyMessage="No audit logs found"
            onRowClick={(item) => router.push(`/admin/audit/${item.id}`)}
          />

          {error && (
            <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
              <button onClick={fetchLogs} className="ml-2 underline hover:no-underline">Retry</button>
            </div>
          )}
        </div>

        <div className="hidden xl:block">
          <div className="rounded-xl border border-border bg-surface p-4 sticky top-4">
            <AuditActivityFeed refreshInterval={15000} maxItems={20} />
          </div>
        </div>
      </div>

      <AuditExportDialog
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        currentFilters={{
          search: search || undefined,
          ...filters,
        }}
      />
    </div>
  );
}

function ColumnsDropdown({
  columns,
  visible,
  onChange,
}: {
  columns: { key: string; label: string; default?: boolean }[];
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

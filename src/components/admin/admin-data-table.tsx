"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { TableColumn, SortDirection } from "@/types/admin";

interface AdminDataTableProps<T extends Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  sortKey?: string;
  sortDirection?: SortDirection;
  onSort?: (key: string) => void;
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  idKey?: string;
  loading?: boolean;
  emptyMessage?: string;
  actions?: (item: T) => React.ReactNode;
  onRowClick?: (item: T) => void;
}

export default function AdminDataTable<T extends Record<string, unknown>>({
  columns,
  data,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  sortKey,
  sortDirection,
  onSort,
  searchable,
  searchValue,
  onSearchChange,
  selectable,
  selectedIds = new Set(),
  onSelectionChange,
  idKey = "id",
  loading,
  emptyMessage = "No data found",
  actions,
  onRowClick,
}: AdminDataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const visibleColumns = useMemo(() => columns.filter((c) => !c.hidden), [columns]);

  const toggleAll = () => {
    if (!onSelectionChange) return;
    if (selectedIds.size === data.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map((item) => String(item[idKey]))));
    }
  };

  const toggleOne = (id: string) => {
    if (!onSelectionChange) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  const renderSortIcon = (key: string) => {
    if (sortKey !== key) return <ChevronsUpDown className="h-3.5 w-3.5 text-foreground-muted" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-3.5 w-3.5 text-accent" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 text-accent" />
    );
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-surface-hover rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {searchable && onSearchChange && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <input
            type="text"
            value={searchValue ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-lg border border-border bg-surface py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-hover">
                {selectable && (
                  <th className="px-4 py-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={data.length > 0 && selectedIds.size === data.length}
                      onChange={toggleAll}
                      className="rounded border-border text-accent focus:ring-accent"
                    />
                  </th>
                )}
                {visibleColumns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left text-xs font-semibold text-foreground-secondary uppercase tracking-wider ${
                      col.sortable ? "cursor-pointer select-none hover:text-foreground" : ""
                    }`}
                    onClick={() => col.sortable && onSort?.(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && renderSortIcon(col.key)}
                    </div>
                  </th>
                ))}
                {actions && <th className="px-4 py-3 text-right w-20"><span className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Actions</span></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} className="px-4 py-12 text-center text-sm text-foreground-muted">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((item) => {
                  const id = String(item[idKey]);
                  return (
                    <tr
                      key={id}
                      className={`transition-colors ${onRowClick ? "cursor-pointer hover:bg-surface-hover" : "hover:bg-surface-hover"}`}
                      onClick={() => onRowClick?.(item)}
                    >
                      {selectable && (
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(id)}
                            onChange={() => toggleOne(id)}
                            className="rounded border-border text-accent focus:ring-accent"
                          />
                        </td>
                      )}
                      {visibleColumns.map((col) => (
                        <td key={col.key} className="px-4 py-3 text-foreground">
                          {col.render ? col.render(item) : String(item[col.key] ?? "")}
                        </td>
                      ))}
                      {actions && (
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          {actions(item)}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-foreground-secondary">
              {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}
            </span>
            {onPageSizeChange && (
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="rounded border border-border bg-surface px-2 py-1 text-xs text-foreground focus:border-accent focus:outline-none"
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>{size} / page</option>
                ))}
              </select>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="rounded-lg border border-border p-2 text-foreground-secondary hover:bg-surface-hover hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const pageNum = start + i;
              if (pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`min-w-[32px] rounded-lg px-2 py-1.5 text-sm font-medium transition-colors ${
                    pageNum === page
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground-secondary hover:bg-surface-hover hover:text-foreground"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="rounded-lg border border-border p-2 text-foreground-secondary hover:bg-surface-hover hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

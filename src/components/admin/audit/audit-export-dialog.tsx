"use client";

import { useState } from "react";
import { Dialog, Button } from "@/components/ui";
import { Download, FileSpreadsheet } from "lucide-react";
import { exportAuditLogs } from "@/services/audit";

interface AuditExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters?: Record<string, string | undefined>;
}

export function AuditExportDialog({ isOpen, onClose, currentFilters }: AuditExportDialogProps) {
  const [format, setFormat] = useState<"csv" | "xlsx">("csv");
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportAuditLogs({
        format,
        search: currentFilters?.search,
        action: currentFilters?.action,
        entityType: currentFilters?.entityType,
        actorId: currentFilters?.actorId,
        success: currentFilters?.success,
        projectId: currentFilters?.projectId,
        dateFrom: currentFilters?.dateFrom,
        dateTo: currentFilters?.dateTo,
      });
      onClose();
    } catch (e) {
      console.error("Export failed:", e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Export Audit Logs" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-foreground-secondary">
          Choose a format for your audit log export. Current filters will be applied.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setFormat("csv")}
            className={`flex-1 rounded-xl border p-4 text-center transition-colors ${
              format === "csv"
                ? "border-accent bg-accent/5 text-accent"
                : "border-border bg-surface text-foreground-secondary hover:border-accent/50"
            }`}
          >
            <Download className="h-6 w-6 mx-auto mb-1" />
            <p className="text-sm font-medium">CSV</p>
            <p className="text-xs mt-1">Comma-separated values</p>
          </button>
          <button
            onClick={() => setFormat("xlsx")}
            className={`flex-1 rounded-xl border p-4 text-center transition-colors ${
              format === "xlsx"
                ? "border-accent bg-accent/5 text-accent"
                : "border-border bg-surface text-foreground-secondary hover:border-accent/50"
            }`}
          >
            <FileSpreadsheet className="h-6 w-6 mx-auto mb-1" />
            <p className="text-sm font-medium">Excel</p>
            <p className="text-xs mt-1">(.xlsx format - CSV export)</p>
          </button>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? "Exporting..." : `Export as ${format.toUpperCase()}`}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

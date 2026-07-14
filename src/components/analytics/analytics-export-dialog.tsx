"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Download } from "lucide-react";

interface AnalyticsExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: "csv" | "json", type: string) => void;
  exporting?: boolean;
}

const EXPORT_TYPES = [
  { value: "dashboard", label: "Dashboard Overview" },
  { value: "velocity", label: "Velocity Data" },
  { value: "burndown", label: "Burndown Data" },
  { value: "burnup", label: "Burnup Data" },
  { value: "cycletime", label: "Cycle Time" },
  { value: "leadtime", label: "Lead Time" },
  { value: "workload", label: "Workload" },
  { value: "team", label: "Team Performance" },
];

export function AnalyticsExportDialog({ isOpen, onClose, onExport, exporting }: AnalyticsExportDialogProps) {
  const [type, setType] = useState("dashboard");
  const [format, setFormat] = useState<"csv" | "json">("csv");

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Export Analytics" size="sm">
      <div className="space-y-4">
        <Select
          label="Data Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={EXPORT_TYPES}
        />
        <Select
          label="Format"
          value={format}
          onChange={(e) => setFormat(e.target.value as "csv" | "json")}
          options={[{ value: "csv", label: "CSV" }, { value: "json", label: "JSON" }]}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="gradient" size="sm" leftIcon={<Download className="h-4 w-4" />} onClick={() => onExport(format, type)} isLoading={exporting}>
            Export
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Download } from "lucide-react";

interface DevOpsExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: "csv" | "json", type: "deployments" | "pipelines" | "dashboard") => void;
  exporting?: boolean;
}

export function DevOpsExportDialog({ isOpen, onClose, onExport, exporting }: DevOpsExportDialogProps) {
  const [type, setType] = useState<"deployments" | "pipelines" | "dashboard">("deployments");
  const [format, setFormat] = useState<"csv" | "json">("csv");

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Export DevOps Data" size="sm">
      <div className="space-y-4">
        <Select
          label="Data Type"
          value={type}
          onChange={(e) => setType(e.target.value as "deployments" | "pipelines" | "dashboard")}
          options={[
            { value: "deployments", label: "Deployments" },
            { value: "pipelines", label: "Pipelines" },
            { value: "dashboard", label: "Dashboard" },
          ]}
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

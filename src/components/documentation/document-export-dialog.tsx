"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Download } from "lucide-react";

interface DocumentExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: "markdown" | "json") => void;
  exporting?: boolean;
}

export function DocumentExportDialog({ isOpen, onClose, onExport, exporting }: DocumentExportDialogProps) {
  const [format, setFormat] = useState<"markdown" | "json">("markdown");

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Export Document" size="sm">
      <div className="space-y-4">
        <Select
          label="Format"
          value={format}
          onChange={(e) => setFormat(e.target.value as "markdown" | "json")}
          options={[{ value: "markdown", label: "Markdown" }, { value: "json", label: "JSON" }]}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="gradient" size="sm" leftIcon={<Download className="h-4 w-4" />} onClick={() => onExport(format)} isLoading={exporting}>
            Export
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

"use client";

import { FileIcon, Download, FileText, Image, FileSpreadsheet, Archive as ArchiveIcon, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";
import type { ProjectFile } from "@/types/project";

interface ProjectFilesProps {
  files: ProjectFile[];
  loading?: boolean;
}

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return FileIcon;
  if (mimeType.startsWith("image/")) return Image;
  if (mimeType.includes("pdf")) return FileText;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv")) return FileSpreadsheet;
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("tar")) return ArchiveIcon;
  return FileText;
}

function formatFileSize(bytes: number | null): string {
  if (bytes === null || bytes === undefined) return "Unknown";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ProjectFiles({ files, loading }: ProjectFilesProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse flex items-center gap-4 rounded-xl border border-border p-4">
            <div className="h-10 w-10 rounded-lg bg-surface-hover" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 rounded bg-surface-hover" />
              <div className="h-3 w-32 rounded bg-surface-hover" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
        <FileIcon className="h-12 w-12 text-foreground-muted mb-4" />
        <h3 className="text-lg font-semibold text-foreground">No Files</h3>
        <p className="mt-1 text-sm text-foreground-secondary">Files attached to tasks will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file) => {
        const FileTypeIcon = getFileIcon(file.mimeType);
        return (
          <div
            key={file.id}
            className="flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-surface-hover/50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-hover">
              <FileTypeIcon className="h-5 w-5 text-foreground-secondary" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{file.fileName}</p>
              <p className="text-xs text-foreground-secondary mt-0.5">
                {formatFileSize(file.fileSize)} &middot; Uploaded by {file.user.name || "Unknown"}
                &middot; {new Date(file.createdAt).toLocaleDateString()}
              </p>
            </div>

            <a
              href={file.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/10 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
          </div>
        );
      })}
    </div>
  );
}

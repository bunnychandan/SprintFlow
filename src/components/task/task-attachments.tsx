"use client";

import { Paperclip, File, Download, Trash2 } from "lucide-react";

interface Attachment {
  id: string; fileName: string; fileUrl: string; fileSize: number | null; mimeType: string | null; createdAt: string;
  user: { id: string; name: string | null; image: string | null };
}

interface TaskAttachmentsProps {
  attachments: Attachment[];
}

export function TaskAttachments({ attachments }: TaskAttachmentsProps) {
  if (attachments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-foreground-muted">
        <Paperclip className="h-8 w-8 mb-2" />
        <p className="text-sm">No attachments yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Paperclip className="h-4 w-4 text-accent" />
        Attachments ({attachments.length})
      </h3>

      <div className="grid gap-2 sm:grid-cols-2">
        {attachments.map((att) => (
          <div key={att.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <File className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{att.fileName}</p>
              <div className="flex items-center gap-2 text-[10px] text-foreground-muted">
                {att.fileSize && <span>{(att.fileSize / 1024).toFixed(1)} KB</span>}
                <span>{att.user.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <a
                href={att.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-1.5 text-foreground-muted hover:text-accent transition-colors"
              >
                <Download className="h-4 w-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

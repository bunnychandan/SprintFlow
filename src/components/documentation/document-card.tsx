"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import { DocumentStatusBadge } from "./document-status-badge";
import { DocumentVisibilityBadge } from "./document-visibility-badge";
import { DocumentFavoriteButton } from "./document-favorite-button";
import { FileText, MessageSquare } from "lucide-react";
import type { DocumentItem } from "@/types/documentation";

interface DocumentCardProps {
  document: DocumentItem;
  onFavoriteToggle?: (id: string) => void;
  className?: string;
}

export function DocumentCard({ document: doc, onFavoriteToggle, className }: DocumentCardProps) {
  return (
    <Card className={cn("p-5 hover:shadow-md transition-all", className)}>
      <div className="flex items-start justify-between mb-2">
        <Link href={`/documents/${doc.id}`} className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-accent shrink-0" />
            <h3 className="text-sm font-semibold text-foreground truncate">{doc.title}</h3>
          </div>
        </Link>
        {onFavoriteToggle && <DocumentFavoriteButton isFavorited={doc.isFavorited} onClick={() => onFavoriteToggle(doc.id)} />}
      </div>
      {doc.excerpt && <p className="text-xs text-foreground-secondary line-clamp-2 mb-3">{doc.excerpt}</p>}
      <div className="flex items-center gap-3 text-xs text-foreground-muted flex-wrap">
        <DocumentStatusBadge status={doc.status} />
        <DocumentVisibilityBadge visibility={doc.visibility} />
        {doc.childCount > 0 && <span>{doc.childCount} children</span>}
        {doc.commentCount > 0 && <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{doc.commentCount}</span>}
        <span>v{doc.version}</span>
      </div>
    </Card>
  );
}

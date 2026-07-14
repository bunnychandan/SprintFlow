"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { MessageSquare, Send } from "lucide-react";
import type { DocumentCommentItem } from "@/types/documentation";

interface DocumentCommentsProps {
  comments: DocumentCommentItem[];
  loading?: boolean;
  onAddComment?: (content: string) => void;
  onEditComment?: (commentId: string, content: string) => void;
  onDeleteComment?: (commentId: string) => void;
  currentUserId?: string;
  className?: string;
}

export function DocumentComments({ comments, loading, onAddComment, onEditComment, onDeleteComment, currentUserId, className }: DocumentCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const handleSubmit = () => {
    if (!newComment.trim() || !onAddComment) return;
    onAddComment(newComment.trim());
    setNewComment("");
  };

  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-4 w-4 text-accent" />
        <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider">Comments ({comments?.length || 0})</h4>
      </div>

      {onAddComment && (
        <div className="flex gap-2 mb-6">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <Button variant="gradient" size="sm" onClick={handleSubmit} disabled={!newComment.trim()} leftIcon={<Send className="h-3.5 w-3.5" />}>Send</Button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => <div key={i} className="animate-pulse h-16 rounded bg-surface-hover" />)}
        </div>
      ) : !comments || comments.length === 0 ? (
        <p className="text-sm text-foreground-muted text-center py-4">No comments yet</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar src={comment.authorImage} name={comment.authorName || undefined} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">{comment.authorName || "Unknown"}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-foreground-muted">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    {currentUserId === comment.authorId && onEditComment && (
                      <button onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }} className="text-[10px] text-accent hover:underline">Edit</button>
                    )}
                    {currentUserId === comment.authorId && onDeleteComment && (
                      <button onClick={() => onDeleteComment(comment.id)} className="text-[10px] text-red-500 hover:underline">Delete</button>
                    )}
                  </div>
                </div>
                {editingId === comment.id ? (
                  <div className="mt-1 flex gap-2">
                    <input value={editContent} onChange={(e) => setEditContent(e.target.value)} className="flex-1 px-2 py-1 bg-surface border border-border rounded text-xs text-foreground focus:outline-none" />
                    <Button variant="gradient" size="sm" onClick={() => { onEditComment?.(comment.id, editContent); setEditingId(null); }}>Save</Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                ) : (
                  <p className="text-xs text-foreground-secondary mt-1">{comment.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

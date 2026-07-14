"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Comment {
  id: string; content: string; createdAt: string;
  author: { id: string; name: string | null; email: string; image: string | null };
}

interface TaskCommentsProps {
  comments: Comment[];
  onAddComment: (content: string) => Promise<any>;
  onDeleteComment: (commentId: string) => Promise<void>;
}

export function TaskComments({ comments, onAddComment, onDeleteComment }: TaskCommentsProps) {
  const { data: session } = useSession();
  const [newComment, setNewComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await onAddComment(newComment.trim());
    setNewComment("");
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Comments ({comments.length})</h3>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {comments.map((comment) => {
          const canDelete = comment.author.id === session?.user?.id ||
            ["SUPER_ADMIN", "ADMIN"].includes(session?.user?.role || "");

          return (
            <div key={comment.id} className="rounded-xl border border-border bg-surface p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar src={comment.author.image} name={comment.author.name ?? undefined} className="h-6 w-6" />
                  <span className="font-semibold text-foreground text-xs">{comment.author.name || comment.author.email}</span>
                  <span className="text-[10px] text-foreground-muted">{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
                {canDelete && (
                  <button onClick={() => onDeleteComment(comment.id)} className="text-foreground-muted hover:text-destructive transition-colors" aria-label="Delete comment">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-xs text-foreground-secondary">{comment.content}</p>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 rounded-xl border border-border bg-surface px-4 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
        />
        <Button variant="primary" size="sm" type="submit" disabled={!newComment.trim()}>
          Comment
        </Button>
      </form>
    </div>
  );
}

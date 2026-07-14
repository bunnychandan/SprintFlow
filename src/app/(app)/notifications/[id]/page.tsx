"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { PageHeader, Button, Badge, Card, ErrorState } from "@/components/ui";
import { useToast } from "@/contexts/toast-context";
import { useNotification } from "@/hooks/use-notifications";
import { NotificationCard } from "@/components/notifications/notification-card";
import { deleteNotification } from "@/services/notifications";
import { useRouter } from "next/navigation";

export default function NotificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { addToast } = useToast();
  const { notification, loading, error, refetch } = useNotification(id);

  if (error) {
    return <ErrorState title="Failed to load notification" message={error} onRetry={refetch} />;
  }

  if (loading || !notification) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-8 w-48 bg-surface-hover rounded" />
        <div className="animate-pulse h-4 w-64 bg-surface-hover rounded mt-4" />
        <div className="animate-pulse h-32 w-full bg-surface-hover rounded-xl mt-6" />
      </div>
    );
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this notification?")) return;
    try {
      await deleteNotification(id);
      addToast({ type: "success", message: "Notification deleted" });
      router.push("/notifications");
    } catch {
      addToast({ type: "error", message: "Failed to delete notification" });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link
          href="/notifications"
          className="p-2 rounded-xl text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader
          title={notification.title}
          subtitle={new Date(notification.createdAt).toLocaleString()}
          metadata={notification.type}
          actions={
            <Button variant="ghost" size="sm" onClick={handleDelete} leftIcon={<Trash2 className="h-4 w-4" />}>
              Delete
            </Button>
          }
        />
      </div>

      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant={notification.priority === "CRITICAL" ? "danger" : notification.priority === "HIGH" ? "warning" : "neutral"} size="md">
            {notification.priority}
          </Badge>
          <Badge variant={notification.isRead ? "neutral" : "info"} size="sm">
            {notification.isRead ? "Read" : "Unread"}
          </Badge>
        </div>

        <p className="text-sm text-foreground leading-relaxed">{notification.message}</p>

        {notification.metadata && (
          <div className="rounded-xl bg-surface-hover/50 p-4">
            <pre className="text-xs text-foreground-secondary font-mono whitespace-pre-wrap">
              {JSON.stringify(notification.metadata, null, 2)}
            </pre>
          </div>
        )}

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-foreground-muted border-t border-border pt-4">
          {notification.actor && (
            <span>Actor: {notification.actor.name || notification.actor.email}</span>
          )}
          {notification.project && (
            <span>Project: {notification.project.name}</span>
          )}
          {notification.task && (
            <span>Task: {notification.task.title}</span>
          )}
          <span>Channel: {notification.channel}</span>
          {notification.readAt && (
            <span>Read: {new Date(notification.readAt).toLocaleString()}</span>
          )}
        </div>
      </Card>
    </div>
  );
}

"use client";

import { Card, Select } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useToast } from "@/contexts/toast-context";
import { useNotificationPreferences } from "@/hooks/use-notification-preferences";
import { ErrorState } from "@/components/ui";
import { Bell, Mail } from "lucide-react";

interface NotificationPreferencesFormProps {
  className?: string;
}

export function NotificationPreferencesForm({ className }: NotificationPreferencesFormProps) {
  const { preferences, loading, saving, error, refetch, save } = useNotificationPreferences();
  const { addToast } = useToast();

  if (error) {
    return <ErrorState title="Failed to load preferences" message={error} onRetry={refetch} />;
  }

  if (loading || !preferences) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-surface p-5 animate-pulse">
            <div className="h-5 w-40 bg-surface-hover rounded mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-8 w-full bg-surface-hover rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const handleToggle = async (field: string, currentValue: boolean) => {
    const success = await save({ [field]: !currentValue });
    if (success) addToast({ type: "success", message: "Preference updated" });
    else addToast({ type: "error", message: "Failed to update preference" });
  };

  const handleDigestChange = async (value: string) => {
    const success = await save({ digestFrequency: value });
    if (success) addToast({ type: "success", message: "Digest frequency updated" });
    else addToast({ type: "error", message: "Failed to update digest frequency" });
  };

  const Toggle = ({ label, field, value }: { label: string; field: string; value: boolean }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-foreground-secondary">{label}</span>
      <button
        onClick={() => handleToggle(field, value)}
        className={`relative w-10 h-5 rounded-full transition-colors ${value ? "bg-accent" : "bg-surface-hover"}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );

  const channelFields = [
    { label: "In-App Notifications", field: "emailNotifications", value: preferences.emailNotifications },
    { label: "Email Notifications", field: "emailNotifications", value: preferences.emailNotifications },
    { label: "Slack Notifications", field: "slackNotifications", value: preferences.slackNotifications },
    { label: "Microsoft Teams", field: "teamsNotifications", value: preferences.teamsNotifications },
    { label: "Push Notifications", field: "pushNotifications", value: preferences.pushNotifications },
  ];

  const typeFields = [
    { label: "Task Assigned", field: "taskAssigned", value: preferences.taskAssigned },
    { label: "Task Updated", field: "taskUpdated", value: preferences.taskUpdated },
    { label: "Task Completed", field: "taskCompleted", value: preferences.taskCompleted },
    { label: "Task Comments", field: "taskComment", value: preferences.taskComment },
    { label: "Mentions", field: "taskMention", value: preferences.taskMention },
    { label: "Sprint Started", field: "sprintStarted", value: preferences.sprintStarted },
    { label: "Sprint Completed", field: "sprintCompleted", value: preferences.sprintCompleted },
    { label: "Project Created", field: "projectCreated", value: preferences.projectCreated },
    { label: "Project Updated", field: "projectUpdated", value: preferences.projectUpdated },
    { label: "Project Archived", field: "projectArchived", value: preferences.projectArchived },
    { label: "User Invited", field: "userInvited", value: preferences.userInvited },
    { label: "User Joined", field: "userJoined", value: preferences.userJoined },
    { label: "Admin Created", field: "adminCreated", value: preferences.adminCreated },
    { label: "System Alerts", field: "systemAlert", value: preferences.systemAlert },
    { label: "Audit Warnings", field: "auditWarning", value: preferences.auditWarning },
    { label: "Security Events", field: "securityEvent", value: preferences.securityEvent },
  ];

  return (
    <div className={cn("space-y-6", className)}>
      <Card className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Mail className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">Digest Settings</h3>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground-secondary">Email Digest Frequency</span>
          <Select
            options={[
              { value: "daily", label: "Daily" },
              { value: "weekly", label: "Weekly" },
              { value: "never", label: "Never" },
            ]}
            value={preferences.digestFrequency}
            onChange={(e) => handleDigestChange(e.target.value)}
            className="max-w-[140px]"
          />
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Bell className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">Delivery Channels</h3>
        </div>
        <div className="divide-y divide-border/50">
          {channelFields.map((f) => <Toggle key={f.field} {...f} />)}
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Bell className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">Notification Types</h3>
        </div>
        <div className="divide-y divide-border/50">
          {typeFields.map((f) => <Toggle key={f.field} {...f} />)}
        </div>
      </Card>
    </div>
  );
}

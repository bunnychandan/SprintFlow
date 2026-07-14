"use client";

import { PageHeader } from "@/components/ui";
import { NotificationPreferencesForm } from "@/components/notifications/notification-preferences-form";
import { Bell } from "lucide-react";

export default function NotificationPreferencesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Preferences"
        subtitle="Control how and when you receive notifications"
        metadata="PREFERENCES"
      />
      <NotificationPreferencesForm />
    </div>
  );
}

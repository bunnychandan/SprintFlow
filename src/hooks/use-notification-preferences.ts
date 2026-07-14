"use client";

import { useState, useEffect, useCallback } from "react";
import { getPreferences, updatePreferences } from "@/services/notifications";
import type { NotificationPreferencesData } from "@/types/admin";

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferencesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPreferences();
      setPreferences(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load preferences");
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(async (data: Partial<NotificationPreferencesData>) => {
    setSaving(true);
    setError(null);
    try {
      const result = await updatePreferences(data);
      setPreferences(result);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save preferences");
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { preferences, loading, saving, error, refetch: fetch, save };
}

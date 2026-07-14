"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getSystemHealthDashboard,
  getSystemHealthHistory,
  runDiagnostics,
  getMonitoringSettings,
  updateMonitoringSettings,
} from "@/services/system-health";
import type {
  SystemHealthDashboard,
  HealthHistoryResponse,
  DiagnosticsResult,
  MonitoringSettingsData,
} from "@/types/admin";

export function useSystemHealth() {
  const [dashboard, setDashboard] = useState<SystemHealthDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSystemHealthDashboard();
      setDashboard(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load system health");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  return { dashboard, loading, error, refetch: fetchDashboard };
}

export function useHealthHistory(period = "24h") {
  const [data, setData] = useState<HealthHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSystemHealthHistory({ period });
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load health history");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useDiagnostics() {
  const [result, setResult] = useState<DiagnosticsResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setRunning(true);
    setError(null);
    try {
      const result = await runDiagnostics();
      setResult(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to run diagnostics");
    } finally {
      setRunning(false);
    }
  }, []);

  return { result, running, error, run };
}

export function useMonitoringSettings() {
  const [settings, setSettings] = useState<MonitoringSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMonitoringSettings();
      setSettings(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(async (data: Partial<MonitoringSettingsData>) => {
    setSaving(true);
    setError(null);
    try {
      const result = await updateMonitoringSettings(data);
      setSettings(result);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save settings");
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { settings, loading, saving, error, refetch: fetch, save };
}

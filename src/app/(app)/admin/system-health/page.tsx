"use client";

import { useState } from "react";
import {
  HeartPulse, Bell, Clock, Stethoscope, Settings2,
  RefreshCw,
} from "lucide-react";
import { Button, Badge, Select, Input, PageHeader } from "@/components/ui";
import { Card } from "@/components/ui";
import { useToast } from "@/contexts/toast-context";
import { useSystemHealth, useHealthHistory, useDiagnostics, useMonitoringSettings } from "@/hooks/use-system-health";
import { useAlerts } from "@/hooks/use-alerts";
import { HealthCard, HealthCardGrid, HealthCardSkeleton } from "@/components/admin/system-health/health-cards";
import { MetricsCards } from "@/components/admin/system-health/metrics-cards";
import { DatabaseStatusCard } from "@/components/admin/system-health/database-status-card";
import { ApiStatusTable } from "@/components/admin/system-health/api-status-table";
import { AlertPanel } from "@/components/admin/system-health/alert-panel";
import { EnvironmentTable } from "@/components/admin/system-health/environment-table";
import { DiagnosticsPanel } from "@/components/admin/system-health/diagnostics-panel";
import { MonitoringChart } from "@/components/admin/system-health/monitoring-chart";
import { HealthTimeline } from "@/components/admin/system-health/health-timeline";
import { ErrorState } from "@/components/ui";

type Tab = "dashboard" | "alerts" | "history" | "diagnostics" | "settings";

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "dashboard", label: "Dashboard", icon: HeartPulse },
  { key: "alerts", label: "Alerts", icon: Bell },
  { key: "history", label: "History", icon: Clock },
  { key: "diagnostics", label: "Diagnostics", icon: Stethoscope },
  { key: "settings", label: "Settings", icon: Settings2 },
];

export default function SystemHealthPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Health & Monitoring"
        subtitle="Enterprise operational visibility and real-time monitoring"
        metadata="SYSTEM HEALTH"
      />

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px ${
                isActive
                  ? "border-accent text-accent"
                  : "border-transparent text-foreground-secondary hover:text-foreground hover:border-border"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "dashboard" && <DashboardContent />}
      {activeTab === "alerts" && <AlertsContent addToast={addToast} />}
      {activeTab === "history" && <HistoryContent />}
      {activeTab === "diagnostics" && <DiagnosticsContent />}
      {activeTab === "settings" && <SettingsContent addToast={addToast} />}
    </div>
  );
}

function DashboardContent() {
  const { dashboard, loading, error, refetch } = useSystemHealth();

  if (error) {
    return <ErrorState title="Failed to load system health" message={error} onRetry={refetch} />;
  }

  if (loading || !dashboard) {
    return (
      <div className="space-y-6">
        <HealthCardGrid>
          {Array.from({ length: 8 }).map((_, i) => <HealthCardSkeleton key={i} />)}
        </HealthCardGrid>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge
            variant={dashboard.overall.status === "HEALTHY" ? "success" : dashboard.overall.status === "WARNING" ? "warning" : "danger"}
            size="md"
          >
            {dashboard.overall.status}
          </Badge>
          <span className="text-sm text-foreground-secondary">{dashboard.overall.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {dashboard.activeAlerts > 0 && (
            <Badge variant="danger" size="md">
              {dashboard.activeAlerts} Active Alert{dashboard.activeAlerts !== 1 ? "s" : ""}
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={refetch} leftIcon={<RefreshCw className="h-4 w-4" />}>
            Refresh
          </Button>
        </div>
      </div>

      <HealthCardGrid>
        <HealthCard name="Database" status={dashboard.services.database.status} label={dashboard.services.database.label} />
        <HealthCard name="API" status={dashboard.services.api.status} label={dashboard.services.api.label} />
        <HealthCard name="Authentication" status={dashboard.services.auth.status} label={dashboard.services.auth.label} />
        <HealthCard name="Storage" status={dashboard.services.storage.status} label={dashboard.services.storage.label} />
        <HealthCard name="Email Provider" status={dashboard.services.email.status} label={dashboard.services.email.label} />
        <HealthCard name="Environment" status={dashboard.services.environment.status} label={dashboard.services.environment.label} />
        <HealthCard name="Background Services" status={dashboard.services.background.status} label={dashboard.services.background.label} />
        <HealthCard name="Overall System" status={dashboard.overall.status} label={dashboard.overall.label} />
      </HealthCardGrid>

      <MetricsCards metrics={dashboard.metrics} />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <DatabaseStatusCard database={dashboard.database} />
        <AlertPanel alerts={[]} />
      </div>

      <ApiStatusTable endpoints={dashboard.apiEndpoints} />

      <EnvironmentTable environment={dashboard.environment} />
    </div>
  );
}

function AlertsContent({ addToast }: { addToast: (t: { type: "success" | "error"; message: string }) => void }) {
  const { data, loading, refetch, resolve } = useAlerts({ pageSize: 50 });
  const [showResolved, setShowResolved] = useState(false);

  const alerts = data?.alerts || [];
  const filtered = showResolved ? alerts : alerts.filter((a) => a.status === "ACTIVE");

  const handleResolve = async (id: string) => {
    try {
      await resolve(id);
      addToast({ type: "success", message: "Alert resolved" });
    } catch {
      addToast({ type: "error", message: "Failed to resolve alert" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground-secondary">{filtered.length} alert{filtered.length !== 1 ? "s" : ""}</span>
          <button
            onClick={() => setShowResolved(!showResolved)}
            className="text-xs text-accent hover:text-accent-hover"
          >
            {showResolved ? "Hide resolved" : "Show resolved"}
          </button>
        </div>
      </div>
      <AlertPanel alerts={filtered} onResolve={handleResolve} loading={loading} />
    </div>
  );
}

function HistoryContent() {
  const [period, setPeriod] = useState("24h");
  const { data, loading, refetch } = useHealthHistory(period);
  const snapshots = data?.snapshots || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Select
          options={[
            { value: "24h", label: "Last 24 Hours" },
            { value: "7d", label: "Last 7 Days" },
            { value: "30d", label: "Last 30 Days" },
          ]}
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="max-w-[180px]"
        />
        <Button variant="ghost" size="sm" onClick={refetch} leftIcon={<RefreshCw className="h-4 w-4" />}>
          Refresh
        </Button>
      </div>
      <MonitoringChart data={snapshots} />
      <HealthTimeline data={snapshots} />
    </div>
  );
}

function DiagnosticsContent() {
  const { result, running, run } = useDiagnostics();

  return (
    <div className="space-y-4">
      <DiagnosticsPanel result={result} running={running} onRun={run} />
    </div>
  );
}

function SettingsContent({ addToast }: { addToast: (t: { type: "success" | "error"; message: string }) => void }) {
  const { settings, loading, saving, refetch, save } = useMonitoringSettings();

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-surface p-5 animate-pulse">
            <div className="h-5 w-40 bg-surface-hover rounded mb-4" />
            <div className="h-10 w-full bg-surface-hover rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!settings) {
    return <ErrorState title="Settings not found" message="Monitoring configuration could not be loaded" onRetry={refetch} />;
  }

  const handleSave = async (field: string, value: unknown) => {
    const success = await save({ [field]: value });
    if (success) {
      addToast({ type: "success", message: "Setting updated" });
    } else {
      addToast({ type: "error", message: "Failed to update setting" });
    }
  };

  const sections = [
    {
      title: "Health Check Configuration",
      icon: HeartPulse,
      fields: [
        { key: "healthCheckInterval", label: "Health Check Interval (seconds)", type: "number", value: settings.healthCheckInterval },
        { key: "pollingFrequency", label: "Polling Frequency (seconds)", type: "number", value: settings.pollingFrequency },
        { key: "monitoringEnabled", label: "Monitoring Enabled", type: "checkbox", value: settings.monitoringEnabled },
      ],
    },
    {
      title: "Alert Thresholds",
      icon: Bell,
      fields: [
        { key: "alertThresholdWarning", label: "Warning Threshold (ms)", type: "number", value: settings.alertThresholdWarning },
        { key: "alertThresholdCritical", label: "Critical Threshold (ms)", type: "number", value: settings.alertThresholdCritical },
        { key: "apiResponseThreshold", label: "API Response Threshold (ms)", type: "number", value: settings.apiResponseThreshold },
        { key: "errorRateThreshold", label: "Error Rate Threshold (%)", type: "number", value: settings.errorRateThreshold },
      ],
    },
    {
      title: "Resource Thresholds",
      icon: ActivityIcon,
      fields: [
        { key: "memoryThresholdMB", label: "Memory Threshold (MB)", type: "number", value: settings.memoryThresholdMB },
        { key: "diskThresholdPercent", label: "Disk Threshold (%)", type: "number", value: settings.diskThresholdPercent },
      ],
    },
    {
      title: "Data Management",
      icon: DatabaseIcon,
      fields: [
        { key: "logRetention", label: "Log Retention (days)", type: "number", value: settings.logRetention },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {sections.map((section) => {
        const SectionIcon = section.icon;
        return (
          <Card key={section.title} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <SectionIcon className="h-4 w-4 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
            </div>
            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.key} className="flex items-center justify-between gap-4">
                  <label className="text-sm text-foreground-secondary">{field.label}</label>
                  {field.type === "checkbox" ? (
                    <button
                      onClick={() => handleSave(field.key, !field.value)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        field.value ? "bg-accent" : "bg-surface-hover"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                          field.value ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  ) : (
                    <Input
                      type="number"
                      value={String(field.value)}
                      onChange={(e) => handleSave(field.key, parseInt(e.target.value) || 0)}
                      className="max-w-[120px] text-right"
                    />
                  )}
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function DatabaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

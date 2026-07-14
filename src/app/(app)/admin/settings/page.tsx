"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Save, Plus, Trash2, Building2, Palette, ToggleLeft, Calendar, Shield, FileText, Bell, BarChart3 } from "lucide-react";
import SectionHeader from "@/components/admin/section-header";
import { Card, Button, Badge, Dialog } from "@/components/ui";
import { OrgProfileForm } from "@/components/admin/organization/org-profile-form";
import { BrandPreview } from "@/components/admin/organization/brand-preview";
import { FeatureFlagToggle } from "@/components/admin/organization/feature-flag-toggle";
import { AnalyticsCards } from "@/components/admin/organization/analytics-cards";
import {
  getOrganization, updateOrganization,
  getOrgSettings, updateOrgSettings,
  getOrgBranding, updateOrgBranding,
  getFeatureFlags, updateFeatureFlags,
  getHolidays, createHoliday, deleteHoliday,
  getOrgAnalytics,
} from "@/services/organization";
import { useToast } from "@/contexts/toast-context";

type Tab = "profile" | "branding" | "features" | "calendar" | "policies" | "files" | "notifications" | "analytics";

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "profile", label: "Profile", icon: Building2 },
  { key: "branding", label: "Branding", icon: Palette },
  { key: "features", label: "Feature Flags", icon: ToggleLeft },
  { key: "calendar", label: "Working Calendar", icon: Calendar },
  { key: "policies", label: "Invitation Policies", icon: Shield },
  { key: "files", label: "File Management", icon: FileText },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function OrgSettingsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const [organization, setOrganization] = useState<Record<string, unknown> | null>(null);
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const [branding, setBranding] = useState<Record<string, unknown> | null>(null);
  const [featureFlags, setFeatureFlags] = useState<Array<Record<string, unknown>>>([]);
  const [holidays, setHolidays] = useState<Array<Record<string, unknown>>>([]);
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidayForm, setHolidayForm] = useState({ name: "", date: "", type: "PUBLIC", region: "", recurring: false });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [orgRes, settingsRes, brandingRes, flagsRes, holidaysRes, analyticsRes] = await Promise.all([
        getOrganization(), getOrgSettings(), getOrgBranding(), getFeatureFlags(), getHolidays(), getOrgAnalytics(),
      ]);
      setOrganization(orgRes.organization);
      setSettings(settingsRes.settings);
      setBranding(brandingRes.branding);
      setFeatureFlags(flagsRes.featureFlags ?? []);
      setHolidays(holidaysRes.holidays ?? []);
      setAnalytics(analyticsRes);
    } catch (e) {
      addToast({ message: e instanceof Error ? e.message : "Failed to load settings", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSaveProfile = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await updateOrganization(data);
      setOrganization(res.organization);
      addToast({ message: "Organization profile updated", type: "success" });
    } catch (e) {
      addToast({ message: e instanceof Error ? e.message : "Failed to save", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await updateOrgSettings(data);
      setSettings(res.settings);
      addToast({ message: "Settings updated", type: "success" });
    } catch (e) {
      addToast({ message: e instanceof Error ? e.message : "Failed to save", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBranding = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await updateOrgBranding(data);
      setBranding(res.branding);
      addToast({ message: "Branding updated", type: "success" });
    } catch (e) {
      addToast({ message: e instanceof Error ? e.message : "Failed to save", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFlag = async (key: string, enabled: boolean) => {
    try {
      const updated = featureFlags.map((f) => f.key === key ? { ...f, enabled } : f);
      setFeatureFlags(updated);
      await updateFeatureFlags(updated.map((f) => ({ key: f.key as string, enabled: f.enabled as boolean })));
      addToast({ message: `Feature "${key}" ${enabled ? "enabled" : "disabled"}`, type: "success" });
    } catch (e) {
      addToast({ message: e instanceof Error ? e.message : "Failed to toggle", type: "error" });
      fetchAll();
    }
  };

  const handleCreateHoliday = async () => {
    if (!holidayForm.name || !holidayForm.date) return;
    try {
      await createHoliday(holidayForm);
      setShowHolidayModal(false);
      setHolidayForm({ name: "", date: "", type: "PUBLIC", region: "", recurring: false });
      addToast({ message: "Holiday created", type: "success" });
      const res = await getHolidays();
      setHolidays(res.holidays ?? []);
    } catch (e) {
      addToast({ message: e instanceof Error ? e.message : "Failed to create holiday", type: "error" });
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    try {
      await deleteHoliday(id);
      addToast({ message: "Holiday deleted", type: "success" });
      setHolidays((prev) => prev.filter((h) => h.id !== id));
    } catch (e) {
      addToast({ message: e instanceof Error ? e.message : "Failed to delete", type: "error" });
    }
  };

  const brandingData = branding as Record<string, string> | null;
  const settingsData = settings as Record<string, unknown> | null;

  if (loading) {
    return (
      <div className="p-6 animate-pulse space-y-4">
        <div className="h-8 w-64 bg-foreground-muted/20 rounded" />
        <div className="h-96 bg-foreground-muted/20 rounded-xl" />
      </div>
    );
  }

  return (
    <div>
      <SectionHeader
        title="Organization Center"
        description="Enterprise-wide configuration and settings"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Organization" }]}
      />

      <div className="flex gap-1 mb-6 overflow-x-auto pb-2 border-b border-border">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "text-accent border-b-2 border-accent bg-accent/5"
                  : "text-foreground-secondary hover:text-foreground hover:bg-surface-hover"
              }`}>
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "profile" && organization && (
        <OrgProfileForm organization={organization} onSave={handleSaveProfile} saving={saving} />
      )}

      {activeTab === "branding" && brandingData && (
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Branding Settings</h3>
            <div className="space-y-4">
              {["primaryColor", "secondaryColor", "accentColor"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-foreground mb-1 capitalize">{field.replace(/([A-Z])/g, " $1")}</label>
                  <div className="flex gap-2">
                    <input type="color" value={brandingData[field] ?? "#000000"}
                      onChange={(e) => setBranding({ ...brandingData, [field]: e.target.value })}
                      className="h-10 w-10 rounded-lg border border-border cursor-pointer" />
                    <input type="text" value={brandingData[field] ?? ""}
                      onChange={(e) => setBranding({ ...brandingData, [field]: e.target.value })}
                      className="flex-1 rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground font-mono focus:border-accent focus:outline-none" />
                  </div>
                </div>
              ))}
              <div className="pt-4">
                <Button onClick={() => handleSaveBranding(brandingData)} disabled={saving}>
                  <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save Branding"}
                </Button>
              </div>
            </div>
          </Card>
          <BrandPreview
            primaryColor={brandingData.primaryColor ?? "#2563eb"}
            secondaryColor={brandingData.secondaryColor ?? "#64748b"}
            accentColor={brandingData.accentColor ?? "#f59e0b"}
          />
        </div>
      )}

      {activeTab === "features" && (
        <Card variant="glass" className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Feature Flags</h3>
          <p className="text-sm text-foreground-secondary mb-4">Enable or disable platform modules.</p>
          <div className="space-y-3">
            {featureFlags.map((flag) => (
              <FeatureFlagToggle
                key={flag.key as string}
                label={flag.label as string}
                description={flag.description as string}
                enabled={flag.enabled as boolean}
                onChange={(enabled) => handleToggleFlag(flag.key as string, enabled)}
              />
            ))}
          </div>
        </Card>
      )}

      {activeTab === "calendar" && settingsData && (
        <div className="space-y-6">
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Working Days & Hours</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Working Days</label>
                <div className="flex flex-wrap gap-2">
                  {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((day, i) => {
                    const workingDays = (settingsData.workingDays as string ?? "1,2,3,4,5").split(",").map(Number);
                    const isSelected = workingDays.includes(i);
                    return (
                      <button key={day} onClick={() => {
                        const current = new Set(workingDays);
                        if (isSelected) current.delete(i);
                        else current.add(i);
                        handleSaveSettings({ workingDays: [...current].sort().join(",") });
                      }}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                          isSelected ? "bg-accent text-white border-accent" : "bg-surface text-foreground-secondary border-border hover:border-accent"
                        }`}>
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Default Sprint Days</label>
                <input type="number" value={settingsData.defaultSprintDays as number ?? 14}
                  onChange={(e) => handleSaveSettings({ defaultSprintDays: parseInt(e.target.value) || 14 })}
                  className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Business Hours Start</label>
                <input type="time" value={settingsData.businessHourStart as string ?? "09:00"}
                  onChange={(e) => handleSaveSettings({ businessHourStart: e.target.value })}
                  className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Business Hours End</label>
                <input type="time" value={settingsData.businessHourEnd as string ?? "17:00"}
                  onChange={(e) => handleSaveSettings({ businessHourEnd: e.target.value })}
                  className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none" />
              </div>
            </div>
          </Card>

          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Holidays</h3>
              <Button size="sm" onClick={() => setShowHolidayModal(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Holiday
              </Button>
            </div>
            {holidays.length === 0 ? (
              <p className="text-sm text-foreground-muted">No holidays configured yet.</p>
            ) : (
              <div className="space-y-2">
                {holidays.map((h) => (
                  <div key={h.id as string} className="flex items-center justify-between rounded-lg border border-border bg-surface p-3">
                    <div className="flex items-center gap-3">
                      <Badge variant={h.type === "PUBLIC" ? "success" : "warning"} size="sm">{h.type as string}</Badge>
                      <span className="text-sm text-foreground font-medium">{h.name as string}</span>
                      <span className="text-xs text-foreground-secondary">{new Date(h.date as string).toLocaleDateString()}</span>
                      {(h.recurring as boolean) && <Badge variant="neutral" size="sm">Recurring</Badge>}
                    </div>
                    <button onClick={() => handleDeleteHoliday(h.id as string)} className="p-1 text-foreground-secondary hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Dialog isOpen={showHolidayModal} onClose={() => setShowHolidayModal(false)} title="Add Holiday" size="sm">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
                <input type="text" value={holidayForm.name} onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                  className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Date *</label>
                <input type="date" value={holidayForm.date} onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                  className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Type</label>
                <select value={holidayForm.type} onChange={(e) => setHolidayForm({ ...holidayForm, type: e.target.value })}
                  className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none">
                  <option value="PUBLIC">Public</option>
                  <option value="REGIONAL">Regional</option>
                  <option value="COMPANY">Company</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input type="checkbox" checked={holidayForm.recurring} onChange={(e) => setHolidayForm({ ...holidayForm, recurring: e.target.checked })}
                    className="rounded border-border" />
                  Recurring annually
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setShowHolidayModal(false)}>Cancel</Button>
                <Button onClick={handleCreateHoliday}>Add Holiday</Button>
              </div>
            </div>
          </Dialog>
        </div>
      )}

      {activeTab === "policies" && settingsData && (
        <Card variant="glass" className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Invitation Policies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Invitation Expiration (days)</label>
              <input type="number" value={settingsData.invitationExpirationDays as number ?? 7}
                onChange={(e) => setSettings({ ...settingsData, invitationExpirationDays: parseInt(e.target.value) || 7 })}
                className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Max Active Invitations</label>
              <input type="number" value={settingsData.maxActiveInvitations as number ?? 100}
                onChange={(e) => setSettings({ ...settingsData, maxActiveInvitations: parseInt(e.target.value) || 100 })}
                className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Default Invitation Type</label>
              <select value={settingsData.defaultInvitationType as string ?? "USER"}
                onChange={(e) => setSettings({ ...settingsData, defaultInvitationType: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none">
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Allowed Domains (comma-separated)</label>
              <input type="text" value={settingsData.allowedDomains as string ?? ""}
                onChange={(e) => setSettings({ ...settingsData, allowedDomains: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none" placeholder="company.com, partner.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Blocked Domains (comma-separated)</label>
              <input type="text" value={settingsData.blockedDomains as string ?? ""}
                onChange={(e) => setSettings({ ...settingsData, blockedDomains: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none" />
            </div>
            <div className="flex items-center gap-6 pt-6">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={settingsData.autoExpireInvitations as boolean ?? true}
                  onChange={(e) => setSettings({ ...settingsData, autoExpireInvitations: e.target.checked })}
                  className="rounded border-border" />
                Auto-expire invitations
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={settingsData.requireApproval as boolean ?? false}
                  onChange={(e) => setSettings({ ...settingsData, requireApproval: e.target.checked })}
                  className="rounded border-border" />
                Require approval
              </label>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => handleSaveSettings(settingsData)} disabled={saving}>
              <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save Policies"}
            </Button>
          </div>
        </Card>
      )}

      {activeTab === "files" && settingsData && (
        <Card variant="glass" className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">File Management Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Max Upload Size (MB)</label>
              <input type="number" value={settingsData.maxUploadSize as number ?? 10}
                onChange={(e) => setSettings({ ...settingsData, maxUploadSize: parseInt(e.target.value) || 10 })}
                className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Allowed File Types</label>
              <input type="text" value={settingsData.allowedFileTypes as string ?? ""}
                onChange={(e) => setSettings({ ...settingsData, allowedFileTypes: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Attachment Retention (days)</label>
              <input type="number" value={settingsData.attachmentRetention as number ?? 365}
                onChange={(e) => setSettings({ ...settingsData, attachmentRetention: parseInt(e.target.value) || 365 })}
                className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Storage Provider</label>
              <select value={settingsData.storageProvider as string ?? "local"}
                onChange={(e) => setSettings({ ...settingsData, storageProvider: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none">
                <option value="local">Local</option>
                <option value="s3">Amazon S3 (Future)</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => handleSaveSettings(settingsData)} disabled={saving}>
              <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save File Settings"}
            </Button>
          </div>
        </Card>
      )}

      {activeTab === "notifications" && settingsData && (
        <Card variant="glass" className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Notification Settings</h3>
          <div className="space-y-4">
            {[
              { key: "emailNotifications", label: "Email Notifications" },
              { key: "inAppNotifications", label: "In-App Notifications" },
              { key: "projectNotifications", label: "Project Notifications" },
              { key: "sprintNotifications", label: "Sprint Notifications" },
              { key: "taskNotifications", label: "Task Notifications" },
              { key: "mentionNotifications", label: "Mention Notifications" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between rounded-lg border border-border bg-surface p-3 cursor-pointer">
                <span className="text-sm text-foreground">{label}</span>
                <input type="checkbox" checked={(settingsData[key] as boolean) ?? false}
                  onChange={(e) => setSettings({ ...settingsData, [key]: e.target.checked })}
                  className="rounded border-border h-4 w-4" />
              </label>
            ))}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1 mt-4">Digest Frequency</label>
              <select value={settingsData.digestFrequency as string ?? "daily"}
                onChange={(e) => setSettings({ ...settingsData, digestFrequency: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="never">Never</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => handleSaveSettings(settingsData)} disabled={saving}>
              <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save Notification Settings"}
            </Button>
          </div>
        </Card>
      )}

      {activeTab === "analytics" && analytics && (
        <AnalyticsCards
          totalUsers={(analytics.totalUsers as number) ?? 0}
          activeUsers={(analytics.activeUsers as number) ?? 0}
          totalAdmins={(analytics.totalAdmins as number) ?? 0}
          totalProjects={(analytics.totalProjects as number) ?? 0}
          totalInvitations={(analytics.totalInvitations as number) ?? 0}
          totalAuditEvents={(analytics.totalAuditEvents as number) ?? 0}
          orgAgeDays={(analytics.orgAgeDays as number) ?? 0}
          totalFeatureFlags={(analytics.totalFeatureFlags as number) ?? 0}
        />
      )}
    </div>
  );
}

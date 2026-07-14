"use client";

import { useState } from "react";
import { Card, Button } from "@/components/ui";
import { Save } from "lucide-react";

interface OrgProfileFormProps {
  organization: Record<string, unknown>;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  saving?: boolean;
}

export function OrgProfileForm({ organization, onSave, saving }: OrgProfileFormProps) {
  const [form, setForm] = useState<Record<string, string>>({
    name: (organization.name as string) ?? "",
    displayName: (organization.displayName as string) ?? "",
    email: (organization.email as string) ?? "",
    supportEmail: (organization.supportEmail as string) ?? "",
    website: (organization.website as string) ?? "",
    phone: (organization.phone as string) ?? "",
    address: (organization.address as string) ?? "",
    timezone: (organization.timezone as string) ?? "UTC",
    currency: (organization.currency as string) ?? "USD",
    locale: (organization.locale as string) ?? "en-US",
    dateFormat: (organization.dateFormat as string) ?? "MM/DD/YYYY",
    timeFormat: (organization.timeFormat as string) ?? "12h",
    fiscalYearStart: (organization.fiscalYearStart as string) ?? "",
  });

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-6">
      <Card variant="glass" className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Organization Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Organization Name *</label>
            <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
              className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Display Name</label>
            <input type="text" value={form.displayName} onChange={(e) => set("displayName", e.target.value)}
              className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Organization Email</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
              className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Support Email</label>
            <input type="email" value={form.supportEmail} onChange={(e) => set("supportEmail", e.target.value)}
              className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Website</label>
            <input type="url" value={form.website} onChange={(e) => set("website", e.target.value)}
              className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)}
              className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1">Address</label>
            <textarea value={form.address} onChange={(e) => set("address", e.target.value)} rows={2}
              className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none" />
          </div>
        </div>
      </Card>

      <Card variant="glass" className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Regional Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Time Zone</label>
            <select value={form.timezone} onChange={(e) => set("timezone", e.target.value)}
              className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none">
              <option value="UTC">UTC</option>
              <option value="US/Eastern">US/Eastern</option>
              <option value="US/Central">US/Central</option>
              <option value="US/Mountain">US/Mountain</option>
              <option value="US/Pacific">US/Pacific</option>
              <option value="Europe/London">Europe/London</option>
              <option value="Europe/Berlin">Europe/Berlin</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
              <option value="Asia/Shanghai">Asia/Shanghai</option>
              <option value="Asia/Kolkata">Asia/Kolkata</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Currency</label>
            <select value={form.currency} onChange={(e) => set("currency", e.target.value)}
              className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none">
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Locale</label>
            <select value={form.locale} onChange={(e) => set("locale", e.target.value)}
              className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none">
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="de-DE">German</option>
              <option value="ja-JP">Japanese</option>
              <option value="zh-CN">Chinese</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Date Format</label>
            <select value={form.dateFormat} onChange={(e) => set("dateFormat", e.target.value)}
              className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none">
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Time Format</label>
            <select value={form.timeFormat} onChange={(e) => set("timeFormat", e.target.value)}
              className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none">
              <option value="12h">12-hour (AM/PM)</option>
              <option value="24h">24-hour</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Fiscal Year Start (MM-DD)</label>
            <input type="text" value={form.fiscalYearStart} onChange={(e) => set("fiscalYearStart", e.target.value)} placeholder="01-01"
              className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-sm text-foreground focus:border-accent focus:outline-none" />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => onSave(form)} disabled={saving}>
          <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

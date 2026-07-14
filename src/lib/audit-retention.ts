interface RetentionEntry {
  label: string;
  days: number | null;
  default?: boolean;
}

export const RETENTION_PERIODS: RetentionEntry[] = [
  { label: "30 Days", days: 30 },
  { label: "90 Days", days: 90, default: true },
  { label: "180 Days", days: 180 },
  { label: "365 Days", days: 365 },
  { label: "Forever", days: null },
];

export type RetentionPeriod = RetentionEntry;

export function getRetentionPeriod(): RetentionPeriod {
  const configured = process.env.AUDIT_RETENTION_DAYS;
  if (!configured) return RETENTION_PERIODS.find((p) => p.default)!;
  const days = parseInt(configured, 10);
  const match = RETENTION_PERIODS.find((p) => p.days === days);
  return match ?? RETENTION_PERIODS.find((p) => p.default)!;
}

export function getRetentionCutoff(): Date | null {
  const period = getRetentionPeriod();
  if (period.days === null) return null;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - period.days);
  return cutoff;
}

export function isRetentionExpired(date: Date): boolean {
  const cutoff = getRetentionCutoff();
  if (cutoff === null) return false;
  return date < cutoff;
}

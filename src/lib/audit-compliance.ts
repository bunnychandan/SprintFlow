export const AUDIT_VERSION = 1;

export const COMPLIANCE_FLAGS = {
  immutable: true,
  readOnlyHistory: true,
  tamperDetection: false,
  auditVersioning: true,
  correlationIds: true,
  requestIds: true,
  complianceFlags: false,
  blockchain: false,
  encryption: false,
} as const;

export interface ComplianceMetadata {
  version: number;
  immutable: boolean;
  createdAt: string;
  checksum?: string;
}

export function createComplianceMetadata(): ComplianceMetadata {
  return {
    version: AUDIT_VERSION,
    immutable: true,
    createdAt: new Date().toISOString(),
  };
}

export function verifyAuditIntegrity(metadata: ComplianceMetadata): boolean {
  if (!metadata.immutable) return false;
  if (metadata.version !== AUDIT_VERSION) return false;
  return true;
}

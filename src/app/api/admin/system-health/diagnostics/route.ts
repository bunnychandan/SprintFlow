import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/authz";

export async function POST(request: Request) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

  const checks = [];

  const dbCheck = await runDbConnectivityTest();
  checks.push(dbCheck);

  const prismaCheck = await runPrismaValidation();
  checks.push(prismaCheck);

  const envCheck = runEnvironmentValidation();
  checks.push(envCheck);

  const emailCheck = runEmailProviderTest();
  checks.push(emailCheck);

  const oauthCheck = runOAuthConfigCheck();
  checks.push(oauthCheck);

  const storageCheck = runStorageProviderCheck();
  checks.push(storageCheck);

  const pass = checks.filter((c) => c.status === "PASS").length;
  const fail = checks.filter((c) => c.status === "FAIL").length;
  const warning = checks.filter((c) => c.status === "WARNING").length;

  const actorId = auth.user?.id;
  if (actorId) {
    await prisma.auditLog.create({
      data: {
        actorId,
        entityType: "SYSTEM_HEALTH",
        entityId: "diagnostics",
        action: "RUN_DIAGNOSTICS",
        details: `Diagnostics: ${pass} passed, ${fail} failed, ${warning} warnings`,
        metadata: { checks: checks.map((c) => ({ name: c.name, status: c.status })) },
        success: fail === 0,
      },
    });
  }

  return NextResponse.json({
    checks,
    timestamp: new Date().toISOString(),
    summary: { pass, fail, warning, total: checks.length },
  });
}

async function runDbConnectivityTest() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const ms = Date.now() - start;
    return {
      name: "Database Connectivity",
      status: "PASS" as const,
      message: `Connected successfully (${ms}ms)`,
      details: `Query completed in ${ms}ms`,
    };
  } catch (e) {
    return {
      name: "Database Connectivity",
      status: "FAIL" as const,
      message: "Failed to connect to database",
      details: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

async function runPrismaValidation() {
  try {
    const models = Object.keys(prisma).filter((k) => !k.startsWith("_") && !k.startsWith("$"));
    return {
      name: "Prisma Validation",
      status: "PASS" as const,
      message: `Prisma client valid (${models.length} models)`,
      details: `Models: ${models.join(", ")}`,
    };
  } catch (e) {
    return {
      name: "Prisma Validation",
      status: "FAIL" as const,
      message: "Prisma client validation failed",
      details: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

function runEnvironmentValidation() {
  const missing: string[] = [];
  const required = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];
  for (const key of required) {
    if (!process.env[key]) missing.push(key);
  }
  if (missing.length === 0) {
    return {
      name: "Environment Validation",
      status: "PASS" as const,
      message: "All required environment variables set",
      details: `Checked ${required.length} variables`,
    };
  }
  return {
    name: "Environment Validation",
    status: "WARNING" as const,
    message: `${missing.length} required variable(s) missing`,
    details: `Missing: ${missing.join(", ")}`,
  };
}

function runEmailProviderTest() {
  const hasSmtp = !!process.env.SMTP_HOST;
  const hasSendgrid = !!process.env.SENDGRID_API_KEY;
  const hasSes = !!process.env.AWS_SES_REGION;
  const provider = hasSmtp ? "SMTP" : hasSendgrid ? "SendGrid" : hasSes ? "SES" : "Logger";

  return {
    name: "Email Provider",
    status: hasSmtp || hasSendgrid || hasSes ? "PASS" as const : "WARNING" as const,
    message: `Provider: ${provider}`,
    details: provider === "Logger" ? "Using logger provider. Set SMTP/SendGrid/SES for production." : `${provider} configured`,
  };
}

function runOAuthConfigCheck() {
  const hasGoogleId = !!process.env.GOOGLE_CLIENT_ID;
  const hasGoogleSecret = !!process.env.GOOGLE_CLIENT_SECRET;
  const hasNexauthSecret = !!process.env.NEXTAUTH_SECRET;

  if (hasGoogleId && hasGoogleSecret && hasNexauthSecret) {
    return {
      name: "OAuth Configuration",
      status: "PASS" as const,
      message: "Google OAuth fully configured",
      details: "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET all set",
    };
  }
  return {
    name: "OAuth Configuration",
    status: "WARNING" as const,
    message: "OAuth partially configured",
    details: `Google ID: ${hasGoogleId ? "✓" : "✗"}, Google Secret: ${hasGoogleSecret ? "✓" : "✗"}, Auth Secret: ${hasNexauthSecret ? "✓" : "✗"}`,
  };
}

function runStorageProviderCheck() {
  const hasS3Bucket = !!process.env.S3_BUCKET;
  const hasStorageUrl = !!process.env.STORAGE_URL;

  return {
    name: "Storage Provider",
    status: "PASS" as const,
    message: hasS3Bucket ? "S3 storage configured" : "Using local storage",
    details: hasS3Bucket
      ? `Bucket: ${process.env.S3_BUCKET}`
      : hasStorageUrl
      ? `URL: ${process.env.STORAGE_URL}`
      : "Local filesystem (suitable for development)",
  };
}

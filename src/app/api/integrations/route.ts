import { requireRole } from "@/lib/authz";
import { NextRequest, NextResponse } from "next/server";
import { getIntegrationsList, createIntegration } from "@/lib/integrations/service";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(req: NextRequest) {
  try {
    const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
    if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });
    const orgId = req.nextUrl.searchParams.get("organizationId") || "";
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const pageSize = parseInt(req.nextUrl.searchParams.get("pageSize") || "20");
    const search = req.nextUrl.searchParams.get("search") || undefined;
    const provider = req.nextUrl.searchParams.get("provider") || undefined;
    const status = req.nextUrl.searchParams.get("status") || undefined;
    const result = await getIntegrationsList(orgId, { page, pageSize, search, provider, status });
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, "GET /api/integrations");
  }
}

export async function POST(req: NextRequest) {
  try {
    const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
    if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });
    const body = await req.json();
    const orgId = body.organizationId || "";
    const integration = await createIntegration(orgId, authz.user!.id, body);
    return NextResponse.json(integration, { status: 201 });
  } catch (error) {
    return handleApiError(error, "POST /api/integrations");
  }
}

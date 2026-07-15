import { requireRole } from "@/lib/authz";
import { NextRequest, NextResponse } from "next/server";
import { getIntegrationDashboard } from "@/lib/integrations/service";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(req: NextRequest) {
  try {
    const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
    if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });
    const orgId = req.nextUrl.searchParams.get("organizationId") || "";
    const dashboard = await getIntegrationDashboard(orgId);
    return NextResponse.json(dashboard);
  } catch (error) {
    return handleApiError(error, "GET /api/integrations/dashboard");
  }
}

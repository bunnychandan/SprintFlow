import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { getIntegrationDashboard } from "@/lib/integrations/service";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const orgId = req.nextUrl.searchParams.get("organizationId") || "";
    const dashboard = await getIntegrationDashboard(orgId);
    return NextResponse.json(dashboard);
  } catch (error) {
    return handleApiError(error, "GET /api/integrations/dashboard");
  }
}

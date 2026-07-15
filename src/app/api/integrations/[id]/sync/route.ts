import { requireRole } from "@/lib/authz";
import { NextRequest, NextResponse } from "next/server";
import { syncIntegration } from "@/lib/integrations/service";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
    if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });
    const body = await req.json();
    const orgId = body.organizationId || "";
    const result = await syncIntegration(id, orgId, authz.user!.id);
    if (!result) return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, "POST /api/integrations/[id]/sync");
  }
}

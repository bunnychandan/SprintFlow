import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { getIntegrationById, updateIntegration, deleteIntegration } from "@/lib/integrations/service";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const orgId = req.nextUrl.searchParams.get("organizationId") || "";
    const integration = await getIntegrationById(id, orgId);
    if (!integration) return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    return NextResponse.json(integration);
  } catch (error) {
    return handleApiError(error, "GET /api/integrations/[id]");
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const orgId = body.organizationId || "";
    const result = await updateIntegration(id, orgId, body);
    if (!result) return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, "PATCH /api/integrations/[id]");
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const orgId = body.organizationId || "";
    const deleted = await deleteIntegration(id, orgId, session.user.id);
    if (!deleted) return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "DELETE /api/integrations/[id]");
  }
}

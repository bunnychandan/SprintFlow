import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { connectIntegration } from "@/lib/integrations/service";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const orgId = body.organizationId || "";
    const result = await connectIntegration(id, orgId, session.user.id);
    if (!result) return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, "POST /api/integrations/[id]/connect");
  }
}

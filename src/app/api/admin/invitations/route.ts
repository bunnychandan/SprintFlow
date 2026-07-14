import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import { parsePagination, paginationMeta } from "@/lib/api-utils";
import { sendInvitationEmail } from "@/lib/email/invitation-email";
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const pagination = parsePagination(request);
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const status = searchParams.get("status") || "";
  const type = searchParams.get("type") || "";

  const allowedSortFields = ["email", "type", "status", "expiresAt", "createdAt", "acceptedAt"];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const order = sortOrder === "asc" ? "asc" : "desc";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status;
  if (type) where.type = type;

  const [invitations, total] = await Promise.all([
    prisma.invitation.findMany({
      where: where as any,
      include: {
        sender: { select: { id: true, name: true, email: true } },
      },
      orderBy: { [sortField]: order },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.invitation.count({ where: where as any }),
  ]);

  return NextResponse.json({
    invitations,
    pagination: paginationMeta(total, pagination),
  });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
  if (auth.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Only SUPER_ADMIN can create invitations" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = String(body.email ?? "").toLowerCase().trim();
  if (!email || !validateEmail(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  const type = body.type === "ADMIN" ? "ADMIN" : "USER";
  const department = body.department ? String(body.department).trim() : null;
  const designation = body.designation ? String(body.designation).trim() : null;
  const projectId = body.projectId ? String(body.projectId) : null;
  const role = body.role ? String(body.role) : "VIEWER";

  let expiresAt: Date;
  if (body.expiresAt) {
    const parsed = new Date(String(body.expiresAt));
    if (isNaN(parsed.getTime())) {
      return NextResponse.json({ error: "Invalid expiration date" }, { status: 400 });
    }
    expiresAt = parsed;
  } else {
    expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    if (existingUser.deletedAt) {
      return NextResponse.json({ error: "This email belongs to a deleted account" }, { status: 409 });
    }
    return NextResponse.json({ error: "An active account with this email already exists" }, { status: 409 });
  }

  const activeInvitation = await prisma.invitation.findFirst({
    where: { email, status: "PENDING", expiresAt: { gt: new Date() } },
  });
  if (activeInvitation) {
    return NextResponse.json({ error: "A pending invitation already exists for this email" }, { status: 409 });
  }

  if (projectId) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (project.deletedAt) {
      return NextResponse.json({ error: "Project is deleted" }, { status: 400 });
    }
  }

  const invitation = await prisma.$transaction(async (tx) => {
    const created = await tx.invitation.create({
      data: {
        email,
        type: type as "USER" | "ADMIN",
        projectId,
        role: role as "PROJECT_MANAGER" | "SCRUM_MASTER" | "DEVELOPER" | "TESTER" | "BUSINESS_ANALYST" | "VIEWER",
        department,
        designation,
        expiresAt,
        senderId: auth.user!.id,
        token: crypto.randomUUID(),
        status: "PENDING",
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: auth.user!.id,
        entityType: "INVITATION",
        entityId: created.id,
        action: "CREATE_INVITATION",
        details: `Created ${type} invitation for ${email}`,
      },
    });

    return created;
  });

  try {
    await sendInvitationEmail({
      to: email,
      inviterName: auth.session?.user?.name ?? auth.session?.user?.email ?? "An admin",
      type,
      token: invitation.token,
      expiresAt,
    });
  } catch (e) {
    console.error("Failed to send invitation email:", e);
  }

  return NextResponse.json({ invitation }, { status: 201 });
}

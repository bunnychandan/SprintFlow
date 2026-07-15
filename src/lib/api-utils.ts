import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error-handler";
import type { ZodSchema } from "zod";

export interface PaginationParams {
  skip: number;
  take: number;
  page: number;
  pageSize: number;
}

export function parsePagination(request: Request, defaultPageSize = 50): PaginationParams {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? String(defaultPageSize), 10)));
  return { skip: (page - 1) * pageSize, take: pageSize, page, pageSize };
}

export function paginationMeta(total: number, params: PaginationParams) {
  return { total, page: params.page, pageSize: params.pageSize, totalPages: Math.ceil(total / params.pageSize) };
}

export function searchParams(request: Request) {
  return new URL(request.url).searchParams;
}

export function validatedOrderBy(sortBy: string | null, sortOrder: string | null, validFields: string[]) {
  const field = sortBy && validFields.includes(sortBy) ? sortBy : "createdAt";
  const dir = sortOrder === "asc" ? "asc" : "desc";
  return { [field]: dir } as Record<string, string>;
}

export function searchFilter(search: string | null, fields: string[], mode: "insensitive" | "default" = "insensitive") {
  if (!search) return undefined;
  return fields.map((f) => ({ [f]: { contains: search, mode } }));
}

export async function apiHandler(handler: (req: Request, ctx: any) => Promise<NextResponse>) {
  return async (req: Request, ctx: any) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

export async function parseBody<T>(request: Request, schema: ZodSchema<T>): Promise<{ data: T; error?: NextResponse }> {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return { data: null as any, error: NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 }) };
    }
    return { data: parsed.data };
  } catch {
    return { data: null as any, error: NextResponse.json({ error: "Invalid request body" }, { status: 400 }) };
  }
}

export function ok(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, { status });
}

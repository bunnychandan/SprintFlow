import type { NextRequest } from "next/server";
import { getAuthHandler } from "@/auth";

export async function GET(request: NextRequest, context: unknown) {
  return getAuthHandler()(request, context);
}

export async function POST(request: NextRequest, context: unknown) {
  return getAuthHandler()(request, context);
}

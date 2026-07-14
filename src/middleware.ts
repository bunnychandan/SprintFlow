import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // For now, allow all requests through
  // Protected routes will handle auth checks server-side
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/projects/:path*", "/sprints/:path*", "/tasks/:path*", "/login/:path*"],
};

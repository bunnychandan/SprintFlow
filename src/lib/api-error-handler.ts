import { NextResponse } from "next/server";

export function handleApiError(error: unknown, context?: string) {
  console.error(`API Error${context ? ` [${context}]` : ""}:`, error);
  const isDev = process.env.NODE_ENV === "development";
  const message = isDev && error instanceof Error ? error.message : "Internal server error";
  if (message.includes("does not exist in the current database")) {
    return NextResponse.json({ error: "Database schema out of date. Run prisma db push." }, { status: 500 });
  }
  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  return NextResponse.json({ error: message }, { status: 500 });
}

export function withErrorHandler(handler: (...args: any[]) => Promise<NextResponse>) {
  return async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

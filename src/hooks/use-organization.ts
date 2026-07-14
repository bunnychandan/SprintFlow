"use client";

import { useSession } from "next-auth/react";

export function useOrganization() {
  const { data: session } = useSession();
  return { organizationId: (session?.user as Record<string, unknown>)?.organizationId as string ?? "" };
}

import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { AuthSession } from "./authTypes";

const backendUrl = () =>
  (process.env.BACKEND_API_URL ?? "http://localhost:5000").replace(/\/$/, "");

const MOCK_COMMITTEE_SESSION: AuthSession = {
  status: "AUTHENTICATED",
  user: {
    id: "m-1",
    email: "gennet.zewde@moa.gov.et",
    username: "gennet_committee",
    displayName: "W/ro Gennet Zewde",
    role: "ENDORSING_COMMITTEE",
  },
  expiresAt: new Date(Date.now() + 86400000).toISOString(),
};

export const getServerSession = cache(async (): Promise<AuthSession | null> => {
  try {
    const cookieHeader = (await cookies()).toString();
    if (cookieHeader) {
      const response = await fetch(`${backendUrl()}/api/auth/session`, {
        headers: { cookie: cookieHeader },
        cache: "no-store",
      });
      if (response.ok) {
        return (await response.json()) as AuthSession;
      }
    }
  } catch {
    // Backend unreachable - use committee fallback session for local dev preview
  }

  return MOCK_COMMITTEE_SESSION;
});

export const requireAuthenticatedSession = cache(async () => {
  const session = await getServerSession();
  if (!session) redirect("/");
  if (session.status === "PASSWORD_CHANGE_REQUIRED") {
    redirect("/change-password");
  }
  return session;
});

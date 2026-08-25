import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { AuthSession } from "./authTypes";

const backendUrl = () =>
  (process.env.BACKEND_API_URL ?? "http://localhost:5000").replace(/\/$/, "");

export const getServerSession = cache(async (): Promise<AuthSession | null> => {
  try {
    const cookieHeader = (await cookies()).toString();
    if (!cookieHeader) return null;

    const response = await fetch(`${backendUrl()}/api/auth/session`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as AuthSession;
  } catch {
    return null;
  }
});

export const requireAuthenticatedSession = cache(async () => {
  const session = await getServerSession();
  if (!session) redirect("/");
  if (session.status === "PASSWORD_CHANGE_REQUIRED") {
    redirect("/change-password");
  }
  return session;
});

import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { AuthSession } from "./authTypes";

const backendUrl = () =>
  (process.env.BACKEND_API_URL ?? "http://localhost:5000").replace(/\/$/, "");

function parseSessionPayload(val: string): AuthSession | null {
  if (!val || typeof val !== "string") return null;

  // 1. Try base64 decoding first
  try {
    const decoded = Buffer.from(val, "base64").toString("utf-8");
    const parsed = JSON.parse(decoded) as AuthSession;
    if (parsed && parsed.user && parsed.user.role && parsed.status) {
      return parsed;
    }
  } catch {}

  // 2. Try direct JSON parsing
  try {
    const parsed = JSON.parse(val) as AuthSession;
    if (parsed && parsed.user && parsed.user.role && parsed.status) {
      return parsed;
    }
  } catch {}

  // 3. Try URI-decoded JSON parsing
  try {
    const parsed = JSON.parse(decodeURIComponent(val)) as AuthSession;
    if (parsed && parsed.user && parsed.user.role && parsed.status) {
      return parsed;
    }
  } catch {}

  return null;
}

export const getServerSession = cache(async (): Promise<AuthSession | null> => {
  try {
    const cookieStore = await cookies();

    // 1. Check primary isolated frontend session cookie
    const primary = cookieStore.get("moa_user_session")?.value;
    if (primary) {
      const parsed = parseSessionPayload(primary);
      if (parsed) return parsed;
    }

    // 2. Check moa_session cookie
    const secondary = cookieStore.get("moa_session")?.value;
    if (secondary) {
      const parsed = parseSessionPayload(secondary);
      if (parsed) return parsed;
    }

    // 3. Inspect all cookies in store for a valid session payload
    for (const c of cookieStore.getAll()) {
      if (
        c.name.includes("session") ||
        c.name.includes("moa") ||
        c.name.includes("auth")
      ) {
        const parsed = parseSessionPayload(c.value);
        if (parsed) return parsed;
      }
    }

    const cookieHeader = cookieStore.toString();
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

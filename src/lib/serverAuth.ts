import "server-only";

import { cookies } from "next/headers";
import type { AuthSession } from "./authTypes";

const backendUrl = () =>
  (process.env.BACKEND_API_URL ?? "http://localhost:5000").replace(/\/$/, "");

export async function getServerSession(): Promise<AuthSession | null> {
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
}

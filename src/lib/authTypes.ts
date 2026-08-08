import type { UserRole } from "../types";

export type AuthStatus = "PASSWORD_CHANGE_REQUIRED" | "AUTHENTICATED";

export interface AuthUser {
  id: string;
  email: string;
  username: string | null;
  displayName: string;
  role: UserRole;
}

export interface AuthSession {
  status: AuthStatus;
  user: AuthUser;
  expiresAt: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  OFFICER: "Officer",
  DIRECTOR: "Director",
  ENDORSING_COMMITTEE: "Endorsing Committee",
  ADMIN: "Administrator",
};

export const ROLE_SLUGS: Record<UserRole, string> = {
  OFFICER: "officer",
  DIRECTOR: "director",
  ENDORSING_COMMITTEE: "endorsing-committee",
  ADMIN: "admin",
};

export function dashboardPath(role: UserRole): string {
  return `/dashboard/${ROLE_SLUGS[role]}`;
}

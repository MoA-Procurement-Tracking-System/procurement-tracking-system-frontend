import type { ReactNode } from "react";
import { AppShell } from "../../components/dashboard/AppShell";
import { requireAuthenticatedSession } from "../../lib/serverAuth";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAuthenticatedSession();
  return <AppShell user={session.user}>{children}</AppShell>;
}

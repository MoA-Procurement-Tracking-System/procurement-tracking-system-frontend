import { notFound, redirect } from "next/navigation";
import { DashboardRenderer } from "../../../../features/dashboards/components/DashboardRenderer";
import { roleFromSlug } from "../../../../lib/authTypes";
import { requireAuthenticatedSession } from "../../../../lib/serverAuth";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const session = await requireAuthenticatedSession();
  const { role: roleSlug } = await params;
  const requestedRole = roleFromSlug(roleSlug);
  if (!requestedRole) notFound();
  if (requestedRole !== session.user.role) redirect("/access-denied");

  return <DashboardRenderer user={session.user} />;
}

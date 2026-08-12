import { SystemLogsView } from "@/features/dashboards/components/admin/SystemLogsView";
import { UserManagementView } from "@/features/dashboards/components/admin/UserManagementView";
import { PanelsTopLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { ROLE_LABELS } from "../../../../lib/authTypes";
import {
  canAccessWorkspaceSection,
  getWorkspaceSection,
} from "../../../../lib/navigation";
import { requireAuthenticatedSession } from "../../../../lib/serverAuth";

export const dynamic = "force-dynamic";

export default async function WorkspaceSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const definition = getWorkspaceSection(section);
  if (!definition) notFound();

  const session = await requireAuthenticatedSession();
  if (!canAccessWorkspaceSection(session.user.role, section)) {
    redirect("/access-denied");
  }

  if (section === "system-logs") {
    return <SystemLogsView />;
  }

  if (section === "user-management") {
    return <UserManagementView />;
  }

  return (
    <div>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">
              {ROLE_LABELS[session.user.role]}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
              {definition.label}
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              {definition.description}
            </p>
          </div>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <PanelsTopLeft size={27} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <PanelsTopLeft className="mx-auto text-emerald-600" size={34} />
        <h2 className="mt-4 text-lg font-extrabold text-slate-900">
          {definition.label} workspace
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
          Your role has access to this section. Its procurement records and
          actions can be connected here as the related workflow stories are
          implemented.
        </p>
      </section>
    </div>
  );
}

import {
  BarChart3,
  ClipboardCheck,
  FileClock,
  History,
  ListChecks,
  ShieldCheck,
  Users,
} from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { ROLE_LABELS, roleFromSlug } from "../../../../lib/authTypes";
import { requireAuthenticatedSession } from "../../../../lib/serverAuth";
import type { UserRole } from "../../../../types";

export const dynamic = "force-dynamic";

const roleDescriptions: Record<UserRole, string> = {
  OFFICER: "Prepare and follow procurement work assigned to your office.",
  DIRECTOR: "Review directorate plans and monitor procurement progress.",
  ENDORSING_COMMITTEE: "Review submitted plans and record committee decisions.",
  ADMIN: "Manage authorized users and review timestamped system activity.",
};

const dashboardCards = {
  OFFICER: [
    { label: "Awaiting action", icon: ClipboardCheck },
    { label: "Active projects", icon: FileClock },
    { label: "Contracts", icon: ListChecks },
    { label: "Session status", icon: ShieldCheck, value: "Secure" },
  ],
  DIRECTOR: [
    { label: "Plans for review", icon: ClipboardCheck },
    { label: "Active projects", icon: FileClock },
    { label: "Committee progress", icon: ListChecks },
    { label: "Reports", icon: BarChart3 },
  ],
  ENDORSING_COMMITTEE: [
    { label: "Plans for review", icon: ClipboardCheck },
    { label: "Pending decisions", icon: FileClock },
    { label: "My decisions", icon: ListChecks },
    { label: "Session status", icon: ShieldCheck, value: "Secure" },
  ],
  ADMIN: [
    { label: "Authorized users", icon: Users },
    { label: "Recent system logs", icon: History },
    { label: "Accounts requiring action", icon: ClipboardCheck },
    { label: "Session status", icon: ShieldCheck, value: "Secure" },
  ],
} as const;

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

  return (
    <div>
      <section className="rounded-2xl bg-[#064a3a] p-6 text-white shadow-lg sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
          {ROLE_LABELS[session.user.role]} dashboard
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Welcome, {session.user.displayName}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-50">
          {roleDescriptions[session.user.role]}
        </p>
      </section>

      <section
        aria-label="Dashboard summary"
        className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {dashboardCards[session.user.role].map(
          ({ label, icon: Icon, ...card }) => (
            <article
              key={label}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Icon size={20} />
                </div>
                <span className="text-lg font-extrabold text-slate-900">
                  {"value" in card ? card.value : "\u2014"}
                </span>
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-600">
                {label}
              </p>
            </article>
          ),
        )}
      </section>

      <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-extrabold text-slate-900">
          Account access
        </h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-slate-500">Name</dt>
            <dd className="mt-1 font-semibold text-slate-900">
              {session.user.displayName}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd className="mt-1 break-all font-semibold text-slate-900">
              {session.user.email}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Role</dt>
            <dd className="mt-1 font-semibold text-slate-900">
              {ROLE_LABELS[session.user.role]}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

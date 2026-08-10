import { ClipboardCheck, FileClock, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MoALogo } from "../../../components/MoALogo";
import { SignOutButton } from "../../../components/dashboard/SignOutButton";
import { dashboardPath, ROLE_LABELS, ROLE_SLUGS } from "../../../lib/authTypes";
import { getServerSession } from "../../../lib/serverAuth";

export const dynamic = "force-dynamic";

const roleDescriptions = {
  OFFICER: "Prepare and follow procurement requests assigned to your office.",
  DIRECTOR: "Review directorate requests and monitor procurement progress.",
  ENDORSING_COMMITTEE:
    "Review submissions awaiting Endorsing Committee consideration.",
  ADMIN: "Manage authorized users, roles and security audit activity.",
} as const;

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const session = await getServerSession();
  if (!session) redirect("/");
  if (session.status === "PASSWORD_CHANGE_REQUIRED")
    redirect("/change-password");

  const { role } = await params;
  if (role !== ROLE_SLUGS[session.user.role]) {
    redirect(dashboardPath(session.user.role));
  }

  const cards = [
    { label: "Awaiting action", value: "—", icon: ClipboardCheck },
    { label: "In progress", value: "—", icon: FileClock },
    { label: "Authorized users", value: "—", icon: Users },
    { label: "Session status", value: "Secure", icon: ShieldCheck },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-3">
          <div className="flex items-center gap-4">
            <MoALogo size="sm" />
            <div className="hidden border-l border-slate-200 pl-4 sm:block">
              <p className="font-bold text-[#064e3b]">
                Procurement Tracking System
              </p>
              <p className="text-xs text-slate-500">Ministry of Agriculture</p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="rounded-3xl bg-[#064e3b] p-8 text-white shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-100">
            {ROLE_LABELS[session.user.role]} dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold">
            Welcome, {session.user.displayName}
          </h1>
          <p className="mt-3 max-w-2xl text-emerald-50">
            {roleDescriptions[session.user.role]}
          </p>
        </div>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ label, value, icon: Icon }) => (
            <article
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <Icon className="text-emerald-700" />
                <span className="text-2xl font-bold text-slate-900">
                  {value}
                </span>
              </div>
              <p className="mt-5 text-sm font-medium text-slate-600">{label}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-900">Account access</h2>
            {session.user.role === "ADMIN" && (
              <Link
                href="/admin/users"
                className="rounded-xl bg-[#064e3b] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#043b2d]"
              >
                Manage users
              </Link>
            )}
          </div>
          <dl className="mt-5 grid gap-5 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-slate-500">Name</dt>
              <dd className="mt-1 font-semibold text-slate-900">
                {session.user.displayName}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="mt-1 font-semibold text-slate-900">
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
    </main>
  );
}

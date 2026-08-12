import { ArrowRight, DatabaseZap, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { AuthUser } from "@/lib/authTypes";
import { ROLE_LABELS } from "@/lib/authTypes";
import type {
  DashboardFocusItem,
  DashboardMetric,
  DashboardTone,
  DashboardWorkspace,
} from "../types";

const toneClasses: Record<DashboardTone, string> = {
  blue: "bg-blue-50 text-blue-700",
  emerald: "bg-emerald-50 text-emerald-700",
  orange: "bg-orange-50 text-orange-700",
  slate: "bg-slate-100 text-slate-700",
  violet: "bg-violet-50 text-violet-700",
};

interface DashboardOverviewProps {
  user: AuthUser;
  eyebrow: string;
  description: string;
  metrics: readonly DashboardMetric[];
  workspaceTitle: string;
  workspaceDescription: string;
  workspaces: readonly DashboardWorkspace[];
  focusTitle: string;
  focusDescription: string;
  focusItems: readonly DashboardFocusItem[];
}

export function DashboardOverview({
  user,
  eyebrow,
  description,
  metrics,
  workspaceTitle,
  workspaceDescription,
  workspaces,
  focusTitle,
  focusDescription,
  focusItems,
}: DashboardOverviewProps) {
  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl bg-[#064a3a] text-white shadow-lg">
        <div className="grid gap-6 px-6 py-7 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Welcome, {user.displayName}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-50">
              {description}
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <ShieldCheck
              size={24}
              className="shrink-0 text-lime-300"
              aria-hidden="true"
            />
            <div>
              <p className="text-xs text-emerald-100">Access verified</p>
              <p className="text-sm font-bold">{ROLE_LABELS[user.role]}</p>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-label="Dashboard summary"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {metrics.map(({ label, value, detail, icon: Icon, tone }) => (
          <article
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-600">{label}</p>
                <p className="mt-2 text-2xl font-extrabold text-slate-950">
                  {value}
                </p>
              </div>
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}
              >
                <Icon size={21} aria-hidden="true" />
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">{detail}</p>
          </article>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(19rem,0.8fr)]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950">
              {workspaceTitle}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {workspaceDescription}
            </p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {workspaces.map(
              ({
                title,
                description: itemDescription,
                href,
                actionLabel,
                icon: Icon,
              }) => (
                <Link
                  key={href}
                  href={href}
                  className="group rounded-xl border border-slate-200 p-4 hover:border-emerald-300 hover:bg-emerald-50/40 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-white">
                      <Icon size={20} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900">{title}</h3>
                      <p className="mt-1 text-sm leading-5 text-slate-600">
                        {itemDescription}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-800">
                        {actionLabel}
                        <ArrowRight
                          size={16}
                          aria-hidden="true"
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              ),
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-extrabold text-slate-950">
            {focusTitle}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {focusDescription}
          </p>
          <ul className="mt-5 space-y-4">
            {focusItems.map((item) => (
              <li key={item.title} className="flex gap-3">
                <span
                  className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm leading-5 text-slate-600">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="grid gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)] lg:items-center">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <DatabaseZap size={20} aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900">
              Live dashboard totals are pending
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Summary values will populate automatically when the procurement
              reporting endpoints are connected. No demonstration totals are
              being presented as operational data.
            </p>
          </div>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Signed in as
            </dt>
            <dd className="mt-1 break-all font-bold text-slate-900">
              {user.email}
            </dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Assigned role
            </dt>
            <dd className="mt-1 font-bold text-slate-900">
              {ROLE_LABELS[user.role]}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

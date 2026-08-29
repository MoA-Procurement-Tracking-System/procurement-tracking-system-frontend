"use client";

import { StatusText } from "../../../../components/dashboard/StatusText";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { AuthUser } from "@/lib/authTypes";
import { fetchProjects, type BackendProject } from "@/lib/projectsApi";
import { fetchPlans, type BackendPlan } from "@/lib/plansApi";

type SummaryTone = "default" | "success" | "attention";
type AlertTone = "returned" | "delayed" | "upcoming" | "approved";

interface SummaryCard {
  label: string;
  value: number;
  tone: SummaryTone;
  hasUnreadIndicator?: boolean;
}

interface ActiveProject {
  code: string;
  name: string;
  fundingSource: string;
  activePlans: number;
}

interface ActionItem {
  title: string;
  project: string;
  dueDate: string;
  status: "Returned" | "Delayed";
  reason: string;
  href: string;
}

interface OfficerAlert {
  title: string;
  message: string;
  time: string;
  dateTime: string;
  action: string;
  href: string;
  tone: AlertTone;
}

const defaultSummaryCards: readonly SummaryCard[] = [
  { label: "Assigned projects", value: 1, tone: "default" },
  { label: "Draft plans", value: 0, tone: "default" },
  {
    label: "Returned plans",
    value: 0,
    tone: "attention",
    hasUnreadIndicator: false,
  },
  { label: "Submitted plans", value: 0, tone: "default" },
  { label: "Finally approved", value: 0, tone: "success" },
  {
    label: "Delayed activities",
    value: 0,
    tone: "attention",
    hasUnreadIndicator: false,
  },
];

const fallbackActiveProjects: readonly ActiveProject[] = [
  {
    code: "DRIVE",
    name: "Drive project",
    fundingSource: "World Bank (IDA)",
    activePlans: 1,
  },
];

const fallbackActionItems: readonly ActionItem[] = [
  {
    title: "2018 EFY Annual Plan",
    project: "DRIVE",
    dueDate: "12 Oct 2026",
    status: "Returned",
    reason: "Returned for budget code correction",
    href: "/workspace/projects",
  },
  {
    title: "Procurement of Fertilizers (Lot 1)",
    project: "BREFONS",
    dueDate: "15 Oct 2026",
    status: "Delayed",
    reason: "Bid evaluation is behind schedule",
    href: "/workspace/activity-tracker",
  },
];

const fallbackAlerts: readonly OfficerAlert[] = [
  {
    title: "Returned",
    message:
      "Plan 'Irrigation Pumps Q2' was returned by the Director. Reason: Budget code mismatch.",
    time: "2h ago",
    dateTime: "2026-08-15T08:00:00+03:00",
    action: "Review comments",
    href: "/workspace/projects",
    tone: "returned",
  },
  {
    title: "Delayed",
    message: "Activity 'Tractor Spare Parts' is 5 days behind schedule.",
    time: "5h ago",
    dateTime: "2026-08-15T05:00:00+03:00",
    action: "Update progress",
    href: "/workspace/activity-tracker",
    tone: "delayed",
  },
  {
    title: "Upcoming",
    message: "Bid opening for 'Office Furniture Refit' is due in 2 days.",
    time: "1d ago",
    dateTime: "2026-08-14T10:00:00+03:00",
    action: "View details",
    href: "/workspace/activity-tracker",
    tone: "upcoming",
  },
  {
    title: "Approved",
    message: "Plan 'Livestock Health 2018' was finally approved by Committee.",
    time: "2d ago",
    dateTime: "2026-08-13T10:00:00+03:00",
    action: "View plan",
    href: "/workspace/projects",
    tone: "approved",
  },
];

const summaryToneClasses: Record<
  SummaryTone,
  { card: string; label: string; value: string }
> = {
  default: {
    card: "border-slate-200 hover:border-[#8db7a6]",
    label: "text-slate-600",
    value: "text-slate-900",
  },
  success: {
    card: "border-[#b7d8cb] hover:border-[#348267]",
    label: "text-[#176c55]",
    value: "text-[#176c55]",
  },
  attention: {
    card: "border-[#edc7c3] hover:border-[#c43b32]",
    label: "text-[#bd2f27]",
    value: "text-[#b4231b]",
  },
};

const alertToneClasses: Record<
  AlertTone,
  { card: string; title: string; icon: LucideIcon }
> = {
  returned: {
    card: "border-l-[#d97706] bg-[#fff7eb]",
    title: "text-[#c66b00]",
    icon: RotateCcw,
  },
  delayed: {
    card: "border-l-[#c8322b] bg-[#fff1f1]",
    title: "text-[#bd2f27]",
    icon: CircleAlert,
  },
  upcoming: {
    card: "border-l-[#2596a9] bg-[#edf9fb]",
    title: "text-[#18879a]",
    icon: CalendarDays,
  },
  approved: {
    card: "border-l-[#18745b] bg-[#edf7f3]",
    title: "text-[#176c55]",
    icon: CheckCircle2,
  },
};

const actionLinkClasses =
  "font-semibold text-[#1261a8] underline-offset-4 hover:text-[#07523f] hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#07523f]";

export function OfficerDashboard({ user }: { user: AuthUser }) {
  const [backendProjects, setBackendProjects] = useState<BackendProject[]>([]);
  const [backendPlans, setBackendPlans] = useState<BackendPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setCurrentTime(Date.now()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [projects, plans] = await Promise.all([
          fetchProjects(),
          fetchPlans(),
        ]);
        if (isMounted) {
          setBackendProjects(projects || []);
          setBackendPlans(plans || []);
        }
      } catch (err) {
        console.warn("OfficerDashboard loadData note:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const officerProjectsList = useMemo(() => {
    if (backendProjects.length === 0) return fallbackActiveProjects;

    // Filter projects where this officer is a member
    const assigned = backendProjects.filter((p) =>
      (p.members || []).some(
        (m) =>
          m.userId === user.id ||
          (m.user?.email &&
            m.user.email.toLowerCase() === user.email.toLowerCase()) ||
          (m.user?.name &&
            m.user.name.toLowerCase() ===
              (user.displayName || "").toLowerCase()),
      ),
    );

    // If there are explicitly assigned projects, display them; otherwise fallback to all active backend projects
    const listToDisplay = assigned.length > 0 ? assigned : backendProjects;

    return listToDisplay.map((p) => ({
      code: p.code,
      name: p.name,
      fundingSource: p.fundingSource?.label || "World Bank (IDA)",
      activePlans: p.plans ? p.plans.length : 0,
    }));
  }, [backendProjects, user]);

  // Compute live delayed activities
  const liveDelayedActivities: { act: any; plan: BackendPlan }[] =
    useMemo(() => {
      const list: { act: any; plan: BackendPlan }[] = [];
      for (const p of backendPlans) {
        for (const a of p.activities || []) {
          const hasDelayedStage = (a.stages || []).some(
            (st: any) =>
              st.status === "DELAYED" ||
              (st.currentTargetStartDate &&
                currentTime !== null &&
                new Date(st.currentTargetStartDate).getTime() < currentTime &&
                st.status !== "COMPLETED" &&
                !st.isNotApplicable),
          );
          if (a.status === "DELAYED" || hasDelayedStage) {
            list.push({ act: a, plan: p });
          }
        }
      }
      return list;
    }, [backendPlans, currentTime]);

  const cards = useMemo(() => {
    const draftCount = backendPlans.filter(
      (p) => p.status === "DRAFT" || (p as any).status === "Draft",
    ).length;
    const returnedCount = backendPlans.filter(
      (p) => p.status === "REJECTED" || (p as any).status === "Returned",
    ).length;
    const submittedCount = backendPlans.filter(
      (p) =>
        p.status === "SUBMITTED" ||
        (p as any).status === "Submitted to Director",
    ).length;
    const approvedCount = backendPlans.filter(
      (p) =>
        p.status === "APPROVED" || (p as any).status === "Finally Approved",
    ).length;

    return [
      {
        label: "Assigned projects",
        value: officerProjectsList.length,
        tone: "default" as const,
      },
      { label: "Draft plans", value: draftCount, tone: "default" as const },
      {
        label: "Returned plans",
        value: returnedCount,
        tone: "attention" as const,
        hasUnreadIndicator: returnedCount > 0,
      },
      {
        label: "Submitted plans",
        value: submittedCount,
        tone: "default" as const,
      },
      {
        label: "Finally approved",
        value: approvedCount,
        tone: "success" as const,
      },
      {
        label: "Delayed activities",
        value: liveDelayedActivities.length,
        tone: "attention" as const,
        hasUnreadIndicator: liveDelayedActivities.length > 0,
      },
    ];
  }, [officerProjectsList.length, backendPlans, liveDelayedActivities.length]);

  const dynamicActionItems: readonly ActionItem[] = useMemo(() => {
    const items: ActionItem[] = [];

    // Add returned plans
    for (const p of backendPlans.filter(
      (pl) => pl.status === "REJECTED" || (pl as any).status === "Returned",
    )) {
      items.push({
        title: p.title || "Annual Procurement Plan",
        project: p.project?.code || "MOA",
        dueDate: p.periodEnd
          ? new Date(p.periodEnd).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "Immediate",
        status: "Returned",
        reason: "Returned for revision by Director",
        href: `/workspace/projects?project=${encodeURIComponent(p.project?.code || "")}&plan=${encodeURIComponent(p.id)}`,
      });
    }

    // Add delayed activities
    for (const { act, plan } of liveDelayedActivities) {
      items.push({
        title: act.description || "Delayed activity package",
        project: plan.project?.code || "MOA",
        dueDate: "Action Required",
        status: "Delayed",
        reason: `Overdue at stage: ${act.currentStage || "Bid Evaluation"}`,
        href: `/workspace/activity-tracker?activity=${encodeURIComponent(act.reference || act.id)}`,
      });
    }

    return items.length > 0 ? items : fallbackActionItems;
  }, [backendPlans, liveDelayedActivities]);

  const dynamicAlerts: readonly OfficerAlert[] = useMemo(() => {
    const list: OfficerAlert[] = [];

    // Returned plan alerts
    const returned = backendPlans.find((p) => p.status === "REJECTED");
    if (returned) {
      list.push({
        title: "Returned",
        message: `Plan '${returned.title}' was returned by the Director for revision.`,
        time: "Recent",
        dateTime: returned.updatedAt || new Date().toISOString(),
        action: "Review comments",
        href: "/workspace/projects",
        tone: "returned",
      });
    }

    // Delayed activity alerts
    if (liveDelayedActivities.length > 0) {
      const first = liveDelayedActivities[0];
      list.push({
        title: "Delayed",
        message: `Activity '${first.act.description || "Activity"}' requires progress update.`,
        time: "Today",
        dateTime: new Date().toISOString(),
        action: "Update progress",
        href: "/workspace/activity-tracker",
        tone: "delayed",
      });
    }

    // Approved plan alerts
    const approved = backendPlans.find((p) => p.status === "APPROVED");
    if (approved) {
      list.push({
        title: "Approved",
        message: `Plan '${approved.title}' was finally approved.`,
        time: "Approved",
        dateTime: approved.updatedAt || new Date().toISOString(),
        action: "View plan",
        href: "/workspace/projects",
        tone: "approved",
      });
    }

    return list.length > 0 ? list : fallbackAlerts;
  }, [backendPlans, liveDelayedActivities]);

  return (
    <div className="space-y-5 pb-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-[#3f6f60]">Dashboard</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#10243f]">
            Overview
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Welcome back, {user.displayName}. Here is your assigned procurement
            work at a glance.
          </p>
        </div>
      </header>

      <section
        aria-label="Procurement plan overview"
        className="grid w-full overflow-x-auto pb-1"
        style={{
          gap: "0.75rem",
          gridTemplateColumns: "repeat(6, minmax(8.5rem, 1fr))",
        }}
      >
        {cards.map((card) => {
          const tone = summaryToneClasses[card.tone];

          return (
            <article
              key={card.label}
              className={`relative flex min-h-28 flex-col justify-between rounded-lg border bg-white p-4 shadow-sm transition-colors ${tone.card}`}
            >
              {card.hasUnreadIndicator ? (
                <span
                  aria-hidden="true"
                  className="absolute top-3.5 right-3.5 h-2 w-2 rounded-full bg-[#bd2f27] ring-4 ring-red-50"
                />
              ) : null}
              {card.hasUnreadIndicator ? (
                <span className="sr-only">Needs attention.</span>
              ) : null}
              <h2
                className={`max-w-[8rem] text-[11px] font-extrabold uppercase leading-4 tracking-[0.08em] ${tone.label}`}
              >
                {card.label}
              </h2>
              <p className={`mt-3 text-2xl font-extrabold ${tone.value}`}>
                {card.value}
              </p>
            </article>
          );
        })}
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,2.08fr)_minmax(19rem,1fr)]">
        <div className="space-y-5">
          <DashboardPanel title="My Active Projects">
            <div
              aria-label="My active projects table"
              className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#176c55]"
              role="region"
              tabIndex={0}
            >
              <table className="min-w-[46rem] w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-white text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
                    <th className="px-5 py-4" scope="col">
                      Project name &amp; code
                    </th>
                    <th className="w-48 px-5 py-4" scope="col">
                      Funding source
                    </th>
                    <th className="w-32 px-5 py-4 text-center" scope="col">
                      Active plans
                    </th>
                    <th className="w-32 px-5 py-4 text-right" scope="col">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {officerProjectsList.map((project) => (
                    <tr key={project.code} className="hover:bg-[#f7fbf9]">
                      <td className="px-5 py-4">
                        <p className="font-semibold leading-6 text-slate-900">
                          {project.name}
                        </p>
                        <p className="mt-0.5 text-xs font-medium text-slate-500">
                          {project.code}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700">
                        {project.fundingSource}
                      </td>
                      <td className="px-5 py-4 text-center font-semibold text-slate-800">
                        {project.activePlans}
                      </td>
                      <td className="px-5 py-4 text-right text-sm">
                        <Link
                          className={actionLinkClasses}
                          href="/workspace/projects"
                        >
                          Open project
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardPanel>

          <DashboardPanel title="Requiring My Action">
            <div
              aria-label="Plans and activities requiring my action table"
              className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#176c55]"
              role="region"
              tabIndex={0}
            >
              <table className="min-w-[48rem] w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-white text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
                    <th className="px-5 py-4" scope="col">
                      Plan / activity
                    </th>
                    <th className="w-36 px-5 py-4" scope="col">
                      Project
                    </th>
                    <th className="w-40 px-5 py-4" scope="col">
                      Due date
                    </th>
                    <th className="w-56 px-5 py-4" scope="col">
                      Status / reason
                    </th>
                    <th className="w-24 px-5 py-4 text-right" scope="col">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {dynamicActionItems.map((item) => {
                    const isDelayed = item.status === "Delayed";

                    return (
                      <tr key={item.title} className="hover:bg-[#f7fbf9]">
                        <td className="px-5 py-5 font-semibold leading-6 text-slate-900">
                          {item.title}
                        </td>
                        <td className="px-5 py-5 text-sm font-medium text-slate-600">
                          {item.project}
                        </td>
                        <td
                          className={`px-5 py-5 text-sm font-semibold ${
                            isDelayed ? "text-[#bd2f27]" : "text-slate-700"
                          }`}
                        >
                          {item.dueDate}
                        </td>
                        <td className="px-5 py-5">
                          <StatusText className="text-sm" label={item.status} />
                          <p className="mt-1 max-w-48 truncate text-xs text-slate-500">
                            {item.reason}
                          </p>
                        </td>
                        <td className="px-5 py-5 text-right text-sm">
                          <Link className={actionLinkClasses} href={item.href}>
                            Open
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </DashboardPanel>
        </div>

        <aside
          aria-labelledby="alerts-center-title"
          className="overflow-hidden rounded-xl border border-[#bdd0c8] bg-white shadow-sm"
        >
          <div className="flex items-center gap-3 border-b border-[#c7d7d0] bg-[#edf5f1] px-5 py-4">
            <Bell aria-hidden="true" className="h-5 w-5 text-[#48675d]" />
            <h2
              id="alerts-center-title"
              className="text-lg font-extrabold text-[#16253d]"
            >
              Alerts Center
            </h2>
          </div>
          <div className="space-y-4 p-4">
            {dynamicAlerts.map((alert) => {
              const tone = alertToneClasses[alert.tone];
              const AlertIcon = tone.icon;

              return (
                <article
                  key={`${alert.title}-${alert.message}`}
                  className={`rounded-lg border-l-[5px] p-4 ${tone.card}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3
                      className={`flex items-center gap-2 text-sm font-extrabold ${tone.title}`}
                    >
                      <AlertIcon
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0"
                      />
                      {alert.title}
                    </h3>
                    <time
                      className="shrink-0 text-xs font-medium text-slate-500"
                      dateTime={alert.dateTime}
                    >
                      {alert.time}
                    </time>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-800">
                    {alert.message}
                  </p>
                  <Link
                    className={`mt-3 inline-flex text-sm ${actionLinkClasses}`}
                    href={alert.href}
                  >
                    {alert.action}
                  </Link>
                </article>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}

function DashboardPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const headingId = title.toLowerCase().replaceAll(" ", "-");

  return (
    <section
      aria-labelledby={headingId}
      className="overflow-hidden rounded-xl border border-[#bdd0c8] bg-white shadow-sm"
    >
      <div className="border-b border-[#c7d7d0] bg-[#edf5f1] px-5 py-4">
        <h2 id={headingId} className="text-lg font-extrabold text-[#16253d]">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

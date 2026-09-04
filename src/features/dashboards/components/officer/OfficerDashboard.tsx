"use client";

import { ArrowRight, Bell, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { AuthUser } from "@/lib/authTypes";
import {
  fetchProjects,
  isProjectAssignedToOfficer,
  type BackendProject,
} from "@/lib/projectsApi";
import { fetchPlans, type BackendPlan } from "@/lib/plansApi";

type AlertTone = "returned" | "delayed" | "upcoming" | "approved";

interface OfficerAlert {
  id: string;
  statusLine: string;
  referenceLine: string;
  detailLine: string;
  actionLabel?: string;
  href: string;
  tone: AlertTone;
  dateTime?: string;
  timeAgo?: string;
  directorNote?: string;
}

const alertToneClasses: Record<
  AlertTone,
  { barColor: string; statusColor: string }
> = {
  delayed: {
    barColor: "bg-[#b91c1c]",
    statusColor: "text-[#b91c1c]",
  },
  returned: {
    barColor: "bg-[#b91c1c]",
    statusColor: "text-[#b91c1c]",
  },
  upcoming: {
    barColor: "bg-[#2596a9]",
    statusColor: "text-[#18879a]",
  },
  approved: {
    barColor: "bg-[#006837]",
    statusColor: "text-[#006837]",
  },
};

const actionLinkClasses =
  "font-semibold text-[#1261a8] underline-offset-4 hover:text-[#07523f] hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#07523f]";

export function formatTimeAgo(
  dateInput?: string | number | Date | null,
  currentTime: number | null = null,
): string {
  if (!dateInput || currentTime === null) return "";
  const timestamp = new Date(dateInput).getTime();
  if (isNaN(timestamp)) return "";
  const diffMs = currentTime - timestamp;
  if (diffMs < 0) return "just now";

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

export function formatDirectorNote(
  reason?: string | null,
  activityCount?: number,
): string {
  if (!reason) {
    return activityCount && activityCount > 0
      ? `Review ${activityCount} ${activityCount === 1 ? "activity" : "activities"} and resubmit for approval.`
      : "Review comments and resubmit for approval.";
  }

  // Clean out repetitive boilerplate prefixes
  let cleaned = reason
    .replace(/^returned\s+by\s+director\s*[:.-]?\s*/i, "")
    .replace(/^returned\s+for\s+revisions?\s*(by\s+director)?\s*[:.-]?\s*/i, "")
    .replace(/^director\s*(note|comment|feedback)?\s*[:.-]?\s*/i, "")
    .trim();

  // If the remark is just the default placeholder (e.g. "Returned by Director for revisions.")
  if (
    !cleaned ||
    /^for\s+revisions?\.?$/i.test(cleaned) ||
    /^revisions?\.?$/i.test(cleaned) ||
    /^returned\s*(by\s*director)?\.?$/i.test(cleaned)
  ) {
    return activityCount && activityCount > 0
      ? `Review ${activityCount} ${activityCount === 1 ? "activity" : "activities"} and resubmit for approval.`
      : "Review comments and resubmit for approval.";
  }

  return cleaned;
}

export function formatPlanReference(
  projectCode?: string | null,
  planTitle?: string | null,
): string {
  const title = (planTitle || "Annual Procurement Plan").trim();
  if (!projectCode) return title;
  const code = projectCode.trim();

  // If title already includes the project code or code includes title, avoid duplicate prefix
  if (
    title.toLowerCase().includes(code.toLowerCase()) ||
    code.toLowerCase().includes(title.toLowerCase())
  ) {
    return title;
  }

  return `${code} • ${title}`;
}

export function formatReturnedPlanDetail(
  reason?: string | null,
  activityCount?: number,
): string {
  if (!reason) {
    return activityCount && activityCount > 0
      ? `${activityCount} ${activityCount === 1 ? "activity" : "activities"} to review & resubmit`
      : "Review comments and resubmit for approval";
  }

  // Clean out repetitive boilerplate prefixes
  let cleaned = reason
    .replace(/^returned\s+by\s+director\s*[:.-]?\s*/i, "")
    .replace(/^returned\s+for\s+revisions?\s*(by\s+director)?\s*[:.-]?\s*/i, "")
    .replace(/^director\s*[:.-]?\s*/i, "")
    .trim();

  // If the remark is just the default placeholder (e.g. "Returned by Director for revisions.")
  if (
    !cleaned ||
    /^for\s+revisions?\.?$/i.test(cleaned) ||
    /^revisions?\.?$/i.test(cleaned) ||
    /^returned\s*(by\s*director)?\.?$/i.test(cleaned)
  ) {
    return activityCount && activityCount > 0
      ? `${activityCount} ${activityCount === 1 ? "activity" : "activities"} to review & resubmit`
      : "Review comments and resubmit for approval";
  }

  // If the director wrote genuine feedback, display it cleanly
  return `Feedback: ${cleaned}`;
}

export function formatDelayedActivityAlert(
  act: {
    id: string;
    reference?: string | null;
    code?: string | null;
    description?: string | null;
    currentStage?: string | null;
    stages?: any[];
    daysOverdue?: number | null;
    delayDays?: number | null;
    periodEnd?: string | null;
    updatedAt?: string | null;
  },
  projectCode?: string | null,
  currentTime: number | null = null,
): OfficerAlert {
  const delayedStage = (act.stages || []).find(
    (st: any) =>
      st.status === "DELAYED" ||
      (currentTime !== null &&
        !st.isNotApplicable &&
        st.status !== "COMPLETED" &&
        ((st.currentTargetStartDate &&
          new Date(st.currentTargetStartDate).getTime() < currentTime) ||
          (st.currentTargetEndDate &&
            new Date(st.currentTargetEndDate).getTime() < currentTime) ||
          (st.plannedEndDate &&
            new Date(st.plannedEndDate).getTime() < currentTime) ||
          (st.plannedStartDate &&
            new Date(st.plannedStartDate).getTime() < currentTime))),
  );

  const stageLabel =
    delayedStage?.stageType?.label ||
    delayedStage?.name ||
    delayedStage?.stageName ||
    act.currentStage ||
    act.description ||
    "Procurement Stage Overdue";

  const targetDate =
    delayedStage?.currentTargetEndDate ||
    delayedStage?.currentTargetStartDate ||
    delayedStage?.plannedEndDate ||
    delayedStage?.plannedStartDate ||
    act.periodEnd ||
    act.updatedAt;

  let delayDays = Number(act.daysOverdue || act.delayDays) || 0;
  if (targetDate && currentTime !== null) {
    const diffMs = currentTime - new Date(targetDate).getTime();
    if (diffMs > 0) {
      delayDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }
  }

  const statusLine =
    delayDays > 0 ? `${delayDays} Day(s) Overdue` : "Delayed Activity";

  const reference = (
    act.reference ||
    act.code ||
    (projectCode ? `${projectCode}-${act.id.slice(0, 6)}` : act.id)
  ).trim();

  return {
    id: `delayed-${act.id || act.reference}`,
    statusLine,
    referenceLine: reference,
    detailLine: stageLabel,
    actionLabel: "Track",
    href: `/workspace/activity-tracker?activity=${encodeURIComponent(act.reference || act.id)}`,
    tone: "delayed",
    dateTime: targetDate || new Date().toISOString(),
  };
}

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
        setLoading(true);
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
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const assignedProjects = useMemo(() => {
    if (loading || backendProjects.length === 0) return [];
    return backendProjects.filter((p) => isProjectAssignedToOfficer(p, user));
  }, [backendProjects, loading, user]);

  const officerProjectsList = useMemo(() => {
    return assignedProjects.map((p) => ({
      code: p.code,
      name: p.name,
      fundingSource: p.fundingSource?.label || p.fundingSource?.code || "—",
      activePlans: p.plans ? p.plans.length : 0,
    }));
  }, [assignedProjects]);

  const assignedPlans = useMemo(() => {
    if (backendPlans.length === 0 || assignedProjects.length === 0) return [];
    const assignedIds = new Set(
      assignedProjects.map((p) => p.id).filter(Boolean),
    );
    const assignedCodes = new Set(
      assignedProjects.map((p) => p.code.toLowerCase()),
    );
    return backendPlans.filter(
      (p) =>
        (p.projectId && assignedIds.has(p.projectId)) ||
        (p.project?.id && assignedIds.has(p.project.id)) ||
        (p.project?.code && assignedCodes.has(p.project.code.toLowerCase())),
    );
  }, [backendPlans, assignedProjects]);

  // Compute live delayed activities
  const liveDelayedActivities: { act: any; plan: BackendPlan }[] =
    useMemo(() => {
      const list: { act: any; plan: BackendPlan }[] = [];
      for (const p of assignedPlans) {
        for (const a of p.activities || []) {
          const hasDelayedStage = (a.stages || []).some(
            (st: any) =>
              st.status === "DELAYED" ||
              (currentTime !== null &&
                !st.isNotApplicable &&
                st.status !== "COMPLETED" &&
                ((st.currentTargetStartDate &&
                  new Date(st.currentTargetStartDate).getTime() < currentTime) ||
                  (st.currentTargetEndDate &&
                    new Date(st.currentTargetEndDate).getTime() < currentTime) ||
                  (st.plannedEndDate &&
                    new Date(st.plannedEndDate).getTime() < currentTime) ||
                  (st.plannedStartDate &&
                    new Date(st.plannedStartDate).getTime() < currentTime))),
          );
          if (
            a.status === "DELAYED" ||
            (a as any).performanceStatus === "DELAYED" ||
            hasDelayedStage
          ) {
            list.push({ act: a, plan: p });
          }
        }
      }
      return list;
    }, [assignedPlans, currentTime]);

  const overviewStatusItems = useMemo(() => {
    const draftCount = assignedPlans.filter(
      (p) => p.status === "DRAFT" || (p as any).status === "Draft",
    ).length;
    const returnedCount = assignedPlans.filter(
      (p) => p.status === "REJECTED" || (p as any).status === "Returned",
    ).length;
    const submittedCount = assignedPlans.filter(
      (p) =>
        p.status === "SUBMITTED" ||
        (p as any).status === "Submitted to Director",
    ).length;
    const approvedCount = assignedPlans.filter(
      (p) =>
        p.status === "APPROVED" || (p as any).status === "Finally Approved",
    ).length;

    return [
      {
        label: "Assigned projects",
        value: officerProjectsList.length,
        href: "/workspace/projects",
      },
      {
        label: "Returned plans",
        value: returnedCount,
        href: "/workspace/projects",
      },
      {
        label: "Submitted plans",
        value: submittedCount,
        href: "/workspace/projects",
      },
      {
        label: "Draft plans",
        value: draftCount,
        href: "/workspace/projects",
      },
      {
        label: "Finally approved",
        value: approvedCount,
        href: "/workspace/projects",
      },
      {
        label: "Delayed activities",
        value: liveDelayedActivities.length,
        href: "/workspace/activity-tracker",
      },
    ];
  }, [officerProjectsList.length, assignedPlans, liveDelayedActivities.length]);

  const dynamicAlerts: readonly OfficerAlert[] = useMemo(() => {
    const list: OfficerAlert[] = [];

    // Returned plan alerts - display returned plans for assigned projects
    const returnedPlans = assignedPlans.filter(
      (p) => p.status === "REJECTED" || (p as any).status === "Returned",
    );
    for (const returned of returnedPlans) {
      const refLine = formatPlanReference(
        returned.project?.code,
        returned.title,
      );

      const directorNote = formatDirectorNote(
        returned.rejectionReason,
        returned.activities?.length,
      );

      const timeAgo = formatTimeAgo(returned.updatedAt, currentTime);

      list.push({
        id: `returned-${returned.id}`,
        statusLine: "Returned for Revision",
        referenceLine: refLine,
        detailLine: `Director note: ${directorNote}`,
        directorNote,
        timeAgo,
        actionLabel: "Review",
        href: `/workspace/projects?project=${encodeURIComponent(returned.project?.code || "")}&plan=${encodeURIComponent(returned.id)}`,
        tone: "returned",
        dateTime: returned.updatedAt || new Date().toISOString(),
      });
    }

    // Delayed activity alerts - display delayed activities for assigned projects
    for (const { act, plan } of liveDelayedActivities) {
      list.push(
        formatDelayedActivityAlert(act, plan.project?.code, currentTime),
      );
    }

    // Approved plan alerts - display approved plans for assigned projects
    const approvedPlans = assignedPlans.filter(
      (p) => p.status === "APPROVED" || (p as any).status === "Finally Approved",
    );
    for (const approved of approvedPlans) {
      const refLine = formatPlanReference(
        approved.project?.code,
        approved.title,
      );

      list.push({
        id: `approved-${approved.id}`,
        statusLine: "Finally Approved",
        referenceLine: refLine,
        detailLine: "Ready for procurement activity execution",
        actionLabel: "View plan",
        href: `/workspace/projects?project=${encodeURIComponent(approved.project?.code || "")}&plan=${encodeURIComponent(approved.id)}`,
        tone: "approved",
        dateTime: approved.updatedAt || new Date().toISOString(),
      });
    }

    return list;
  }, [assignedPlans, liveDelayedActivities, currentTime]);

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

      <div className="grid items-start xl:items-stretch gap-5 xl:grid-cols-[minmax(0,2.08fr)_minmax(19rem,1fr)]">
        <div className="space-y-5">
          <OverviewStatusBarChartCard
            items={overviewStatusItems}
            loading={loading}
          />

          <DashboardPanel title="My Active Projects">
            <div
              aria-label="My active projects table"
              className="overflow-x-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#176c55]"
              role="region"
              tabIndex={0}
            >
              <table className="w-full table-fixed border-collapse text-left">
                <thead className="bg-[#0A3C2F]">
                  <tr className="bg-[#0A3C2F] text-white text-[11px] font-extrabold uppercase tracking-wider">
                    <th className="w-[36%] px-5 py-3.5" scope="col">
                      Project name &amp; code
                    </th>
                    <th className="w-[28%] px-5 py-3.5" scope="col">
                      Funding source
                    </th>
                    <th
                      className="w-[16%] px-4 py-3.5 text-center whitespace-nowrap"
                      scope="col"
                    >
                      Active plans
                    </th>
                    <th
                      className="w-[20%] pr-5 pl-2 py-3.5 text-right whitespace-nowrap"
                      scope="col"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-8 text-center text-sm text-slate-500"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#176c55] border-t-transparent" />
                          <span>Loading active projects...</span>
                        </div>
                      </td>
                    </tr>
                  ) : officerProjectsList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-8 text-center text-sm text-slate-500"
                      >
                        No active projects assigned yet.
                      </td>
                    </tr>
                  ) : (
                    officerProjectsList.map((project) => (
                      <tr key={project.code} className="hover:bg-[#f7fbf9]">
                        <td className="px-5 py-4 align-middle">
                          <Link
                            title={project.name}
                            className="line-clamp-2 break-words [overflow-wrap:anywhere] [word-break:break-word] font-semibold leading-snug text-slate-900 underline-offset-4 hover:text-[#176c55] hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176c55] block"
                            href={`/workspace/projects?project=${encodeURIComponent(
                              project.code,
                            )}`}
                          >
                            {project.name}
                          </Link>
                          <p className="mt-0.5 text-xs font-mono font-medium text-slate-500 truncate">
                            {project.code}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-middle text-sm text-slate-700 break-words [overflow-wrap:anywhere] [word-break:break-word] line-clamp-2">
                          {project.fundingSource}
                        </td>
                        <td className="px-4 py-4 align-middle text-center font-semibold text-slate-800 whitespace-nowrap">
                          {project.activePlans}
                        </td>
                        <td className="pr-5 pl-2 py-4 align-middle text-right text-sm whitespace-nowrap">
                          <Link
                            className={actionLinkClasses}
                            href={`/workspace/projects?project=${encodeURIComponent(
                              project.code,
                            )}`}
                          >
                            Open project
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </DashboardPanel>
        </div>

        <div className="min-h-[380px] xl:min-h-[415px] max-h-[640px] xl:max-h-none xl:h-full xl:relative">
          <aside
            aria-labelledby="alerts-center-title"
            className="flex flex-col min-w-0 w-full h-full xl:absolute xl:inset-0 overflow-hidden rounded-xl border border-[#bdd0c8] bg-white shadow-sm"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-[#c7d7d0] bg-[#edf5f1] px-5 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <Bell aria-hidden="true" className="h-5 w-5 shrink-0 text-[#48675d]" />
                <h2
                  id="alerts-center-title"
                  className="text-lg font-extrabold text-[#16253d] truncate"
                >
                  Alerts Center
                </h2>
              </div>
              {!loading && dynamicAlerts.length > 0 && (
                <span className="shrink-0 rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                  {dynamicAlerts.length}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-2.5 sm:space-y-3 p-3.5 sm:p-4 overflow-y-auto">
              {loading ? (
                <div className="flex flex-1 h-full min-h-[220px] flex-col items-center justify-center py-6 text-center text-sm text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#176c55] border-t-transparent" />
                    <span>Loading alerts...</span>
                  </div>
                </div>
              ) : dynamicAlerts.length === 0 ? (
                <div className="flex flex-1 h-full min-h-[220px] flex-col items-center justify-center py-6 text-center text-sm text-slate-500">
                  <CheckCircle2 className="h-7 w-7 text-[#48675d]/40 mb-1.5" />
                  <p className="font-semibold text-slate-700">No active alerts</p>
                  <p className="text-xs text-slate-500">You are all caught up for now.</p>
                </div>
              ) : (
                dynamicAlerts.map((alert) => {
                  const tone = alertToneClasses[alert.tone];

                  return (
                    <Link
                      key={alert.id}
                      href={alert.href}
                      className="group flex items-stretch gap-3 sm:gap-3.5 rounded-md border border-slate-200/90 bg-white p-3 sm:p-3.5 shadow-2xs transition-all hover:border-[#0a4d40]/40 hover:bg-slate-50/40 hover:shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a4d40]"
                    >
                      {/* Left vertical accent bar */}
                      <div
                        className={`w-[3.5px] shrink-0 rounded-full my-0.5 ${tone.barColor}`}
                      />

                      {/* Alert Content Lines */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5 sm:gap-1">
                        {/* Line 1: Status / Overdue & Time */}
                        <div className="flex items-center justify-between gap-2">
                          <div
                            className={`text-xs sm:text-[13px] font-semibold tracking-tight leading-tight ${tone.statusColor}`}
                          >
                            {alert.statusLine}
                          </div>
                          {alert.timeAgo ? (
                            <span className="text-[11px] sm:text-xs font-normal text-slate-500 shrink-0">
                              {alert.timeAgo}
                            </span>
                          ) : null}
                        </div>

                        {/* Line 2: Reference Code / Title */}
                        <div
                          className={`text-xs sm:text-sm font-bold tracking-tight break-words [overflow-wrap:anywhere] [word-break:break-word] leading-snug group-hover:underline ${
                            alert.tone === "returned"
                              ? "text-[#10243f]"
                              : "font-mono text-[#0a4d40]"
                          }`}
                        >
                          {alert.referenceLine}
                        </div>

                        {/* Line 3: Stage / Detail or Director Note Box */}
                        {alert.directorNote ? (
                          <div className="mt-1 rounded-md bg-[#f8fafc] border border-slate-200/80 p-2.5 text-xs text-slate-700 font-mono break-words [overflow-wrap:anywhere] [word-break:break-word] leading-relaxed">
                            Director note: {alert.directorNote}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-600 font-normal leading-tight break-words [overflow-wrap:anywhere] [word-break:break-word]">
                            {alert.detailLine}
                          </div>
                        )}

                        {/* Action Button / Link (e.g. Review ->) */}
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-end">
                          <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#0a4d40] group-hover:text-[#06332b] group-hover:underline">
                            {alert.actionLabel || "Review"}
                            <ArrowRight
                              aria-hidden="true"
                              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                            />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </aside>
        </div>
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

function OverviewStatusBarChartCard({
  items,
  loading = false,
}: {
  items: Array<{ label: string; value: number; href: string }>;
  loading?: boolean;
}) {
  const maxValue = Math.max(...items.map((i) => i.value), 1);
  const total = items.reduce((sum, i) => sum + i.value, 0);

  return (
    <section
      aria-label="Procurement overview"
      className="overflow-hidden rounded-xl border border-[#bdd0c8] bg-white shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-[#c7d7d0] bg-[#edf5f1] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#006837]" />
          <h2 className="text-lg font-extrabold text-[#16253d]">
            Procurement Overview
          </h2>
        </div>
        <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-0.5 text-xs font-bold text-[#006837]">
          {loading ? "Loading..." : `Total: ${total.toLocaleString()}`}
        </span>
      </div>

      <div className="p-5 sm:p-6 space-y-3.5 sm:space-y-4">
        {items.map((item) => {
          const percent =
            !loading && maxValue > 0 ? (item.value / maxValue) * 100 : 0;

          return (
            <Link
              key={item.label}
              href={item.href}
              className="group flex items-center gap-3 sm:gap-4 -mx-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-[#f7fbf9]"
            >
              {/* Status Label (Right aligned towards bar) */}
              <div className="w-36 sm:w-44 text-right shrink-0">
                <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight block group-hover:text-[#006837] transition-colors truncate">
                  {item.label}
                </span>
              </div>

              {/* Horizontal Green Bar or Loading Pulse */}
              <div className="flex-1 flex items-center min-w-0 pr-3">
                {loading ? (
                  <div className="h-4 sm:h-5 w-24 bg-slate-200/80 rounded-xs animate-pulse" />
                ) : (
                  <div
                    className="h-4 sm:h-5 bg-[#006837] rounded-xs transition-all duration-500 ease-out group-hover:bg-[#0A3C2F] shadow-2xs"
                    style={{
                      width: `${Math.max(percent, item.value > 0 ? 1.5 : 0)}%`,
                    }}
                  />
                )}
              </div>

              {/* Value (Bold green text or loading placeholder) */}
              <div className="w-12 sm:w-16 text-right shrink-0">
                {loading ? (
                  <span className="text-sm font-medium text-slate-400">
                    ...
                  </span>
                ) : (
                  <span className="text-sm sm:text-base font-bold text-[#006837] tabular-nums">
                    {item.value}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

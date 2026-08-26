"use client";

import {
  Inbox,
  FileCheck,
  CheckCircle2,
  XCircle,
  Info,
  Search,
  History,
  ChevronRight,
  ClipboardCheck,
  TrendingUp,
  Clock,
  FileText,
} from "lucide-react";
import type { AuthUser } from "@/lib/authTypes";
import { DashboardOverview } from "../DashboardOverview";
import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchPlans, mapBackendPlanToFrontend } from "@/lib/plansApi";
import {
  INITIAL_PLANS,
  type ProcurementPlan,
} from "@/features/plans/plansData";
import { getOfficerReviewPlans } from "@/features/plans/components/PlanForReviewView";

export function CommitteeDashboard({ user }: { user: AuthUser }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [plans, setPlans] = useState<ProcurementPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "delayed">("all");

  const [approvedPercentAnim, setApprovedPercentAnim] = useState(0);
  const [rejectedPercentAnim, setRejectedPercentAnim] = useState(0);

  useEffect(() => {
    async function loadPlans() {
      try {
        setLoading(true);
        const rawPlans = await fetchPlans();
        const mapped = rawPlans.map((p) =>
          mapBackendPlanToFrontend(p, user.id),
        );
        const officerPlans = getOfficerReviewPlans();
        const combined = [...mapped, ...officerPlans];
        setPlans(combined.length > 0 ? combined : INITIAL_PLANS);
      } catch (err) {
        console.error("Dashboard failed to load plans:", err);
        const officerPlans = getOfficerReviewPlans();
        setPlans(officerPlans.length > 0 ? officerPlans : INITIAL_PLANS);
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, [user.id]);

  // Awaiting My Vote: status is "Committee Review" AND committeeDecision is undefined (not voted yet)
  const awaitingPlans = plans.filter(
    (p) => p.status === "Committee Review" && p.committeeDecision === undefined,
  );

  // Delayed Reviews: status is "Committee Review" AND committeeDecision is undefined AND deadline Date is in the past
  const delayedPlans = awaitingPlans.filter((p) => {
    if (!p.deadlineDate) return false;
    return new Date(p.deadlineDate).getTime() < new Date().getTime();
  });
  const delayedCount = delayedPlans.length;

  // Total Reviewed: plans where this member has voted (committeeDecision is not undefined)
  const reviewedPlans = plans.filter((p) => p.committeeDecision !== undefined);

  // Approved vs Rejected segment counts
  const approvedReviewed = reviewedPlans.filter(
    (p) => p.committeeDecision === "Approved",
  );
  const rejectedReviewed = reviewedPlans.filter(
    (p) => p.committeeDecision === "Rejected",
  );

  const totalReviewedCount = reviewedPlans.length;
  const approvedCount = approvedReviewed.length;
  const rejectedCount = rejectedReviewed.length;

  const approvedPercent =
    totalReviewedCount > 0
      ? Math.round((approvedCount / totalReviewedCount) * 100)
      : 0;
  const rejectedPercent = totalReviewedCount > 0 ? 100 - approvedPercent : 0;

  useEffect(() => {
    const delay = totalReviewedCount > 0 ? 100 : 0;
    const timer = setTimeout(() => {
      if (totalReviewedCount > 0) {
        setApprovedPercentAnim(approvedPercent);
        setRejectedPercentAnim(rejectedPercent);
      } else {
        setApprovedPercentAnim(0);
        setRejectedPercentAnim(0);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [approvedPercent, rejectedPercent, totalReviewedCount]);

  // Sort awaitingPlans so that closest deadline comes first
  const sortedAwaitingPlans = [...awaitingPlans].sort((a, b) => {
    if (!a.deadlineDate) return 1;
    if (!b.deadlineDate) return -1;
    return (
      new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime()
    );
  });

  const displayedAwaitingPlans = sortedAwaitingPlans.filter((plan) => {
    if (filter === "delayed") {
      if (!plan.deadlineDate) return false;
      return new Date(plan.deadlineDate).getTime() < new Date().getTime();
    }
    return true;
  });

  const filteredAwaitingPlans = displayedAwaitingPlans.filter(
    (plan) =>
      plan.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.projectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Recent decisions: sorted by decisionRecordedDate desc, top 2
  const recentDecisions = [...reviewedPlans]
    .sort((a, b) => {
      const dateA = a.decisionRecordedDate
        ? new Date(a.decisionRecordedDate).getTime()
        : 0;
      const dateB = b.decisionRecordedDate
        ? new Date(b.decisionRecordedDate).getTime()
        : 0;
      return dateB - dateA;
    })
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Subheader and Info Pill */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Snapshot of your pending tasks and recent decisions as a Management
            Committee Member.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 text-xs font-semibold text-blue-800 bg-blue-50/50 self-start sm:self-center select-none shadow-3xs">
          <Info size={14} className="text-blue-600 shrink-0" />
          <span>5 Members Total | 3 Approvals Required</span>
        </div>
      </div>

      {/* Premium Statistics Row */}
      <section
        aria-label="Committee statistics summary"
        className="grid grid-cols-1 gap-4 md:grid-cols-3 max-w-5xl"
      >
        {/* Card 1: Delayed Votes */}
        <div
          onClick={() => setFilter(filter === "delayed" ? "all" : "delayed")}
          className={`relative overflow-hidden bg-gradient-to-br from-rose-50/70 to-red-50/40 rounded-[20px] p-5 border shadow-3xs flex flex-col justify-between min-h-[140px] border-l-[5px] border-l-red-500 hover:shadow-xs transition-all cursor-pointer select-none ${
            filter === "delayed"
              ? "border-red-400 ring-2 ring-red-500/20 scale-[1.01] shadow-xs"
              : "border-rose-200 hover:scale-[1.01]"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                {delayedCount > 0 && (
                  <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
                )}
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-rose-900 leading-tight">
                  Delayed Votes
                </h3>
              </div>
              <p className="text-3xl font-black text-red-950 mt-2 font-mono leading-none">
                {delayedCount}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-rose-200 text-rose-600 shadow-3xs">
              <Clock size={20} strokeWidth={2.2} />
            </div>
          </div>
          <div className="text-[11px] font-semibold text-rose-800 mt-2 flex items-center gap-1">
            <span>
              {delayedCount > 0
                ? `${delayedCount} votes are past deadline`
                : "No votes are delayed"}
            </span>
          </div>
        </div>

        {/* Card 2: Awaiting My Vote */}
        <div
          onClick={() => setFilter("all")}
          className="relative overflow-hidden bg-gradient-to-br from-amber-50/70 to-orange-50/40 rounded-[20px] p-5 border border-amber-200 shadow-3xs flex flex-col justify-between min-h-[140px] border-l-[5px] border-l-orange-500 hover:shadow-xs transition-all cursor-pointer select-none hover:scale-[1.01]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-orange-600 animate-pulse"></span>
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 leading-tight">
                  Awaiting My Vote
                </h3>
              </div>
              <p className="text-3xl font-black text-amber-950 mt-2 font-mono leading-none">
                {awaitingPlans.length}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-amber-200 text-amber-600 shadow-3xs">
              <Inbox size={20} strokeWidth={2.2} />
            </div>
          </div>
          <div className="text-[11px] font-semibold text-amber-800 mt-2 flex items-center gap-1">
            <span>Action required on {awaitingPlans.length} pending plans</span>
          </div>
        </div>

        {/* Card 3: Total Reviewed */}
        <div className="bg-white rounded-[20px] p-5 border border-slate-200/80 shadow-3xs flex flex-row items-center justify-between min-h-[140px] hover:shadow-xs transition-shadow gap-4">
          <div className="flex flex-col justify-between h-full">
            <div>
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 leading-tight">
                Total Reviewed
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Reviewed This Year
              </p>
            </div>

            <div className="flex flex-col gap-1.5 mt-4 select-none">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700">
                <span className="h-2.5 w-2.5 rounded-full bg-[#15803d]"></span>
                <span>
                  {approvedCount} Approved ({approvedPercent}%)
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700">
                <span className="h-2.5 w-2.5 rounded-full bg-[#dc2626]"></span>
                <span className="text-[#dc2626]">
                  {rejectedCount} Rejected ({rejectedPercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* Donut Chart with Premium Styling */}
          <div className="relative flex items-center justify-center h-24 w-24 shrink-0 hover:scale-105 transition-all duration-300 select-none">
            <svg viewBox="0 0 36 36" className="w-full h-full drop-shadow-xs">
              {/* Background circle */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="transparent"
                stroke="#f1f5f9"
                strokeWidth="4.5"
              />
              {/* Approved segment (rich forest green #15803d) */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="transparent"
                stroke="#15803d"
                strokeWidth="4.5"
                strokeDasharray={`${approvedPercentAnim} 100`}
                strokeDashoffset="0"
                className="-rotate-90 origin-center transition-all duration-1000 ease-out"
              />
              {/* Rejected segment (rich dark red #dc2626) */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="transparent"
                stroke="#dc2626"
                strokeWidth="4.5"
                strokeDasharray={`${rejectedPercentAnim} 100`}
                strokeDashoffset={-approvedPercentAnim}
                className="-rotate-90 origin-center transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center bg-white rounded-full h-[58px] w-[58px] shadow-3xs border border-slate-100/50">
              <span className="text-lg font-black text-slate-900 font-mono leading-none">
                {totalReviewedCount}
              </span>
              <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">
                Total
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Column: Plans Awaiting My Vote (colspan 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[20px] border border-slate-200/80 shadow-2xs overflow-hidden">
            {/* Card Header */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <ClipboardCheck className="h-5 w-5 text-emerald-700 shrink-0" />
                <h2 className="text-sm font-bold text-slate-900">
                  Plans Awaiting My Vote
                </h2>
                {filter === "delayed" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-150 animate-fade-in select-none">
                    <span>Delayed Only</span>
                    <button
                      onClick={() => setFilter("all")}
                      className="hover:bg-red-100 rounded-full p-0.5 transition-colors cursor-pointer"
                    >
                      <XCircle size={10} className="shrink-0" />
                    </button>
                  </span>
                )}
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search plans..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-[#0A3C2F] outline-none transition-all shadow-3xs"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Dir. Approval Date</th>
                    <th className="py-3 px-4 text-right">Estimated Totals</th>
                    <th className="py-3 px-4">Voting Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-10 text-center text-slate-400 font-medium animate-pulse"
                      >
                        Loading awaiting plans...
                      </td>
                    </tr>
                  ) : filteredAwaitingPlans.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-10 text-center text-slate-400 font-medium"
                      >
                        No plans awaiting review
                      </td>
                    </tr>
                  ) : (
                    filteredAwaitingPlans.map((plan) => (
                      <tr
                        key={plan.id}
                        className={`hover:bg-slate-50/50 transition-colors ${
                          plan.isPriority ? "bg-rose-50/10" : ""
                        }`}
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <Link
                            href="/workspace/plan-for-review"
                            className="hover:underline hover:text-emerald-800 transition-colors"
                          >
                            {plan.planName}
                          </Link>
                          <div className="flex items-center flex-wrap gap-1.5 text-[10px] mt-0.5">
                            <span
                              className={
                                plan.isPriority
                                  ? "text-rose-600 font-bold"
                                  : "text-slate-400 font-medium"
                              }
                            >
                              {plan.isPriority
                                ? "▲ Priority Review"
                                : `${plan.budgetYear} • ${plan.activitiesCount} Activities`}
                            </span>
                            {plan.deadlineText && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-150 font-bold select-none whitespace-nowrap">
                                  Deadline: {plan.deadlineText}
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {plan.projectCode}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                              plan.category === "Goods"
                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                : plan.category === "Works"
                                  ? "bg-amber-50 text-amber-700 border-amber-100"
                                  : "bg-purple-50 text-purple-700 border-purple-100"
                            }`}
                          >
                            {plan.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {new Date(plan.createdAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                          {plan.estimatedTotal}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  (plan.progress ?? 0) > 0
                                    ? "bg-emerald-500"
                                    : "bg-slate-200"
                                }`}
                                style={{ width: `${plan.progress ?? 0}%` }}
                              ></div>
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                              {plan.progressText}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium select-none">
              <span>
                Showing {filteredAwaitingPlans.length} of {awaitingPlans.length}{" "}
                plans
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-3xs cursor-pointer"
                  disabled
                >
                  &lt;
                </button>
                <button
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-3xs cursor-pointer"
                  disabled
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: My Recent Decisions (colspan 1) */}
        <div className="space-y-4">
          <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 select-none">
            <History className="h-4 w-4 text-slate-400" /> My Recent Decisions
          </h3>

          <div className="bg-white rounded-[20px] border border-slate-200/80 shadow-2xs overflow-hidden divide-y divide-slate-100">
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-400 font-medium select-none">
                Loading decisions...
              </div>
            ) : recentDecisions.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 font-medium select-none">
                No past decisions recorded yet.
              </div>
            ) : (
              recentDecisions.map((plan) => (
                <div
                  key={plan.id}
                  className="p-4.5 space-y-3 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-xs leading-tight">
                      {plan.planName}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap ${
                        plan.committeeDecision === "Approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-rose-50 text-rose-700 border-rose-100"
                      }`}
                    >
                      {plan.committeeDecision === "Approved"
                        ? "✓ Approved"
                        : "✗ Rejected"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    My Vote recorded on {plan.decisionRecordedDate || "Recent"}
                  </p>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                      <span>Overall Progress</span>
                      <span
                        className={`font-bold ${
                          plan.status === "Finally Approved"
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }`}
                      >
                        {plan.status === "Finally Approved"
                          ? "Finally Approved"
                          : "Pending"}{" "}
                        ({plan.progressText})
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          plan.status === "Finally Approved"
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                        }`}
                        style={{ width: `${plan.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {plan.committeeDecision === "Rejected" &&
                    plan.rejectionReason && (
                      <div className="bg-slate-50 border border-slate-100/80 rounded-xl p-3 text-[10px] text-slate-600 italic font-semibold leading-relaxed">
                        &quot;{plan.rejectionReason}&quot;
                      </div>
                    )}

                  <Link
                    href="/workspace/my-decisions"
                    className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-0.5 transition-colors cursor-pointer"
                  >
                    View Read-only Details ↗
                  </Link>
                </div>
              ))
            )}

            {/* Box Footer Button */}
            <div className="p-3.5 bg-slate-50/50 border-t border-slate-100 text-center">
              <Link
                href="/workspace/my-decisions"
                className="inline-flex items-center justify-center w-full py-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-3xs transition-colors cursor-pointer"
              >
                View All Past Decisions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

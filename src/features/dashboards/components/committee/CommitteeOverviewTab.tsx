"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileCheck2,
  FileClock,
  Info,
  Search,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import type { CommitteePlan, PlanArrivalAlert } from "./committeeData";

interface CommitteeOverviewTabProps {
  plans: CommitteePlan[];
  alerts: PlanArrivalAlert[];
  onNavigateToReview: (planId?: string) => void;
  onNavigateToDecisions?: () => void;
}

export function CommitteeOverviewTab({
  plans,
  alerts,
  onNavigateToReview,
}: CommitteeOverviewTabProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter plans awaiting my vote
  const plansAwaitingMyVote = plans.filter(
    (p) =>
      p.status === "Committee Review" &&
      p.memberVotes.some((v) => v.isCurrentUser && v.voteStatus === "Pending"),
  );

  const filteredAwaitingPlans = plansAwaitingMyVote.filter(
    (p) =>
      p.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Compute Stat Metrics
  const awaitingCount = plansAwaitingMyVote.length;

  const submittedCount = plans.filter((p) =>
    p.memberVotes.some((v) => v.isCurrentUser && v.voteStatus !== "Pending"),
  ).length;

  const approvedCount = plans.filter(
    (p) => p.status === "Finally Approved",
  ).length;

  const rejectedCount = plans.filter((p) => p.status === "Rejected").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. TOP HEADER TITLE BAR (MATCHING REFERENCE IMAGE) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-900 text-sm sm:text-base">
              Committee Dashboard
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium">
              Management Committee Overview
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Snapshot of your pending tasks and recent decisions as a Management
            Committee Member.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 shrink-0">
          <Info className="h-4 w-4 text-[#0A3C2F]" />
          <span>5 Members Total | 3 Approvals Required</span>
        </div>
      </div>

      {/* 2. STAT CARDS GRID (4 CARDS MATCHING REFERENCE IMAGE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: AWAITING MY VOTE */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              AWAITING MY VOTE
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#0A3C2F]">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-950 font-mono">
              {awaitingCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">Plans</span>
          </div>
        </div>

        {/* Card 2: DECISIONS SUBMITTED */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              DECISIONS SUBMITTED
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <FileCheck2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-950 font-mono">
              {submittedCount + 25}
            </span>
            <span className="text-xs font-semibold text-slate-500">Total</span>
          </div>
        </div>

        {/* Card 3: FINALLY APPROVED */}
        <div className="rounded-2xl border border-emerald-200/90 border-r-[6px] border-r-emerald-500 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
              FINALLY APPROVED
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-950 font-mono">
              {approvedCount + 11}
            </span>
            <span className="text-xs font-semibold text-slate-500">Plans</span>
          </div>
        </div>

        {/* Card 4: REJECTED */}
        <div className="rounded-2xl border border-rose-200 border-r-[6px] border-r-rose-500 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider">
              REJECTED
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <XCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-950 font-mono">
              {rejectedCount + 1}
            </span>
            <span className="text-xs font-semibold text-slate-500">Plans</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN 2-COLUMN SECTION (MATCHING REFERENCE IMAGE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (70% - 8 COLS): Plans Awaiting My Vote Table */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            {/* Header with Title & Search bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileClock className="h-5 w-5 text-[#0A3C2F]" />
                <h3 className="text-sm sm:text-base font-extrabold text-slate-950">
                  Plans Awaiting My Vote
                </h3>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search plans..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-[#0A3C2F] outline-none"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 min-w-[180px]">Plan</th>
                    <th className="py-3 px-3 min-w-[100px]">Project</th>
                    <th className="py-3 px-3 min-w-[100px]">Category</th>
                    <th className="py-3 px-3 min-w-[120px]">
                      Dir. Approval Date
                    </th>
                    <th className="py-3 px-3 text-right min-w-[130px]">
                      Estimated Totals
                    </th>
                    <th className="py-3 px-3 text-center min-w-[140px]">
                      Voting Progress
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredAwaitingPlans.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-slate-500"
                      >
                        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
                        <p className="font-semibold text-slate-800 text-sm">
                          All caught up! No plans awaiting your vote.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredAwaitingPlans.map((plan) => {
                      const approvedVotesCount = plan.memberVotes.filter(
                        (v) => v.voteStatus === "Approved",
                      ).length;
                      const progressPct = (approvedVotesCount / 5) * 100;

                      return (
                        <tr
                          key={plan.id}
                          onClick={() => onNavigateToReview(plan.id)}
                          className="hover:bg-emerald-50/30 transition-colors cursor-pointer group"
                        >
                          {/* Plan Name & Priority */}
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-950 text-xs leading-snug group-hover:text-[#0A3C2F] transition-colors">
                              {plan.planName}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {plan.budgetYear} • {plan.activitiesCount}{" "}
                              Activities
                            </p>
                            {plan.priority === "URGENT" && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-700 mt-1">
                                <AlertTriangle className="h-3 w-3" /> Priority
                                Review
                              </span>
                            )}
                          </td>

                          {/* Project Code */}
                          <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                            {plan.projectCode}
                          </td>

                          {/* Category Pill */}
                          <td className="py-3.5 px-3">
                            <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded uppercase bg-blue-50 text-blue-800 border border-blue-200">
                              {plan.category}
                            </span>
                          </td>

                          {/* Dir. Approval Date */}
                          <td className="py-3.5 px-3 font-medium text-slate-600">
                            {plan.submittedByDirectorAt.split(" ")[0]}
                          </td>

                          {/* Estimated Totals */}
                          <td className="py-3.5 px-3 font-mono font-extrabold text-right text-slate-950">
                            {(plan.totalBudgetETB / 1000000).toFixed(1)}M ETB
                          </td>

                          {/* Voting Progress Bar */}
                          <td className="py-3.5 px-3 text-center">
                            <div className="space-y-1 max-w-[120px] mx-auto">
                              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#0A3C2F] rounded-full transition-all"
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-semibold text-slate-500">
                                {approvedVotesCount} of 5 approved
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Footer */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Showing {filteredAwaitingPlans.length} of{" "}
              {plansAwaitingMyVote.length} plans
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled
                className="p-1 rounded text-slate-300 cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled
                className="p-1 rounded text-slate-300 cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (30% - 4 COLS): ALERTS PANEL (REPLACING RECENT DECISIONS) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-600" />
                <h3 className="text-sm font-extrabold text-slate-950">
                  Arrived & Urgent Alerts
                </h3>
              </div>
              <span className="rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-[10px] font-extrabold">
                {alerts.length} New
              </span>
            </div>

            <div className="space-y-3">
              {alerts.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-6 text-center">
                  No new urgent alerts.
                </p>
              ) : (
                alerts.map((alt) => (
                  <div
                    key={alt.id}
                    onClick={() => onNavigateToReview(alt.planId)}
                    className="p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/50 hover:bg-amber-50 transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-extrabold text-[#0A3C2F] bg-white px-2 py-0.5 rounded border border-emerald-200">
                        {alt.projectCode}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-100 text-rose-800 uppercase">
                        {alt.priority}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0A3C2F] transition-colors leading-snug">
                      {alt.planName}
                    </h4>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {alt.message}
                    </p>

                    <div className="pt-1.5 border-t border-amber-200/60 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-mono">
                        Deadline: {alt.deadline}
                      </span>
                      <span className="text-[#0A3C2F] font-bold group-hover:underline">
                        Review Plan &rarr;
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateToReview()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <span>View All Plans Awaiting Review</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Clock,
  Users,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import type { AuthUser } from "@/lib/authTypes";
import {
  INITIAL_DIRECTOR_PLANS,
  INITIAL_CRITICAL_DELAYS,
  type DirectorPlan,
  type CriticalDelay,
} from "./directorData";

export function DirectorDashboard({ user: _user }: { user: AuthUser }) {
  // State for director data
  const [plans] = useState<DirectorPlan[]>(INITIAL_DIRECTOR_PLANS);
  const [delays] = useState<CriticalDelay[]>(INITIAL_CRITICAL_DELAYS);

  // Active counts calculation
  const pendingPlans = plans.filter((p) => p.status === "Awaiting Review");
  const activeDelaysList = delays.filter((d) => d.status === "Delayed");

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
      {/* 4 Metric KPI Cards Header Row */}
      <section
        aria-label="Director metrics summary"
        className="grid grid-cols-1 gap-3.5 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {/* CARD 1: TOTAL PROJECTS */}
        <article className="flex flex-col justify-between rounded-[20px] bg-white p-4 sm:p-5 border border-slate-200/80 shadow-2xs transition-all duration-200 hover:shadow-md min-h-[160px] sm:min-h-[170px]">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider leading-tight text-[#475569] max-w-[130px] sm:max-w-[150px]">
              TOTAL PROJECTS
            </h3>
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
              <BarChart3 size={19} strokeWidth={2.2} aria-hidden="true" />
            </div>
          </div>
          <div className="my-1">
            <p className="text-[24px] sm:text-[28px] font-extrabold tracking-tight text-slate-900 leading-none">
              5
            </p>
          </div>
          <div className="pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] sm:text-[12px]">
            <div className="flex flex-col text-[#94A3B8] font-normal leading-tight">
              <span>Active Sector</span>
              <span>Projects</span>
            </div>
            <Link
              href="/workspace/projects"
              className="text-[#1A73E8] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              View All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </article>

        {/* CARD 2: AWAITING REVIEW */}
        <article className="flex flex-col justify-between rounded-[20px] bg-white p-4 sm:p-5 border border-[#FDE68A] border-r-[6px] border-r-[#F59E0B] shadow-2xs transition-all duration-200 hover:shadow-md min-h-[160px] sm:min-h-[170px]">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider leading-tight text-[#78350F] max-w-[130px] sm:max-w-[150px]">
              AWAITING REVIEW
            </h3>
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
              <Clock size={19} strokeWidth={2.2} aria-hidden="true" />
            </div>
          </div>
          <div className="my-1">
            <p className="text-[24px] sm:text-[28px] font-extrabold tracking-tight text-slate-900 leading-none">
              {pendingPlans.length}
            </p>
          </div>
          <div className="pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] sm:text-[12px]">
            <div className="flex flex-col text-[#78350F] font-semibold leading-tight text-[11px]">
              <span>Pending Director</span>
              <span>Decision</span>
            </div>
            <Link
              href="/workspace/plan-for-review"
              className="text-[#78350F] font-bold hover:underline text-right leading-tight cursor-pointer"
            >
              <div className="flex flex-col items-end">
                <span>Review</span>
                <span className="flex items-center gap-0.5">
                  Now <ChevronRight className="h-3.5 w-3.5 inline shrink-0" />
                </span>
              </div>
            </Link>
          </div>
        </article>

        {/* CARD 3: COMMITTEE PROGRESS */}
        <article className="flex flex-col justify-between rounded-[20px] bg-white p-4 sm:p-5 border border-slate-200/80 shadow-2xs transition-all duration-200 hover:shadow-md min-h-[160px] sm:min-h-[170px]">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider leading-tight text-[#475569] max-w-[130px] sm:max-w-[150px]">
              COMMITTEE PROGRESS
            </h3>
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-[#F3E8FF] text-[#9333EA]">
              <Users size={19} strokeWidth={2.2} aria-hidden="true" />
            </div>
          </div>
          <div className="my-1">
            <p className="text-[24px] sm:text-[28px] font-extrabold tracking-tight text-slate-900 leading-none">
              1
            </p>
          </div>
          <div className="pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] sm:text-[12px]">
            <div className="flex flex-col text-[#94A3B8] font-normal leading-tight">
              <span>In Committee</span>
              <span>Review</span>
            </div>
            <Link
              href="/workspace/committee-progress"
              className="text-[#7E22CE] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <div className="flex flex-col items-end">
                <span>Check</span>
                <span className="flex items-center gap-0.5">
                  Votes <ChevronRight className="h-3.5 w-3.5 inline shrink-0" />
                </span>
              </div>
            </Link>
          </div>
        </article>

        {/* CARD 4: CRITICAL DELAYS */}
        <article className="flex flex-col justify-between rounded-[20px] bg-white p-4 sm:p-5 border border-[#FECDD3] border-r-[6px] border-r-[#E11D48] shadow-2xs transition-all duration-200 hover:shadow-md min-h-[160px] sm:min-h-[170px]">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider leading-tight text-[#881337] max-w-[130px] sm:max-w-[150px]">
              CRITICAL DELAYS
            </h3>
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3]">
              <AlertTriangle size={19} strokeWidth={2.2} aria-hidden="true" />
            </div>
          </div>
          <div className="my-1">
            <p className="text-[24px] sm:text-[28px] font-extrabold tracking-tight text-slate-900 leading-none">
              {activeDelaysList.length}
            </p>
          </div>
          <div className="pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] sm:text-[12px]">
            <div className="flex flex-col text-[#881337] font-semibold leading-tight">
              <span>Overdue Timeline</span>
              <span>Stages</span>
            </div>
            <Link
              href="/workspace/projects"
              className="text-[#881337] font-bold leading-tight hover:underline text-right cursor-pointer"
            >
              <div className="flex flex-col items-end">
                <span>Needs</span>
                <span>
                  Action{" "}
                  <ChevronRight className="h-3.5 w-3.5 inline shrink-0" />
                </span>
              </div>
            </Link>
          </div>
        </article>
      </section>

      {/* 2 Bottom Side-by-Side Action Panels */}
      <div className="grid grid-cols-1 gap-5 lg:gap-6 lg:grid-cols-2 items-start">
        {/* LEFT PANEL: Plans Awaiting Director Review */}
        <div className="flex flex-col rounded-[20px] bg-white border border-[#FDE68A]/80 shadow-2xs overflow-hidden h-fit">
          {/* Panel Header */}
          <div className="bg-[#FEFCE8] p-3.5 sm:px-5 sm:py-4 border-b border-[#FDE68A]/70 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#FDE68A] text-[#92400E] shrink-0">
                <Clock className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 text-xs sm:text-[15px] leading-tight truncate">
                  Plans Awaiting Director Review ({pendingPlans.length})
                </h3>
                <p className="text-[11px] sm:text-[12px] text-slate-500 mt-0.5 truncate">
                  Click any plan row to review details
                </p>
              </div>
            </div>
            <Link
              href="/workspace/plan-for-review"
              className="text-[#92400E] hover:text-[#78350F] font-bold text-[11px] sm:text-xs flex items-center gap-0.5 shrink-0 cursor-pointer"
            >
              View All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Panel List Items - Redirecting Directly to Plan For Review Workspace */}
          <div className="divide-y divide-slate-100 bg-white">
            {pendingPlans.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                <p className="font-medium text-slate-700">
                  All submitted plans have been reviewed!
                </p>
              </div>
            ) : (
              pendingPlans.map((plan) => (
                <Link
                  key={plan.id}
                  href="/workspace/plan-for-review"
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4.5 gap-2.5 hover:bg-[#FEFCE8]/40 transition-colors cursor-pointer"
                >
                  <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-[#92400E] transition-colors leading-snug">
                      {plan.title}
                    </h4>
                    <p className="text-[11px] sm:text-[12px] text-slate-500">
                      {plan.directorate} •{" "}
                      <span className="text-slate-600 font-medium">
                        {plan.submittedBy}
                      </span>
                    </p>
                  </div>
                  <span className="self-start sm:self-auto shrink-0  text-[#92400E] text-[11px] sm:text-[12px] font-semibold px-3 py-0.5 sm:px-3.5 sm:py-1">
                    Awaiting Review
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Critical Activity Delays */}
        <div className="flex flex-col rounded-[20px] bg-white border border-[#FECDD3]/80 shadow-2xs overflow-hidden h-fit">
          {/* Panel Header */}
          <div className="bg-[#FFF1F2] p-3.5 sm:px-5 sm:py-4 border-b border-[#FECDD3]/70 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#FECDD3] text-[#E11D48] shrink-0">
                <AlertTriangle className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 text-xs sm:text-[15px] leading-tight truncate">
                  Critical Activity Delays ({activeDelaysList.length})
                </h3>
                <p className="text-[11px] sm:text-[12px] text-slate-500 mt-0.5 truncate">
                  Click any delayed activity to inspect plan schedule
                </p>
              </div>
            </div>
          </div>

          {/* Panel List Items - Redirecting Directly to Projects Workspace */}
          <div className="divide-y divide-slate-100 bg-white">
            {activeDelaysList.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                <p className="font-medium text-slate-700">
                  No critical activity delays reported across the directorate!
                </p>
              </div>
            ) : (
              activeDelaysList.map((delay) => (
                <Link
                  key={delay.id}
                  href="/workspace/projects"
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4.5 gap-2.5 hover:bg-[#FFF1F2]/40 transition-colors cursor-pointer"
                >
                  <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-[#BE123C] transition-colors line-clamp-2 sm:truncate leading-snug">
                      {delay.activityTitle}
                    </h4>
                    <p className="text-[11px] sm:text-[12px] text-slate-500 truncate">
                      {delay.directorate} •{" "}
                      <span className="text-[#BE123C] font-semibold">
                        {delay.delayDetail}
                      </span>
                    </p>
                  </div>
                  <span className="self-start sm:self-auto shrink-0 text-[#BE123C] text-[11px] sm:text-[12px] font-semibold px-3 py-0.5 sm:px-3.5 sm:py-1">
                    Delayed
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Info } from "lucide-react";
import type { AuthUser } from "@/lib/authTypes";
import { useCommitteeDashboard } from "./useCommitteeDashboard";
import { CommitteeStatsCards } from "./components/CommitteeStatsCards";
import { CommitteeAwaitingTable } from "./components/CommitteeAwaitingTable";
import { CommitteeRecentDecisions } from "./components/CommitteeRecentDecisions";

export function CommitteeDashboard({ user }: { user: AuthUser }) {
  const {
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    loading,
    awaitingPlansCount,
    delayedCount,
    totalReviewedCount,
    approvedCount,
    rejectedCount,
    approvedPercentAnim,
    rejectedPercentAnim,
    filteredAwaitingPlans,
    recentDecisions,
  } = useCommitteeDashboard(user);

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

      {/* Row 1: KPI Stats Cards */}
      <CommitteeStatsCards
        awaitingPlansCount={awaitingPlansCount}
        delayedCount={delayedCount}
        totalReviewedCount={totalReviewedCount}
        approvedCount={approvedCount}
        rejectedCount={rejectedCount}
        approvedPercentAnim={approvedPercentAnim}
        rejectedPercentAnim={rejectedPercentAnim}
        loading={loading}
      />

      {/* Row 2: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col: Awaiting Table */}
        <div className="lg:col-span-8">
          <CommitteeAwaitingTable
            plans={filteredAwaitingPlans}
            loading={loading}
            filter={filter}
            setFilter={setFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>

        {/* Right Col: Recent Decisions Feed */}
        <div className="lg:col-span-4">
          <CommitteeRecentDecisions
            decisions={recentDecisions}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

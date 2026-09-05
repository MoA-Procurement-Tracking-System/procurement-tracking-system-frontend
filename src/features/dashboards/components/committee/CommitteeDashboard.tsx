"use client";

import { Info } from "lucide-react";
import type { AuthUser } from "@/lib/authTypes";
import { useState, useEffect } from "react";
import { fetchPlans, mapBackendPlanToFrontend } from "@/lib/plansApi";
import {
  INITIAL_PLANS,
  type ProcurementPlan,
} from "@/features/plans/plansData";

import { CommitteeStatsCards } from "./components/CommitteeStatsCards";
import { CommitteeAwaitingTable } from "./components/CommitteeAwaitingTable";
import { CommitteeRecentDecisions } from "./components/CommitteeRecentDecisions";

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

        const planMap = new Map<string, ProcurementPlan>();
        INITIAL_PLANS.forEach((p) => planMap.set(p.id, p));
        mapped.forEach((p) => planMap.set(p.id, p));

        setPlans(Array.from(planMap.values()));
      } catch (err) {
        console.error("Dashboard failed to load plans:", err);
        setPlans([...INITIAL_PLANS]);
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
      <CommitteeStatsCards
        delayedCount={delayedCount}
        awaitingCount={awaitingPlans.length}
        totalReviewedCount={totalReviewedCount}
        approvedCount={approvedCount}
        rejectedCount={rejectedCount}
        approvedPercent={approvedPercent}
        rejectedPercent={rejectedPercent}
        approvedPercentAnim={approvedPercentAnim}
        rejectedPercentAnim={rejectedPercentAnim}
        filter={filter}
        onToggleDelayedFilter={() =>
          setFilter(filter === "delayed" ? "all" : "delayed")
        }
        onSelectAllFilter={() => setFilter("all")}
      />

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Column: Plans Awaiting My Vote (colspan 2) */}
        <div className="lg:col-span-2 space-y-6">
          <CommitteeAwaitingTable
            filteredAwaitingPlans={filteredAwaitingPlans}
            totalAwaitingCount={awaitingPlans.length}
            loading={loading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filter={filter}
            onClearFilter={() => setFilter("all")}
          />
        </div>

        {/* Right Column: My Recent Decisions (colspan 1) */}
        <CommitteeRecentDecisions
          recentDecisions={recentDecisions}
          loading={loading}
        />
      </div>
    </div>
  );
}

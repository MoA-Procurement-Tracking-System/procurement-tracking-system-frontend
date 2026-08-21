"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { AuthUser } from "@/lib/authTypes";
import {
  INITIAL_COMMITTEE_PLANS,
  INITIAL_PLAN_ALERTS,
  type CommitteePlan,
  type PlanArrivalAlert,
} from "./committeeData";
import { CommitteeOverviewTab } from "./CommitteeOverviewTab";
import { CommitteePlanReviewTab } from "./CommitteePlanReviewTab";
import { CommitteeMyDecisionsTab } from "./CommitteeMyDecisionsTab";

export type CommitteeTab = "OVERVIEW" | "REVIEW" | "MY_DECISIONS";

export function CommitteeDashboard({ user: _user }: { user: AuthUser }) {
  const [activeTab, setActiveTab] = useState<CommitteeTab>("OVERVIEW");

  // Selected Demo Committee Member ID (Default: W/ro Gennet Zewde - m-1)
  const [currentMemberId] = useState<string>("m-1");

  // Committee dataset state
  const [plans, setPlans] = useState<CommitteePlan[]>(INITIAL_COMMITTEE_PLANS);
  const [alerts, setAlerts] = useState<PlanArrivalAlert[]>(INITIAL_PLAN_ALERTS);

  // Jump-to plan ID selection
  const [selectedPlanForReviewId, setSelectedPlanForReviewId] = useState<
    string | null
  >(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Compute plans with dynamically flagged isCurrentUser based on currentMemberId
  const computedPlans: CommitteePlan[] = plans.map((plan) => ({
    ...plan,
    memberVotes: plan.memberVotes.map((mem) => ({
      ...mem,
      isCurrentUser: mem.id === currentMemberId,
    })),
  }));

  // Handle voting submission for active committee member
  const handleVoteSubmit = (
    planId: string,
    voteStatus: "Approved" | "Rejected",
    comment: string,
  ) => {
    const formattedDate = new Date().toLocaleString("en-US", {
      dateStyle: "short",
      timeStyle: "short",
    });

    setPlans((prevPlans) =>
      prevPlans.map((plan) => {
        if (plan.id !== planId) return plan;

        const updatedVotes = plan.memberVotes.map((mem) => {
          if (mem.id === currentMemberId) {
            return {
              ...mem,
              voteStatus,
              comment,
              votedAt: formattedDate,
            };
          }
          return mem;
        });

        // Determine overall status
        const approvedCount = updatedVotes.filter(
          (v) => v.voteStatus === "Approved",
        ).length;
        const rejectedCount = updatedVotes.filter(
          (v) => v.voteStatus === "Rejected",
        ).length;

        let newStatus = plan.status;
        if (approvedCount === 5) {
          newStatus = "Finally Approved";
        } else if (rejectedCount >= 2) {
          newStatus = "Rejected";
        }

        return {
          ...plan,
          memberVotes: updatedVotes,
          status: newStatus,
        };
      }),
    );

    // Remove alert if voted
    setAlerts((prev) => prev.filter((a) => a.planId !== planId));
  };

  const handleNavigateToReview = (planId?: string) => {
    if (planId) {
      setSelectedPlanForReviewId(planId);
    }
    setActiveTab("REVIEW");
  };

  const handleNavigateToDecisions = () => {
    setActiveTab("MY_DECISIONS");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 rounded-xl bg-slate-900 text-white px-4 py-3 shadow-xl border border-slate-700 animate-in slide-in-from-top-3 max-w-md">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-medium leading-relaxed">{toastMessage}</p>
        </div>
      )}

      {/* Active Tab View */}
      {activeTab === "OVERVIEW" && (
        <CommitteeOverviewTab
          plans={computedPlans}
          alerts={alerts}
          onNavigateToReview={handleNavigateToReview}
          onNavigateToDecisions={handleNavigateToDecisions}
        />
      )}

      {activeTab === "REVIEW" && (
        <CommitteePlanReviewTab
          plans={computedPlans}
          selectedPlanId={selectedPlanForReviewId}
          onVoteSubmit={handleVoteSubmit}
          showToast={showToast}
        />
      )}

      {activeTab === "MY_DECISIONS" && (
        <CommitteeMyDecisionsTab plans={computedPlans} />
      )}
    </div>
  );
}

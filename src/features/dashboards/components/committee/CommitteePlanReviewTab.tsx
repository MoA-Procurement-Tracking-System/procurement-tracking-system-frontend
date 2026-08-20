"use client";

import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Filter,
  ListChecks,
  RotateCcw,
  Search,
  ShieldCheck,
  User,
  UserCheck,
  XCircle,
} from "lucide-react";
import type { CommitteePlan } from "./committeeData";

interface CommitteePlanReviewTabProps {
  plans: CommitteePlan[];
  selectedPlanId?: string | null;
  onVoteSubmit: (
    planId: string,
    voteStatus: "Approved" | "Rejected",
    comment: string,
  ) => void;
  showToast: (msg: string) => void;
}

export function CommitteePlanReviewTab({
  plans,
  selectedPlanId,
  onVoteSubmit,
  showToast,
}: CommitteePlanReviewTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Selection states
  const [activePlanId, setActivePlanId] = useState<string | null>(
    selectedPlanId || null,
  );
  const [viewingActivitiesPlan, setViewingActivitiesPlan] =
    useState<CommitteePlan | null>(null);

  // Form states for Voting
  const [commentText, setCommentText] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectedPlan = plans.find((p) => p.id === activePlanId) || null;

  // Filter plans
  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.officerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.planNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "REVIEW"
          ? plan.status === "Committee Review"
          : statusFilter === "APPROVED"
            ? plan.status === "Finally Approved"
            : statusFilter === "REJECTED"
              ? plan.status === "Rejected"
              : true;

    return matchesSearch && matchesStatus;
  });

  // Handle voting submission with mandatory comment check for Reject
  const handlePerformVote = (chosenVote: "Approved" | "Rejected") => {
    setValidationError(null);

    if (chosenVote === "Rejected" && !commentText.trim()) {
      setValidationError(
        "Comment is mandatory when rejecting a plan. Please specify required revisions or rejection reasons to be sent to the Director.",
      );
      return;
    }

    if (!selectedPlan) return;

    onVoteSubmit(selectedPlan.id, chosenVote, commentText.trim());

    showToast(
      `Your decision (${chosenVote}) and comments for "${selectedPlan.planName}" were saved & transmitted to the Director!`,
    );

    // Reset local state
    setCommentText("");
    setValidationError(null);
  };

  // VIEW 1: INSPECT PLAN ACTIVITIES TABLE ("plans in activity")
  if (viewingActivitiesPlan) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="space-y-1">
            <button
              onClick={() => setViewingActivitiesPlan(null)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A3C2F] hover:underline cursor-pointer mb-1"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Plan Review List
            </button>
            <h2 className="text-lg font-extrabold text-slate-950">
              Activities Breakdown under {viewingActivitiesPlan.planName}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
              <span>
                Officer:{" "}
                <strong className="text-slate-900">
                  {viewingActivitiesPlan.officerName}
                </strong>
              </span>
              <span>•</span>
              <span>
                Director:{" "}
                <strong className="text-slate-900">
                  {viewingActivitiesPlan.directorName}
                </strong>
              </span>
              <span>•</span>
              <span className="font-mono text-slate-800">
                Budget: ETB{" "}
                {viewingActivitiesPlan.totalBudgetETB.toLocaleString()}
              </span>
            </div>
          </div>

          <span className="font-mono text-xs font-extrabold text-[#0A3C2F] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded">
            {viewingActivitiesPlan.activities.length} Package Activities
          </span>
        </div>

        {/* Activities List Table */}
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#0A3C2F] text-white text-[11px] font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-3 text-center w-10">#</th>
                  <th className="py-3 px-3 min-w-[120px]">Code</th>
                  <th className="py-3 px-3 min-w-[240px]">
                    Activity Description
                  </th>
                  <th className="py-3 px-3 min-w-[120px]">Category</th>
                  <th className="py-3 px-3 min-w-[100px]">Unit & Qty</th>
                  <th className="py-3 px-3 text-right min-w-[140px]">
                    Est. Cost (ETB)
                  </th>
                  <th className="py-3 px-3 min-w-[180px]">
                    Procurement Method
                  </th>
                  <th className="py-3 px-3 min-w-[110px]">Target Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {viewingActivitiesPlan.activities.map((act, index) => (
                  <tr
                    key={act.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-3 px-3 font-mono text-slate-400 font-semibold text-center">
                      {index + 1}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {act.activityCode}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-950">
                      {act.description}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">
                      {act.category}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-800">
                      {act.quantity} {act.unit}
                    </td>
                    <td className="py-3 px-3 font-mono font-extrabold text-[#0A3C2F] text-right">
                      {act.estimatedCostETB.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-600">
                      {act.procurementMethod}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {act.targetDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // VIEW 2: CLEAN PLAN REVIEW & VOTING FORM (Without showing other member votes here)
  if (selectedPlan) {
    const myVote = selectedPlan.memberVotes.find((v) => v.isCurrentUser);

    return (
      <div className="space-y-6 animate-in fade-in duration-200 pb-12">
        {/* Navigation bar */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setActivePlanId(null)}
            className="text-slate-500 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1 font-bold text-[#0A3C2F]"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Plans List
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-bold text-slate-800">
            Voting: {selectedPlan.planName}
          </span>
        </div>

        {/* Top Plan Header Card */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-extrabold text-[#0A3C2F] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  {selectedPlan.projectCode}
                </span>
                <span className="font-mono text-xs text-slate-400">
                  {selectedPlan.planNumber}
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                    selectedPlan.priority === "URGENT"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {selectedPlan.priority} Priority
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                {selectedPlan.planName}
              </h1>

              {/* OFFICER & DIRECTOR DETAILS */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                <span className="flex items-center gap-1 font-semibold text-slate-800">
                  <User className="h-3.5 w-3.5 text-emerald-700" /> Prepared by
                  Officer:{" "}
                  <strong className="text-slate-950">
                    {selectedPlan.officerName}
                  </strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-700">
                  <UserCheck className="h-3.5 w-3.5 text-blue-700" /> Forwarded
                  by Director:{" "}
                  <strong className="text-slate-950">
                    {selectedPlan.directorName}
                  </strong>
                </span>
              </div>
            </div>

            <div className="text-right space-y-1">
              <span
                className={`inline-block text-xs font-extrabold px-3 py-1 rounded-full ${
                  selectedPlan.status === "Committee Review"
                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                    : selectedPlan.status === "Finally Approved"
                      ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                      : "bg-rose-100 text-rose-900 border border-rose-300"
                }`}
              >
                {selectedPlan.status}
              </span>
              <p className="text-xs font-mono font-bold text-[#0A3C2F]">
                Total Budget: ETB {selectedPlan.totalBudgetETB.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3 text-slate-600">
              <span>
                Category: <strong>{selectedPlan.category}</strong>
              </span>
              <span>•</span>
              <span>
                Budget Year: <strong>{selectedPlan.budgetYear}</strong>
              </span>
            </div>

            <button
              onClick={() => setViewingActivitiesPlan(selectedPlan)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0A3C2F] text-white hover:bg-[#072b22] text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <ListChecks className="h-4 w-4 text-[#A3E635]" />
              <span>
                Inspect {selectedPlan.activitiesCount} Package Activities
              </span>
            </button>
          </div>
        </section>

        {/* Clean Single Voting Card (Other votes panel removed here, displayed only in My Decisions) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="h-5 w-5 text-[#0A3C2F]" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Committee Decision & Written Comments (Sent to Director)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Your decision and comment will be recorded and transmitted
                directly to the Director.
              </p>
            </div>
          </div>

          {/* Status banner if already voted */}
          {myVote?.voteStatus !== "Pending" && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                myVote?.voteStatus === "Approved"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-rose-50 border-rose-200 text-rose-900"
              }`}
            >
              <div className="flex items-center gap-2">
                {myVote?.voteStatus === "Approved" ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-rose-600" />
                )}
                <div>
                  <p className="text-xs font-bold">
                    Your decision is currently recorded as: {myVote?.voteStatus}
                  </p>
                  {myVote?.comment && (
                    <p className="text-xs italic mt-0.5 text-slate-700">
                      Comment sent to Director: &quot;{myVote.comment}&quot;
                    </p>
                  )}
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Recorded: {myVote?.votedAt}
              </span>
            </div>
          )}

          {/* Mandatory Comment Alert Error */}
          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2.5 animate-in shake duration-200">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold leading-relaxed">
                {validationError}
              </p>
            </div>
          )}

          {/* Comment Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Decision Comment & Feedback for Director{" "}
              <span className="text-rose-600 font-normal">
                *(Mandatory if Rejecting)*
              </span>
            </label>
            <textarea
              rows={4}
              value={commentText}
              onChange={(e) => {
                setCommentText(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="Specify technical, financial or compliance feedback (Comment is sent to Director on Approval/Rejection, and mandatory when Rejecting)..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-[#0A3C2F]"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handlePerformVote("Approved")}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0A3C2F] text-white hover:bg-[#072b22] text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4 text-[#A3E635]" />
              <span>Approve Plan (Send Decision to Director)</span>
            </button>

            <button
              type="button"
              onClick={() => handlePerformVote("Rejected")}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reject Plan (Send Comment to Director)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN PLAN REVIEW TABLE
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Search & Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search plans by Project Code, Officer Name or Plan Title..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:border-[#0A3C2F] outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent font-semibold text-slate-700 outline-none text-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="REVIEW">In Committee Review (Active)</option>
            <option value="APPROVED">Finally Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Plans Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[960px]">
            <thead>
              <tr className="bg-[#0A3C2F] text-white text-[11px] font-extrabold uppercase tracking-wider">
                <th className="py-3 px-3 text-center w-10">#</th>
                <th className="py-3 px-3 min-w-[120px]">Project Code</th>
                <th className="py-3 px-3 min-w-[200px]">Plan Name & Code</th>
                <th className="py-3 px-3 min-w-[160px]">Prepared by Officer</th>
                <th className="py-3 px-3 min-w-[100px]">Priority</th>
                <th className="py-3 px-3 text-right min-w-[130px]">
                  Total Budget (ETB)
                </th>
                <th className="py-3 px-3 text-center min-w-[120px]">
                  My Decision
                </th>
                <th className="py-3 px-3 text-center min-w-[120px]">
                  Plan Status
                </th>
                <th className="py-3 px-3 text-center min-w-[130px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700 text-sm">
                      No procurement plans found matching criteria
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPlans.map((plan, index) => {
                  const myVote = plan.memberVotes.find((v) => v.isCurrentUser);

                  return (
                    <tr
                      key={plan.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3 px-3 font-mono text-slate-400 font-semibold text-center">
                        {index + 1}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-mono font-extrabold text-[#0A3C2F] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs">
                          {plan.projectCode}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900 text-xs leading-snug">
                          {plan.planName}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {plan.planNumber}
                        </p>
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {plan.officerName}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                            plan.priority === "URGENT"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {plan.priority}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-right text-slate-900">
                        {plan.totalBudgetETB.toLocaleString()}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            myVote?.voteStatus === "Approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : myVote?.voteStatus === "Rejected"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {myVote?.voteStatus === "Pending"
                            ? "Pending"
                            : myVote?.voteStatus}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`text-xs font-extrabold ${
                            plan.status === "Committee Review"
                              ? "text-amber-800"
                              : plan.status === "Finally Approved"
                                ? "text-emerald-800"
                                : "text-rose-800"
                          }`}
                        >
                          {plan.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setActivePlanId(plan.id)}
                            title="Vote & Review Plan"
                            className="flex h-7 px-2.5 items-center gap-1 rounded-lg bg-[#0A3C2F] text-white hover:bg-[#072b22] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                          >
                            <ClipboardCheck className="h-3.5 w-3.5" />
                            <span>Vote</span>
                          </button>

                          <button
                            onClick={() => setViewingActivitiesPlan(plan)}
                            title="View Plan Activities"
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-[#0A3C2F] border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                          >
                            <ListChecks className="h-3.5 w-3.5" />
                          </button>
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
    </div>
  );
}

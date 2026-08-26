"use client";

import { useState, useEffect } from "react";
import {
  ClipboardCheck,
  CheckCircle2,
  RotateCcw,
  Send,
  ListChecks,
  Search,
  FileText,
  ArrowLeft,
  ChevronRight,
  Home,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { type ProcurementPlan } from "../plansData";
import {
  fetchPlans,
  submitVote,
  mapBackendPlanToFrontend,
} from "../../../lib/plansApi";
import type { AuthUser } from "../../../lib/authTypes";
import {
  INITIAL_PROJECTS,
  type ProjectItem,
} from "../../dashboards/components/director/projects/projectsData";
import { CreatePlanForm } from "./CreatePlanForm";
import { ActivitiesListView } from "../../activities/components/ActivitiesListView";

interface PlanForReviewViewProps {
  user: AuthUser;
}

export function PlanForReviewView({ user }: PlanForReviewViewProps) {
  const [plans, setPlans] = useState<ProcurementPlan[]>([]);
  const [projects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const loadPlans = async () => {
    try {
      setLoading(true);
      const rawPlans = await fetchPlans();
      const mapped = rawPlans.map((p) => mapBackendPlanToFrontend(p, user.id));
      setPlans(mapped);
    } catch (err) {
      console.error(err);
      showToast("Failed to load plans from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPlans();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const [searchTerm, setSearchTerm] = useState("");

  // Selection states
  const [selectedPlanForReview, setSelectedPlanForReview] =
    useState<ProcurementPlan | null>(null);
  const [editingPlan, setEditingPlan] = useState<ProcurementPlan | null>(null);
  const [activitiesPlan, setActivitiesPlan] = useState<ProcurementPlan | null>(
    null,
  );

  const [returnRemarks, setReturnRemarks] = useState("");

  // Filter plans awaiting review only
  const filteredPlans = plans.filter((p) => {
    let isAwaitingReview = false;
    if (user.role === "ENDORSING_COMMITTEE") {
      const alreadyVoted = p.committeeDecision !== undefined;
      isAwaitingReview = p.status === "Committee Review" && !alreadyVoted;
    } else {
      isAwaitingReview =
        p.status === "Submitted to Director" || p.status === "Returned";
    }
    const matchesSearch =
      p.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projectCode.toLowerCase().includes(searchTerm.toLowerCase());
    return isAwaitingReview && matchesSearch;
  });

  const getProjectForPlan = (projectCode: string): ProjectItem => {
    return (
      projects.find((pr) => pr.code === projectCode) || {
        id: "p-fallback",
        code: projectCode,
        name: `${projectCode} Project`,
        countryOrg: "Ethiopia",
        executingAgency: "Ministry of Agriculture (MoA)",
        region: "Federal",
        budgetYear: "2018 EFY",
        fundingSource: "African Development Bank (AfDB)",
        fundingType: "Loan & Grant",
        loanGrantNumbers: ["P-Z1-C00-080"],
        components: ["Component 1"],
        subcomponents: [],
        currency: "USD",
        sector: "Agriculture",
        assignedOfficers: [],
        description: "Sector project",
        status: "Active",
        createdAt: "2025-01-01",
      }
    );
  };

  // Director Decision 1: Approve & Send to Endorsement Committee
  const handleApprovePlan = (plan: ProcurementPlan) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.id === plan.id
          ? {
              ...p,
              status: "Committee Review",
              approvalDate: new Date().toISOString().split("T")[0],
            }
          : p,
      ),
    );
    setSelectedPlanForReview(null);
    showToast(
      `Plan "${plan.planName}" approved and forwarded to Endorsement Committee!`,
    );
  };

  // Director Decision 2: Send Back to Officer for Revision
  const handleReturnPlan = (plan: ProcurementPlan) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.id === plan.id
          ? {
              ...p,
              status: "Returned",
              description: returnRemarks.trim()
                ? `[Returned Note: ${returnRemarks}] ${p.description || ""}`
                : p.description,
            }
          : p,
      ),
    );
    setSelectedPlanForReview(null);
    setReturnRemarks("");
    showToast(
      `Plan "${plan.planName}" returned to Procurement Officer for revision.`,
    );
  };

  // Committee Decision 1: Approve
  const handleCommitteeApprove = async (plan: ProcurementPlan) => {
    try {
      await submitVote(plan.id, "APPROVE");
      showToast(`Plan "${plan.planName}" has been endorsed and approved!`);
      await loadPlans();
      setSelectedPlanForReview(null);
      setReturnRemarks("");
    } catch (err) {
      console.error(err);
      const errMsg =
        err instanceof Error ? err.message : "Failed to submit approval vote.";
      showToast(errMsg);
    }
  };

  // Committee Decision 2: Reject
  const handleCommitteeReject = async (plan: ProcurementPlan) => {
    if (!returnRemarks.trim()) {
      showToast("Reason for rejection is mandatory.");
      return;
    }
    try {
      await submitVote(plan.id, "REJECT", returnRemarks.trim());
      showToast(`Plan "${plan.planName}" was rejected and returned.`);
      await loadPlans();
      setSelectedPlanForReview(null);
      setReturnRemarks("");
    } catch (err) {
      console.error(err);
      const errMsg =
        err instanceof Error ? err.message : "Failed to submit rejection vote.";
      showToast(errMsg);
    }
  };

  const handleSavePlanEdits = (savedPlan: ProcurementPlan) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === savedPlan.id ? savedPlan : p)),
    );
    setEditingPlan(null);
    showToast(`Restricted plan edits saved for "${savedPlan.planName}".`);
  };

  // VIEW 1: Activity List Table under Particular Plan (Clean single breadcrumb)
  if (activitiesPlan) {
    const proj = getProjectForPlan(activitiesPlan.projectCode);
    return (
      <ActivitiesListView
        plan={activitiesPlan}
        project={proj}
        userRole="DIRECTOR"
        parentSection="plan-for-review"
        onBackClick={() => setActivitiesPlan(null)}
      />
    );
  }

  // VIEW 2: Director Restricted Form Edit View
  if (editingPlan) {
    const proj = getProjectForPlan(editingPlan.projectCode);
    return (
      <div className="space-y-4">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs"
        >
          <Link
            href="/dashboard"
            className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
          >
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <button
            onClick={() => setEditingPlan(null)}
            className="text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Plan for Review
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-bold text-[#0A3C2F]">
            Restricted Plan Edits ({editingPlan.planName})
          </span>
        </nav>

        <CreatePlanForm
          project={proj}
          initialData={editingPlan}
          userRole="DIRECTOR"
          onBackClick={() => setEditingPlan(null)}
          onSavePlan={handleSavePlanEdits}
        />
      </div>
    );
  }

  // VIEW 3: FULL-SCREEN PLAN REVIEW VIEW (Replaces Slide-over Drawer)
  if (selectedPlanForReview) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200 pb-12">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-3 rounded-xl bg-slate-900 text-white px-4 py-3 shadow-xl border border-slate-700 animate-in slide-in-from-top-3 max-w-md">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <p className="text-xs font-medium leading-relaxed">
              {toastMessage}
            </p>
          </div>
        )}

        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs"
        >
          <Link
            href="/dashboard"
            className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
          >
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <button
            onClick={() => setSelectedPlanForReview(null)}
            className="text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Plan for Review
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-bold text-[#0A3C2F]">
            Review: {selectedPlanForReview.planName}
          </span>
        </nav>

        {/* Full Screen Header Banner */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedPlanForReview(null)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0A3C2F] hover:underline cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Plans List
                </button>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-xs font-extrabold text-[#0A3C2F] bg-white px-2 py-0.5 rounded border border-emerald-200">
                  {selectedPlanForReview.projectCode}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                {selectedPlanForReview.planName}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                <span>
                  Category:{" "}
                  <strong className="text-slate-900">
                    {selectedPlanForReview.category}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Fiscal Year:{" "}
                  <strong className="text-slate-900">
                    {selectedPlanForReview.budgetYear}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Region:{" "}
                  <strong className="text-slate-900">
                    {selectedPlanForReview.organizationRegion}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Coverage:{" "}
                  <strong className="text-slate-900">
                    {selectedPlanForReview.planPeriodFrom} to{" "}
                    {selectedPlanForReview.planPeriodTo}
                  </strong>
                </span>
              </div>
            </div>

            <span className="text-xs font-extrabold text-amber-800">
              {selectedPlanForReview.status}
            </span>
          </div>
        </section>

        {/* Main Review Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Plan Scope & Activities */}
          <div className="lg:col-span-2 space-y-6">
            {/* Unified Plan Overview & Actions Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-5">
              {selectedPlanForReview.description && (
                <div className="space-y-1.5 border-b border-slate-100 pb-4">
                  <span className="text-[11px] font-extrabold text-[#0A3C2F] uppercase tracking-wider block">
                    Plan Description & Scope Overview
                  </span>
                  <p className="text-sm text-slate-800 italic leading-relaxed">
                    &quot;{selectedPlanForReview.description}&quot;
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Package Activities Directory
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Inspect individual procurement items, key details, and
                    roadmap milestones.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setActivitiesPlan(selectedPlanForReview);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A3C2F] text-white hover:bg-[#072b22] text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <ListChecks className="h-4 w-4 text-[#A3E635]" />
                  <span>Inspect Package Activities</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Decision Actions & Remarks */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck className="h-5 w-5 text-[#0A3C2F]" />
                <h3 className="text-sm font-bold text-slate-900">
                  {user.role === "ENDORSING_COMMITTEE"
                    ? "Committee Decision & Workflow Actions"
                    : "Director Decision & Workflow Actions"}
                </h3>
              </div>

              {/* Revision Remarks Textarea */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  {user.role === "ENDORSING_COMMITTEE"
                    ? "Reason for Rejection / Notes"
                    : "Revision Notes (If returning to Officer)"}
                  {user.role === "ENDORSING_COMMITTEE" && (
                    <span className="text-rose-500 ml-1">
                      * Mandatory for rejection
                    </span>
                  )}
                </label>
                <textarea
                  rows={4}
                  value={returnRemarks}
                  onChange={(e) => setReturnRemarks(e.target.value)}
                  placeholder={
                    user.role === "ENDORSING_COMMITTEE"
                      ? "Specify reason for rejection..."
                      : "Specify required corrections, missing documents or revision notes for the Procurement Officer..."
                  }
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-[#0A3C2F]"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                {user.role === "ENDORSING_COMMITTEE" ? (
                  <>
                    <button
                      onClick={() =>
                        handleCommitteeApprove(selectedPlanForReview)
                      }
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0A3C2F] text-white hover:bg-[#072b22] text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                      <span>Endorse & Approve Plan</span>
                    </button>

                    <button
                      onClick={() =>
                        handleCommitteeReject(selectedPlanForReview)
                      }
                      disabled={!returnRemarks.trim()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Reject & Return Plan</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleApprovePlan(selectedPlanForReview)}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0A3C2F] text-white hover:bg-[#072b22] text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                      <span>Approve & Send to Endorsement Committee</span>
                    </button>

                    <button
                      onClick={() => handleReturnPlan(selectedPlanForReview)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Send Plan Back to Officer for Revision</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN DIRECTORY VIEW: Plans Pending Review Table
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 rounded-xl bg-slate-900 text-white px-4 py-3 shadow-xl border border-slate-700 animate-in slide-in-from-top-3 max-w-md">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <p className="text-xs font-medium leading-relaxed">{toastMessage}</p>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
        <Link
          href="/dashboard"
          className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
        >
          <Home className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="font-bold text-[#0A3C2F]">Plan for Review</span>
      </nav>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search plans by Project Code or Plan Name..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:border-[#0A3C2F] outline-none"
          />
        </div>
      </div>

      {/* Tabular Plans Pending Review */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[960px]">
            <thead>
              <tr className="bg-[#0A3C2F] text-white text-[11px] font-extrabold uppercase tracking-wider">
                <th className="py-3 px-3 text-center w-10">#</th>
                <th className="py-3 px-3 min-w-[130px]">Project Code</th>
                <th className="py-3 px-3 min-w-[180px] max-w-[220px]">
                  Plan Name
                </th>
                <th className="py-3 px-3 min-w-[130px]">Category</th>
                <th className="py-3 px-3 min-w-[140px]">Budget Year</th>
                <th className="py-3 px-3 min-w-[150px]">Coverage Period</th>
                <th className="py-3 px-3 min-w-[120px]">Region / Unit</th>
                <th className="py-3 px-3 text-center min-w-[110px]">Status</th>
                <th className="py-3 px-3 text-center min-w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-slate-500 font-medium"
                  >
                    Loading plans from server...
                  </td>
                </tr>
              ) : filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700 text-sm">
                      No procurement plans awaiting review
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Plans submitted by Officers will appear here
                      automatically.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPlans.map((plan, index) => (
                  <tr
                    key={plan.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono text-slate-400 font-semibold text-center">
                      {index + 1}
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="font-mono font-extrabold text-[#0A3C2F] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs">
                        {plan.projectCode}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 min-w-[180px] max-w-[220px]">
                      <p className="font-bold text-slate-900 text-xs leading-snug">
                        {plan.planName}
                      </p>
                      {plan.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {plan.description}
                        </p>
                      )}
                    </td>

                    <td className="py-2.5 px-3 font-bold text-slate-800">
                      {plan.category}
                    </td>

                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {plan.budgetYear}
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 text-xs">
                      <div>
                        From:{" "}
                        <span className="font-semibold text-slate-900">
                          {plan.planPeriodFrom}
                        </span>
                      </div>
                      <div>
                        To:{" "}
                        <span className="font-semibold text-slate-900">
                          {plan.planPeriodTo}
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {plan.organizationRegion}
                    </td>

                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`text-xs font-extrabold ${
                          plan.status === "Submitted to Director"
                            ? "text-amber-800"
                            : plan.status === "Committee Review"
                              ? "text-blue-800"
                              : plan.status === "Returned"
                                ? "text-rose-800"
                                : "text-slate-700"
                        }`}
                      >
                        {plan.status}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Open Full Screen Review Page */}
                        <button
                          onClick={() => setSelectedPlanForReview(plan)}
                          title="Review Plan & Decision Actions"
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0A3C2F] text-white hover:bg-[#072b22] transition-colors cursor-pointer shadow-2xs"
                        >
                          <ClipboardCheck className="h-3.5 w-3.5" />
                        </button>

                        {/* View Activity List Table under Particular Plan */}
                        <button
                          onClick={() => setActivitiesPlan(plan)}
                          title="View Package Activity List Table"
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                        >
                          <ListChecks className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

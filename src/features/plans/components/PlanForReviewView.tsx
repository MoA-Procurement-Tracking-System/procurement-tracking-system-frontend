"use client";

import { useState, useEffect, useCallback } from "react";
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
  Filter,
  Edit,
  X,
  Calendar,
  Eye,
} from "lucide-react";
import Link from "next/link";
import {
  type PlanCategory,
  type PlanStatus,
  type ProcurementPlan,
} from "../plansData";
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
import {
  INITIAL_ACTIVITIES,
  type ProcurementActivity,
} from "../../activities/activitiesData";
import { CreatePlanForm } from "./CreatePlanForm";
import { ActivitiesListView } from "../../activities/components/ActivitiesListView";
import { DirectorActivitiesListView } from "../../activities/components/DirectorActivitiesListView";
import {
  officerProjects,
  type OfficerProject,
  type ProcurementCategory,
  type ProcurementPlanSummary,
} from "../../projects/data/officerProjects";
import {
  mergeSavedPlans,
  OFFICER_PLAN_DRAFTS_STORAGE_KEY,
  parseSavedPlanRecords,
  upsertSavedPlanRecord,
} from "../../projects/data/officerPlanDrafts";
import {
  OFFICER_ACTIVITY_DRAFTS_STORAGE_KEY,
  parseSavedActivityRecords,
  type ProcurementActivitySummary,
} from "../../projects/data/officerActivityDrafts";
import { getPlanActivities } from "../../projects/data/fixtureActivityLifecycle";

interface PlanForReviewViewProps {
  user: AuthUser;
}

function mapOfficerPlanToDirectorPlan(
  project: OfficerProject,
  plan: ProcurementPlanSummary,
  savedActivities: readonly ProcurementActivitySummary[],
): ProcurementPlan {
  const activities = getPlanActivities(project, plan, savedActivities);
  return {
    id: `officer-${project.code}-${plan.reference}`,
    projectId: `proj-${project.code}`,
    projectCode: project.code,
    projectName: project.name,
    planName: plan.name,
    budgetYear: plan.budgetYear,
    category: plan.category as PlanCategory,
    planPeriodFrom: plan.planPeriod?.from?.gregorian ?? "2025-07-08",
    planPeriodTo: plan.planPeriod?.to?.gregorian ?? "2026-07-07",
    organizationRegion:
      plan.organizationRegion ?? project.organizationRegion ?? "Federal",
    description: plan.description,
    status: (plan.status === "Submitted to Director"
      ? "Submitted to Director"
      : plan.status === "Returned"
        ? "Returned"
        : plan.status === "Committee Review"
          ? "Committee Review"
          : "Submitted to Director") as PlanStatus,
    createdBy: project.assignedOfficers?.[0] ?? "Assigned Officer",
    createdAt: "2026-08-26",
    activitiesCount: activities.length,
  };
}

function getOfficerReviewPlans(): ProcurementPlan[] {
  try {
    const savedRecords = parseSavedPlanRecords(
      typeof window !== "undefined"
        ? window.localStorage.getItem(OFFICER_PLAN_DRAFTS_STORAGE_KEY)
        : null,
    );
    const savedActivityRecords = parseSavedActivityRecords(
      typeof window !== "undefined"
        ? window.localStorage.getItem(OFFICER_ACTIVITY_DRAFTS_STORAGE_KEY)
        : null,
    );

    const mergedOfficerProjects = mergeSavedPlans(
      officerProjects,
      savedRecords,
    );

    const officerReviewPlans: ProcurementPlan[] = [];

    for (const project of mergedOfficerProjects) {
      for (const plan of project.plans) {
        if (
          plan.status === "Submitted to Director" ||
          plan.status === "Returned" ||
          plan.status === "Committee Review"
        ) {
          const planActivities = savedActivityRecords
            .filter(
              (r) =>
                r.projectCode === project.code &&
                r.planReference === plan.reference,
            )
            .map((r) => r.activity);

          officerReviewPlans.push(
            mapOfficerPlanToDirectorPlan(project, plan, planActivities),
          );
        }
      }
    }

    return officerReviewPlans;
  } catch {
    return [];
  }
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

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      const rawPlans = await fetchPlans();
      const mapped = rawPlans.map((p) => mapBackendPlanToFrontend(p, user.id));
      const officerPlans = getOfficerReviewPlans();
      const officerIds = new Set(officerPlans.map((p) => p.id));
      const filtered = mapped.filter((p) => !officerIds.has(p.id));
      setPlans([...filtered, ...officerPlans]);
    } catch (err) {
      console.error(err);
      const officerPlans = getOfficerReviewPlans();
      if (officerPlans.length > 0) {
        setPlans(officerPlans);
      } else {
        showToast("Failed to load plans from server.");
      }
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPlans();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadPlans]);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [budgetYearFilter, setBudgetYearFilter] = useState<string>("ALL");
  const [regionFilter, setRegionFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Selection states
  const [selectedPlanForReview, setSelectedPlanForReview] =
    useState<ProcurementPlan | null>(null);
  const [reviewActivities, setReviewActivities] = useState<
    ProcurementActivity[]
  >([]);
  const [editingPlan, setEditingPlan] = useState<ProcurementPlan | null>(null);
  const [activitiesPlan, setActivitiesPlan] = useState<ProcurementPlan | null>(
    null,
  );
  const [editingActivity, setEditingActivity] =
    useState<ProcurementActivity | null>(null);
  const [readOnlyPlan, setReadOnlyPlan] = useState<ProcurementPlan | null>(
    null,
  );

  // Auto-save feedback state
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  const handleActivityUpdate = (
    id: string,
    updates: Partial<ProcurementActivity>,
  ) => {
    setIsSaving(true);
    setShowSavedFeedback(true);
    setReviewActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    );
    setTimeout(() => {
      setIsSaving(false);
    }, 350);
  };

  const openPlanForReview = (plan: ProcurementPlan) => {
    setActivitiesPlan(plan);
  };

  const [returnRemarks, setReturnRemarks] = useState("");

  // Filter plans awaiting review only
  const filteredPlans = plans.filter((p) => {
    let isAwaitingReview = false;
    if (user?.role === "ENDORSING_COMMITTEE") {
      const alreadyVoted = p.committeeDecision !== undefined;
      isAwaitingReview = p.status === "Committee Review" && !alreadyVoted;
    } else {
      isAwaitingReview =
        p.status === "Submitted to Director" || p.status === "Returned";
    }
    const matchesSearch =
      p.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projectCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "ALL" || p.category === categoryFilter;
    const matchesBudgetYear =
      budgetYearFilter === "ALL" || p.budgetYear.includes(budgetYearFilter);
    const matchesRegion =
      regionFilter === "ALL" || p.organizationRegion === regionFilter;
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;

    return (
      isAwaitingReview &&
      matchesSearch &&
      matchesCategory &&
      matchesBudgetYear &&
      matchesRegion &&
      matchesStatus
    );
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

    if (plan.id.startsWith("officer-")) {
      try {
        const records = parseSavedPlanRecords(
          window.localStorage.getItem(OFFICER_PLAN_DRAFTS_STORAGE_KEY),
        );
        const matchingProject = officerProjects.find(
          (p) => p.code === plan.projectCode,
        );
        const matchingPlan = matchingProject?.plans.find((p) =>
          plan.id.endsWith(p.reference),
        ) ?? {
          activities: plan.activitiesCount,
          budgetYear: plan.budgetYear,
          category: plan.category as ProcurementCategory,
          completedActivities: 0,
          currency: "ETB" as const,
          delayedActivities: 0,
          description: plan.description,
          estimatedValue: 0,
          inProgressActivities: 0,
          name: plan.planName,
          reference: plan.id.replace(`officer-${plan.projectCode}-`, ""),
          status: "Committee Review" as const,
        };
        const nextRecords = upsertSavedPlanRecord(records, {
          plan: { ...matchingPlan, status: "Committee Review" },
          projectCode: plan.projectCode,
        });
        window.localStorage.setItem(
          OFFICER_PLAN_DRAFTS_STORAGE_KEY,
          JSON.stringify(nextRecords),
        );
      } catch {}
    }

    setSelectedPlanForReview(null);
    showToast(
      `Plan "${plan.planName}" approved and forwarded to Endorsement Committee!`,
    );
  };

  // Director Decision 2: Send Back to Officer for Revision
  const handleReturnPlan = (plan: ProcurementPlan) => {
    const updatedDescription = returnRemarks.trim()
      ? `[Returned Note: ${returnRemarks}] ${plan.description || ""}`
      : plan.description;

    setPlans((prev) =>
      prev.map((p) =>
        p.id === plan.id
          ? {
              ...p,
              status: "Returned",
              description: updatedDescription,
            }
          : p,
      ),
    );

    if (plan.id.startsWith("officer-")) {
      try {
        const records = parseSavedPlanRecords(
          window.localStorage.getItem(OFFICER_PLAN_DRAFTS_STORAGE_KEY),
        );
        const matchingProject = officerProjects.find(
          (p) => p.code === plan.projectCode,
        );
        const matchingPlan = matchingProject?.plans.find((p) =>
          plan.id.endsWith(p.reference),
        ) ?? {
          activities: plan.activitiesCount,
          budgetYear: plan.budgetYear,
          category: plan.category as ProcurementCategory,
          completedActivities: 0,
          currency: "ETB" as const,
          delayedActivities: 0,
          description: updatedDescription,
          estimatedValue: 0,
          inProgressActivities: 0,
          name: plan.planName,
          reference: plan.id.replace(`officer-${plan.projectCode}-`, ""),
          status: "Returned" as const,
        };
        const nextRecords = upsertSavedPlanRecord(records, {
          plan: {
            ...matchingPlan,
            description: updatedDescription,
            status: "Returned",
          },
          projectCode: plan.projectCode,
        });
        window.localStorage.setItem(
          OFFICER_PLAN_DRAFTS_STORAGE_KEY,
          JSON.stringify(nextRecords),
        );
      } catch {}
    }

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
      <DirectorActivitiesListView
        plan={activitiesPlan}
        project={proj}
        parentSection="plan-for-review"
        onBackClick={() => setActivitiesPlan(null)}
        onApprovePlan={(p) => {
          handleApprovePlan(p);
          setActivitiesPlan(null);
        }}
        onReturnPlan={(p, remarks) => {
          setReturnRemarks(remarks);
          handleReturnPlan(p);
          setActivitiesPlan(null);
        }}
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
            <div className="space-y-3 flex-1 min-w-[280px]">
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

              {/* Editable Plan Name */}
              <div className="space-y-1">
                <label className="block text-[11px] font-extrabold text-[#0A3C2F] uppercase tracking-wider">
                  Plan Title
                </label>
                <input
                  type="text"
                  value={selectedPlanForReview.planName}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setSelectedPlanForReview((prev) =>
                      prev ? { ...prev, planName: newName } : null,
                    );
                    setPlans((prev) =>
                      prev.map((p) =>
                        p.id === selectedPlanForReview.id
                          ? { ...p, planName: newName }
                          : p,
                      ),
                    );
                  }}
                  className="w-full text-lg sm:text-xl font-extrabold text-slate-950 tracking-tight rounded-xl border border-emerald-300 bg-white px-3.5 py-1.5 focus:border-[#0A3C2F] outline-none"
                />
              </div>

              {/* Locked Structural Metadata */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                <span className="flex items-center gap-1">
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

            <span className="text-xs font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
              {selectedPlanForReview.status}
            </span>
          </div>
        </section>

        {/* Full-Width Plan Scope & Package Activities Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-6">
          {/* Editable Plan Description & Scope Overview */}
          <div className="space-y-2 pb-2">
            <span className="text-[11px] font-extrabold text-[#0A3C2F] uppercase tracking-wider block">
              Plan Description & Scope Overview
            </span>
            <textarea
              rows={3}
              value={selectedPlanForReview.description || ""}
              onChange={(e) => {
                const newDesc = e.target.value;
                setSelectedPlanForReview((prev) =>
                  prev ? { ...prev, description: newDesc } : null,
                );
                setPlans((prev) =>
                  prev.map((p) =>
                    p.id === selectedPlanForReview.id
                      ? { ...p, description: newDesc }
                      : p,
                  ),
                );
              }}
              placeholder="Specify plan scope, corrections or minor description updates..."
              className="w-full text-xs text-slate-800 leading-relaxed rounded-xl border border-slate-300 bg-white p-3.5 focus:border-[#0A3C2F] focus:ring-2 focus:ring-[#0A3C2F]/10 outline-none transition-all"
            />
          </div>

          {/* In-Place Package Activities Directory */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    Package Activities Directory
                  </h4>
                  <span className="text-xs font-semibold text-slate-500">
                    ({reviewActivities.length} Items)
                  </span>

                  {/* Auto-Save Indicator (Plain Text & Icon, No Highlight Background) */}
                  {showSavedFeedback && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 ml-1 transition-all">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{isSaving ? "Saving..." : "Auto-saved"}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Direct inline editing for activity description,
                  clarifications, or technical notes.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActivitiesPlan(selectedPlanForReview);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A3C2F] text-white hover:bg-[#072b22] text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <ListChecks className="h-4 w-4 text-[#A3E635]" />
                <span>Inspect Package Activities</span>
              </button>
            </div>

            {/* Clean View-First Package Activities Table (Click Row to Edit Activity) */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
              <table className="w-full text-left text-xs border-collapse min-w-[840px]">
                <thead className="bg-[#0A3C2F] text-white text-[11px] font-extrabold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3.5 w-8 text-center">#</th>
                    <th className="py-3 px-3.5 min-w-[170px] w-[180px]">
                      Ref No & Method
                    </th>
                    <th className="py-3 px-3.5 min-w-[240px]">
                      Activity Description
                    </th>
                    <th className="py-3 px-3.5 min-w-[150px]">
                      Target Date (Roadmap)
                    </th>
                    <th className="py-3 px-3.5 min-w-[150px]">
                      Clarifications
                    </th>
                    <th className="py-3 px-3.5 min-w-[150px]">
                      Technical Notes
                    </th>
                    <th className="py-3 px-3.5 text-center min-w-[90px]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 bg-white">
                  {reviewActivities.length > 0 ? (
                    reviewActivities.map((act, idx) => {
                      const currentTargetDate =
                        act.roadmap.find(
                          (s) => s.revisedTargetDate || s.originalPlannedDate,
                        )?.revisedTargetDate ||
                        act.roadmap[0]?.originalPlannedDate ||
                        "N/A";

                      return (
                        <tr
                          key={act.id}
                          onClick={() => setEditingActivity(act)}
                          className="hover:bg-emerald-50/40 transition-colors cursor-pointer group"
                        >
                          <td className="py-3.5 px-3.5 text-center font-bold text-slate-400 align-top pt-4">
                            {idx + 1}
                          </td>

                          {/* Ref No & Method */}
                          <td className="py-3.5 px-3.5 align-top space-y-1.5 pt-3.5">
                            <span className="font-mono font-extrabold text-[#0A3C2F] text-[11px] whitespace-nowrap block group-hover:text-emerald-800">
                              {act.activityRefNo}
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                              <span className="font-bold text-slate-700 whitespace-nowrap">
                                {act.method}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="font-extrabold text-amber-800 whitespace-nowrap">
                                {act.reviewType}
                              </span>
                            </div>
                          </td>

                          {/* Activity Description (Clean Text View) */}
                          <td className="py-3.5 px-3.5 align-top">
                            <p className="font-medium text-slate-900 text-xs leading-relaxed">
                              {act.description}
                            </p>
                          </td>

                          {/* Target Date in Roadmap (Clean Text View) */}
                          <td className="py-3.5 px-3.5 align-top whitespace-nowrap">
                            <span className="font-mono font-bold text-slate-800 text-xs bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg inline-block">
                              {currentTargetDate}
                            </span>
                          </td>

                          {/* Clarifications (Clean Text View) */}
                          <td className="py-3.5 px-3.5 align-top">
                            <p className="text-xs text-slate-700 leading-relaxed">
                              {act.remarks || (
                                <span className="text-slate-400 italic">
                                  None
                                </span>
                              )}
                            </p>
                          </td>

                          {/* Technical Notes (Clean Text View) */}
                          <td className="py-3.5 px-3.5 align-top">
                            <p className="text-xs text-slate-700 leading-relaxed">
                              {act.additionalRemarks || (
                                <span className="text-slate-400 italic">
                                  None
                                </span>
                              )}
                            </p>
                          </td>

                          {/* Edit Action Button */}
                          <td className="py-3.5 px-3.5 align-top text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingActivity(act);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-[#0A3C2F] border border-emerald-200 hover:bg-[#0A3C2F] hover:text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-4 text-center text-xs text-slate-500 italic"
                      >
                        No package activities found under this plan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Director Decision & Workflow Actions Card (Side-by-Side Action Buttons Below Comment Section) */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="h-5 w-5 text-[#0A3C2F]" />
            <h3 className="text-sm font-bold text-slate-900">
              Director Decision & Workflow Actions
            </h3>
          </div>

          {/* Revision Remarks Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Revision Notes (If returning to Officer)
            </label>
            <textarea
              rows={3}
              value={returnRemarks}
              onChange={(e) => setReturnRemarks(e.target.value)}
              placeholder="Specify required corrections, missing documents or revision notes for the Procurement Officer..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-[#0A3C2F]"
            />
          </div>

          {/* Action Buttons Aligned Side-by-Side Below Comment Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleApprovePlan(selectedPlanForReview)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0A3C2F] text-white hover:bg-[#072b22] text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Send className="h-4 w-4 text-[#A3E635]" />
              <span>Approve & Send to Committee</span>
            </button>

            <button
              type="button"
              onClick={() => handleReturnPlan(selectedPlanForReview)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4 text-rose-600" />
              <span>Return to Officer for Revision</span>
            </button>
          </div>
        </section>

        {/* Dedicated Edit Package Activity Details Modal */}
        {editingActivity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-5 border border-slate-200 animate-in zoom-in-95">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-[#0A3C2F] text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {editingActivity.activityRefNo}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      • {editingActivity.method}
                    </span>
                    <span className="text-xs font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {editingActivity.reviewType}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Package Activity Details
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingActivity(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body Form */}
              <div className="space-y-4">
                {/* Activity Description */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Activity Description
                  </label>
                  <textarea
                    rows={3}
                    value={editingActivity.description}
                    onChange={(e) =>
                      setEditingActivity((prev) =>
                        prev ? { ...prev, description: e.target.value } : null,
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-3 text-xs text-slate-900 outline-none focus:border-[#0A3C2F] focus:bg-white focus:ring-2 focus:ring-[#0A3C2F]/10 transition-all leading-relaxed"
                    placeholder="Enter activity description..."
                  />
                </div>

                {/* Target Date in Roadmap */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#0A3C2F]" />
                    Target Planned Date (Roadmap Milestone)
                  </label>
                  <input
                    type="date"
                    value={
                      editingActivity.roadmap.find(
                        (s) => s.revisedTargetDate || s.originalPlannedDate,
                      )?.revisedTargetDate ||
                      editingActivity.roadmap[0]?.originalPlannedDate ||
                      ""
                    }
                    onChange={(e) => {
                      const newDate = e.target.value;
                      const updatedRoadmap = editingActivity.roadmap.map(
                        (s, sIdx) =>
                          sIdx === 0 ? { ...s, revisedTargetDate: newDate } : s,
                      );
                      setEditingActivity((prev) =>
                        prev ? { ...prev, roadmap: updatedRoadmap } : null,
                      );
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#0A3C2F] focus:bg-white focus:ring-2 focus:ring-[#0A3C2F]/10 transition-all cursor-pointer"
                  />
                </div>

                {/* Clarifications */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Clarifications (Remarks / Comments)
                  </label>
                  <input
                    type="text"
                    value={editingActivity.remarks || ""}
                    onChange={(e) =>
                      setEditingActivity((prev) =>
                        prev ? { ...prev, remarks: e.target.value } : null,
                      )
                    }
                    placeholder="Add clarification notes..."
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-[#0A3C2F] focus:bg-white focus:ring-2 focus:ring-[#0A3C2F]/10 transition-all"
                  />
                </div>

                {/* Technical Notes */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Technical Notes (Additional Details)
                  </label>
                  <input
                    type="text"
                    value={editingActivity.additionalRemarks || ""}
                    onChange={(e) =>
                      setEditingActivity((prev) =>
                        prev
                          ? { ...prev, additionalRemarks: e.target.value }
                          : null,
                      )
                    }
                    placeholder="Add technical notes..."
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-[#0A3C2F] focus:bg-white focus:ring-2 focus:ring-[#0A3C2F]/10 transition-all"
                  />
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingActivity(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (editingActivity) {
                      handleActivityUpdate(editingActivity.id, {
                        description: editingActivity.description,
                        roadmap: editingActivity.roadmap,
                        remarks: editingActivity.remarks,
                        additionalRemarks: editingActivity.additionalRemarks,
                      });
                      setEditingActivity(null);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#0A3C2F] text-white hover:bg-[#072b22] text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Save Activity Changes
                </button>
              </div>
            </div>
          </div>
        )}
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

      {/* Search & Filter Bar (Single Horizontal Row Line) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search plans by Project Code or Plan Name..."
            className="w-full pl-10 pr-4 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-[#0A3C2F] outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 outline-none text-xs"
            >
              <option value="ALL">All Categories</option>
              <option value="Goods">Goods</option>
              <option value="Works">Works</option>
              <option value="Non-Consultancy Services">
                Non-Consultancy Services
              </option>
              <option value="Consultancy Services">Consultancy Services</option>
            </select>
          </div>

          {/* Budget Year Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <select
              value={budgetYearFilter}
              onChange={(e) => setBudgetYearFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 outline-none text-xs"
            >
              <option value="ALL">All Fiscal Years</option>
              <option value="2018 EFY">2018 EFY</option>
              <option value="2017 EFY">2017 EFY</option>
              <option value="2019 EFY">2019 EFY</option>
            </select>
          </div>

          {/* Region / Unit Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 outline-none text-xs"
            >
              <option value="ALL">All Regions / Units</option>
              <option value="FPCU / Federal">FPCU / Federal</option>
              <option value="Oromia">Oromia</option>
              <option value="Somali">Somali</option>
              <option value="Afar">Afar</option>
              <option value="Amhara">Amhara</option>
              <option value="Tigray">Tigray</option>
            </select>
          </div>

          {/* Status Filter */}
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-slate-500 font-medium"
                  >
                    Loading plans from server...
                  </td>
                </tr>
              ) : filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
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
                    onClick={() => setActivitiesPlan(plan)}
                    className="hover:bg-emerald-50/50 transition-colors cursor-pointer group"
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
                      <p className="font-bold text-slate-900 text-xs leading-snug group-hover:text-[#0A3C2F]">
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Read-Only Plan Details Modal */}
      {readOnlyPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-[#0A3C2F]" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Plan Overview (Read-Only View)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReadOnlyPlan(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div>
                <span className="text-[10px] font-extrabold text-[#0A3C2F] uppercase tracking-wider block">
                  Plan Name
                </span>
                <p className="text-base font-extrabold text-slate-950 mt-0.5">
                  {readOnlyPlan.planName}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">
                    Category
                  </span>
                  <span className="font-bold text-slate-900">
                    {readOnlyPlan.category}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">
                    Budget Year
                  </span>
                  <span className="font-bold text-slate-900">
                    {readOnlyPlan.budgetYear}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">
                    Region / Unit
                  </span>
                  <span className="font-bold text-slate-900">
                    {readOnlyPlan.organizationRegion}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">
                    Period From
                  </span>
                  <span className="font-bold text-slate-900">
                    {readOnlyPlan.planPeriodFrom}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">
                    Period To
                  </span>
                  <span className="font-bold text-slate-900">
                    {readOnlyPlan.planPeriodTo}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">
                    Status
                  </span>
                  <span className="font-extrabold text-[#0A3C2F]">
                    {readOnlyPlan.status}
                  </span>
                </div>
              </div>

              {readOnlyPlan.description && (
                <div>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                    Description & Scope Overview
                  </span>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed">
                    {readOnlyPlan.description}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">
                    Notice Date
                  </span>
                  <span className="font-semibold text-slate-800">
                    {readOnlyPlan.generalNoticeDate || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">
                    Approval Date
                  </span>
                  <span className="font-semibold text-slate-800">
                    {readOnlyPlan.approvalDate || "Pending"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReadOnlyPlan(null)}
                className="px-5 py-2.5 rounded-xl bg-[#0A3C2F] text-white hover:bg-[#072b22] text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

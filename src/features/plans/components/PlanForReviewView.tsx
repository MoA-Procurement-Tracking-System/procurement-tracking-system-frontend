"use client";

import { useState, useEffect, useCallback } from "react";
import {
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
  Eye,
  X,
  Calendar,
  Clock,
  Mail,
  History,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { type ProcurementPlan, parseRejectionDetails } from "../plansData";
import {
  fetchPlans,
  sendPlanToCommittee,
  rejectPlan,
  submitVote,
  mapBackendPlanToFrontend,
} from "../../../lib/plansApi";
import type { AuthUser } from "../../../lib/authTypes";
import {
  INITIAL_PROJECTS,
  type ProjectItem,
} from "@/features/projects/management/projectsData";
import { CreatePlanForm } from "./CreatePlanForm";
import { DirectorActivitiesListView } from "../../activities/components/DirectorActivitiesListView";
import { VersionHistoryModal } from "./VersionHistoryModal";
import { CommitteeRejectionModal } from "./CommitteeRejectionModal";
import { DualCalendarField } from "@/features/projects/components/DualCalendarField";
import {
  getCurrentPlanVersionNumber,
  recordPlanVersionEvent,
} from "../data/planRevisions";
import type {
  ProcurementActivity,
  ActivityStage,
} from "../../activities/activitiesData";
import {
  OFFICER_PLAN_DRAFTS_STORAGE_KEY,
  parseSavedPlanRecords,
} from "@/features/projects/data/officerPlanDrafts";
import { OFFICER_ACTIVITY_DRAFTS_STORAGE_KEY } from "@/features/projects/data/officerActivityDrafts";

interface PlanForReviewViewProps {
  user: AuthUser;
  selectedPlanId?: string;
  selectedActivityRef?: string;
}

export function PlanForReviewView({
  user,
  selectedPlanId,
  selectedActivityRef,
}: PlanForReviewViewProps) {
  const [plans, setPlans] = useState<ProcurementPlan[]>([]);
  const [projects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [historyModalPlan, setHistoryModalPlan] =
    useState<ProcurementPlan | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      const rawPlans = await fetchPlans();
      const mapped = rawPlans.map((p) =>
        mapBackendPlanToFrontend(p, user.id, user.email),
      );

      const planMap = new Map<string, ProcurementPlan>();

      // Merge saved officer plans from localStorage
      const draftList: ProcurementPlan[] = [];
      try {
        if (typeof window !== "undefined") {
          const rawSaved = window.localStorage.getItem(
            OFFICER_PLAN_DRAFTS_STORAGE_KEY,
          );
          if (rawSaved) {
            const parsed = parseSavedPlanRecords(rawSaved);
            parsed.forEach((rec) => {
              const p = rec.plan;
              if (!p) return;
              const planId =
                p.id || `officer-${rec.projectCode}-${p.reference}`;
              const mappedDraft: ProcurementPlan = {
                id: planId,
                projectId: rec.projectCode,
                projectName: `${rec.projectCode} Project`,
                planName: p.name || p.reference,
                projectCode: rec.projectCode,
                category: p.category || "Goods",
                budgetYear: p.budgetYear || "2018 EFY",
                planPeriodFrom: p.planPeriod?.from?.gregorian || "2026-07-08",
                planPeriodTo: p.planPeriod?.to?.gregorian || "2027-07-07",
                generalNoticeDate:
                  p.generalProcurementNoticeDate?.gregorian || "2026-07-08",
                organizationRegion: p.organizationRegion || "Federal / FPCU",
                status: (p.status as any) || "Submitted to Director",
                description: p.description || "",
                reference: p.reference,
                rejectionReason: p.rejectionReason,
                rejectionScope:
                  p.rejectionScope ||
                  parseRejectionDetails(p.rejectionReason).scope,
                rejectedActivityIds: p.rejectedActivityIds,
                rejectedActivityRefs:
                  p.rejectedActivityRefs ||
                  (parseRejectionDetails(p.rejectionReason).scope === "SPECIFIC"
                    ? parseRejectionDetails(p.rejectionReason)
                        .rejectedActivityRefs
                    : undefined),
                activities: (p.planActivities as any) || [],
                activitiesCount:
                  (p.planActivities as any)?.length || p.activities || 0,
                assignedOfficer: "Procurement Officer",
                createdBy: "Procurement Officer",
                createdAt: new Date().toISOString(),
                currency: p.currency || "ETB",
                estimatedValue: p.estimatedValue || 0,
              };
              draftList.push(mappedDraft);
            });
          }
        }
      } catch (storageErr) {
        console.warn("Storage read error in loadPlans:", storageErr);
      }

      for (const d of draftList) {
        if (d.status !== "Draft") {
          planMap.set(d.id, d);
        }
      }

      mapped.forEach((p) => {
        const matchingDraft = draftList.find(
          (d) =>
            d.id === p.id ||
            (d.reference &&
              (p as any).reference &&
              d.reference.toLowerCase().trim() ===
                (p as any).reference.toLowerCase().trim()) ||
            (d.planName &&
              p.planName &&
              d.planName.toLowerCase().trim() ===
                p.planName.toLowerCase().trim()) ||
            (d.reference &&
              p.planName &&
              d.reference.toLowerCase().trim() ===
                p.planName.toLowerCase().trim()),
        );

        if (matchingDraft) {
          planMap.delete(matchingDraft.id);
          const effectiveReason =
            p.rejectionReason || matchingDraft.rejectionReason;
          const parsedEff = parseRejectionDetails(effectiveReason);

          const merged: ProcurementPlan = {
            ...p,
            projectCode:
              matchingDraft.projectCode &&
              matchingDraft.projectCode !== "BREFONS"
                ? matchingDraft.projectCode
                : p.projectCode,
            reference: matchingDraft.reference || (p as any).reference,
            rejectionReason: effectiveReason,
            rejectionScope:
              p.rejectionScope ||
              matchingDraft.rejectionScope ||
              parsedEff.scope,
            rejectedActivityIds:
              p.rejectedActivityIds || matchingDraft.rejectedActivityIds,
            rejectedActivityRefs:
              p.rejectedActivityRefs ||
              matchingDraft.rejectedActivityRefs ||
              (parsedEff.scope === "SPECIFIC"
                ? parsedEff.rejectedActivityRefs
                : undefined),
            activities:
              p.activities && p.activities.length > 0
                ? p.activities
                : matchingDraft.activities || [],
            activitiesCount:
              p.activities && p.activities.length > 0
                ? p.activities.length
                : matchingDraft.activities?.length || 0,
          };
          planMap.set(p.id, merged);
        } else {
          planMap.set(p.id, p);
        }
      });

      setPlans(Array.from(planMap.values()));
    } catch (err) {
      console.error(err);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, [user.id, user.email]);

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
  const [statusFilter] = useState<string>("ALL");

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
  const [isCommitteeRejectionModalOpen, setIsCommitteeRejectionModalOpen] =
    useState(false);

  useEffect(() => {
    const handleReset = (event: Event) => {
      const customEvent = event as CustomEvent<{ href?: string }>;
      if (
        !customEvent.detail?.href ||
        customEvent.detail.href === "/workspace/plan-for-review"
      ) {
        setSelectedPlanForReview(null);
        setEditingPlan(null);
        setActivitiesPlan(null);
        setEditingActivity(null);
      }
    };

    window.addEventListener("pts:sidebar-reset", handleReset);
    return () => window.removeEventListener("pts:sidebar-reset", handleReset);
  }, []);

  useEffect(() => {
    if (selectedPlanId && plans.length > 0 && !activitiesPlan) {
      const match = plans.find(
        (p) =>
          p.id === selectedPlanId ||
          p.reference?.toLowerCase() === selectedPlanId.toLowerCase() ||
          p.planName?.toLowerCase() === selectedPlanId.toLowerCase() ||
          p.projectCode?.toLowerCase() === selectedPlanId.toLowerCase(),
      );
      if (match) {
        const timer = setTimeout(() => {
          setActivitiesPlan(match);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedPlanId, plans, activitiesPlan]);

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

  const [returnRemarks, setReturnRemarks] = useState("");
  const [committeeDeadlineDate, setCommitteeDeadlineDate] = useState<string>(
    () => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d.toISOString().split("T")[0];
    },
  );
  const [pendingApprovePlan, setPendingApprovePlan] =
    useState<ProcurementPlan | null>(null);

  // Filter plans awaiting review only
  const filteredPlans = plans.filter((p) => {
    let isAwaitingReview = false;
    if (user?.role === "ENDORSING_COMMITTEE") {
      const alreadyVoted = p.committeeDecision !== undefined;
      isAwaitingReview =
        (p.status === "Committee Review" ||
          (p as any).status === "WITH_COMMITTEE") &&
        !alreadyVoted;
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

  const updateLocalStoragePlanAndActivities = (
    plan: ProcurementPlan,
    newPlanStatus: string,
    newActivityStatus?: string,
    rejectionReason?: string,
    rejectionScope?: "ALL" | "SPECIFIC",
    rejectedActivityIds?: string[],
    rejectedActivityRefs?: string[],
  ) => {
    if (typeof window === "undefined") return;
    try {
      const isSpecific = rejectionScope === "SPECIFIC";
      const isActivityFlagged = (actId?: string, actRef?: string) => {
        if (!isSpecific) return true;
        const cleanId = (actId || "").toLowerCase().trim();
        const cleanRef = (actRef || "").toLowerCase().trim();
        return (
          (rejectedActivityIds &&
            rejectedActivityIds.some((id) => {
              const c = id.toLowerCase().trim();
              return c === cleanId || c === cleanRef;
            })) ||
          (rejectedActivityRefs &&
            rejectedActivityRefs.some((ref) => {
              const c = ref.toLowerCase().trim();
              return c === cleanRef || c === cleanId;
            }))
        );
      };

      const rawPlanDrafts = window.localStorage.getItem(
        OFFICER_PLAN_DRAFTS_STORAGE_KEY,
      );
      if (rawPlanDrafts) {
        const parsed = JSON.parse(rawPlanDrafts);
        if (Array.isArray(parsed)) {
          const updated = parsed.map((item: any) => {
            const itemRef = item.plan?.reference?.toLowerCase()?.trim();
            const itemName = item.plan?.name?.toLowerCase()?.trim();
            const itemId = item.plan?.id?.toLowerCase()?.trim();
            const planRef = plan.reference?.toLowerCase()?.trim();
            const planName = plan.planName?.toLowerCase()?.trim();
            const planId = plan.id?.toLowerCase()?.trim();

            const matches =
              (itemId && (itemId === planId || itemId === planRef)) ||
              (itemRef &&
                (itemRef === planRef ||
                  itemRef === planName ||
                  itemRef === planId)) ||
              (itemName &&
                (itemName === planName ||
                  itemName === planRef ||
                  itemName === planId));

            if (matches) {
              const updatedPlanActivities =
                newActivityStatus && item.plan?.planActivities
                  ? item.plan.planActivities.map((act: any) => {
                      const flagged = isActivityFlagged(
                        act.id,
                        act.activityRefNo || act.reference,
                      );
                      return {
                        ...act,
                        status: isSpecific
                          ? flagged
                            ? newActivityStatus
                            : act.status || "Approved"
                          : newActivityStatus,
                        isFlaggedByCommittee: flagged,
                      };
                    })
                  : item.plan?.planActivities;

              return {
                ...item,
                plan: {
                  ...item.plan,
                  status: newPlanStatus,
                  rejectionReason:
                    rejectionReason !== undefined
                      ? rejectionReason
                      : item.plan.rejectionReason,
                  rejectionScope: rejectionScope || item.plan.rejectionScope,
                  rejectedActivityIds:
                    rejectedActivityIds || item.plan.rejectedActivityIds,
                  rejectedActivityRefs:
                    rejectedActivityRefs || item.plan.rejectedActivityRefs,
                  planActivities: updatedPlanActivities,
                },
              };
            }
            return item;
          });
          window.localStorage.setItem(
            OFFICER_PLAN_DRAFTS_STORAGE_KEY,
            JSON.stringify(updated),
          );
        }
      }

      if (newActivityStatus) {
        const rawActDrafts = window.localStorage.getItem(
          OFFICER_ACTIVITY_DRAFTS_STORAGE_KEY,
        );
        if (rawActDrafts) {
          const parsedActs = JSON.parse(rawActDrafts);
          if (Array.isArray(parsedActs)) {
            const updatedActs = parsedActs.map((item: any) => {
              const pRef = item.planReference?.toLowerCase()?.trim();
              const planRef = plan.reference?.toLowerCase()?.trim();
              const planName = plan.planName?.toLowerCase()?.trim();
              const planId = plan.id?.toLowerCase()?.trim();

              const matchesPlan =
                (pRef &&
                  (pRef === planId || pRef === planRef || pRef === planName)) ||
                item.projectCode?.toLowerCase()?.trim() ===
                  plan.projectCode?.toLowerCase()?.trim();

              if (matchesPlan) {
                const flagged = isActivityFlagged(
                  item.activity?.id,
                  item.activity?.activityRefNo || item.activity?.reference,
                );
                return {
                  ...item,
                  activity: {
                    ...item.activity,
                    status: isSpecific
                      ? flagged
                        ? newActivityStatus
                        : item.activity?.status || "Approved"
                      : newActivityStatus,
                    isFlaggedByCommittee: flagged,
                  },
                };
              }
              return item;
            });
            window.localStorage.setItem(
              OFFICER_ACTIVITY_DRAFTS_STORAGE_KEY,
              JSON.stringify(updatedActs),
            );
          }
        }
      }
    } catch (err) {
      console.warn("Storage sync error:", err);
    }
  };

  // Director Decision 1: Approve & Send to Endorsement Committee
  const handleApprovePlan = async (
    plan: ProcurementPlan,
    deadlineDate?: string,
  ) => {
    try {
      const targetDate = deadlineDate || committeeDeadlineDate;
      const days = targetDate
        ? Math.max(
            1,
            Math.round(
              (new Date(targetDate).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24),
            ),
          )
        : 7;
      await sendPlanToCommittee(plan.id, targetDate, days);
    } catch (err) {
      console.warn("Backend sendPlanToCommittee note:", err);
    }

    updateLocalStoragePlanAndActivities(
      plan,
      "Committee Review",
      "Under Review",
    );

    recordPlanVersionEvent({
      planId: plan.id,
      planReference: plan.reference || plan.planName,
      projectCode: plan.projectCode,
      versionNumber: getCurrentPlanVersionNumber(plan.id),
      action: "SENT_TO_COMMITTEE",
      actionLabel: "Plan Endorsed & Sent to Committee",
      changedBy: user.displayName || user.email || "Director",
      changedByRole: "Director",
      reason: "Approved and submitted for Endorsement Committee review.",
    });

    await loadPlans();
    setSelectedPlanForReview(null);
    setReturnRemarks("");
    setPendingApprovePlan(null);
    showToast(
      `Plan "${plan.planName}" approved and forwarded to Endorsement Committee (Deadline: ${committeeDeadlineDate})!`,
    );
  };

  // Director Decision 2: Return to Officer for Revision
  const handleReturnPlan = async (
    plan: ProcurementPlan,
    customRemarks?: string,
  ) => {
    const reasonText =
      (customRemarks !== undefined ? customRemarks : returnRemarks).trim() ||
      "Returned by Director for revisions.";
    try {
      await rejectPlan(plan.id, reasonText);
    } catch (err) {
      console.warn("Backend rejectPlan note:", err);
    }

    updateLocalStoragePlanAndActivities(
      plan,
      "Returned",
      "Returned",
      reasonText,
    );

    recordPlanVersionEvent({
      planId: plan.id,
      planReference: plan.reference || plan.planName,
      projectCode: plan.projectCode,
      versionNumber: getCurrentPlanVersionNumber(plan.id),
      action: "RETURNED",
      actionLabel: "Plan Returned by Director for Revision",
      changedBy: user.displayName || user.email || "Director",
      changedByRole: "Director",
      reason: reasonText,
    });

    await loadPlans();
    setSelectedPlanForReview(null);
    setReturnRemarks("");
    showToast(
      `Plan "${plan.planName}" returned to Procurement Officer for revision.`,
    );
  };

  // Committee Decision: Vote Approve or Reject
  const handleCommitteeVote = async (
    plan: ProcurementPlan,
    decision: "APPROVE" | "REJECT",
    customRemarks?: string,
    rejectionDetails?: {
      scope: "ALL" | "SPECIFIC";
      rejectedActivityIds: string[];
      rejectedActivityRefs: string[];
    },
  ) => {
    let commentText =
      (customRemarks !== undefined ? customRemarks : returnRemarks).trim() ||
      undefined;

    if (
      decision === "REJECT" &&
      rejectionDetails?.scope === "SPECIFIC" &&
      rejectionDetails.rejectedActivityRefs.length > 0
    ) {
      const prefix = `[Flagged Activities: ${rejectionDetails.rejectedActivityRefs.join(", ")}]`;
      commentText = commentText ? `${prefix} ${commentText}` : prefix;
    }

    try {
      await submitVote(plan.id, decision, commentText, user.id, user.email);
    } catch (err) {
      console.warn("Backend submitVote note:", err);
    }

    const nextStatus = decision === "APPROVE" ? "Finally Approved" : "Returned";
    const nextActStatus = decision === "APPROVE" ? "In Progress" : undefined;

    updateLocalStoragePlanAndActivities(
      plan,
      nextStatus,
      nextActStatus,
      decision === "REJECT" ? commentText : undefined,
      rejectionDetails?.scope || "ALL",
      rejectionDetails?.rejectedActivityIds,
      rejectionDetails?.rejectedActivityRefs,
    );

    recordPlanVersionEvent({
      planId: plan.id,
      planReference: plan.reference || plan.planName,
      projectCode: plan.projectCode,
      versionNumber: getCurrentPlanVersionNumber(plan.id),
      action: decision === "APPROVE" ? "FINALLY_APPROVED" : "RETURNED",
      actionLabel:
        decision === "APPROVE"
          ? "Plan Endorsed & Finally Approved"
          : rejectionDetails?.scope === "SPECIFIC"
            ? `Plan Returned (${rejectionDetails.rejectedActivityRefs.length} Specific Activities Flagged)`
            : "Plan Rejected by Committee",
      changedBy: user.displayName || user.email || "Endorsement Committee",
      changedByRole: "Endorsement Committee",
      reason:
        commentText ||
        (decision === "APPROVE"
          ? "Endorsement vote recorded"
          : "Rejected by committee"),
    });

    await loadPlans();
    setSelectedPlanForReview(null);
    setReturnRemarks("");
    showToast(
      decision === "APPROVE"
        ? `Vote "Approved" recorded for plan "${plan.planName}".`
        : rejectionDetails?.scope === "SPECIFIC"
          ? `Vote "Rejected" recorded: flagged ${rejectionDetails.rejectedActivityRefs.length} specific activities.`
          : `Vote "Rejected" recorded for plan "${plan.planName}".`,
    );
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
        userRole={user.role}
        targetActivityRef={selectedActivityRef}
        onBackClick={() => setActivitiesPlan(null)}
        onApprovePlan={
          user.role === "DIRECTOR"
            ? (p) => {
                handleApprovePlan(p);
                setActivitiesPlan(null);
              }
            : undefined
        }
        onReturnPlan={
          user.role === "DIRECTOR"
            ? (p, remarks) => {
                setReturnRemarks(remarks);
                handleReturnPlan(p, remarks);
                setActivitiesPlan(null);
              }
            : undefined
        }
        onCommitteeVote={
          user.role === "ENDORSING_COMMITTEE"
            ? (p, decision, remarks, rejectionDetails) => {
                if (remarks) setReturnRemarks(remarks);
                handleCommitteeVote(p, decision, remarks, rejectionDetails);
                setActivitiesPlan(null);
              }
            : undefined
        }
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
            <div className="space-y-3 flex-1 min-w-70">
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

              {/* Plan Name */}
              <div className="space-y-1">
                <label className="block text-[11px] font-extrabold text-[#0A3C2F] uppercase tracking-wider">
                  Plan Title
                </label>
                {user.role === "ENDORSING_COMMITTEE" ? (
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-950 tracking-tight pt-0.5">
                    {selectedPlanForReview.planName}
                  </h2>
                ) : (
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
                )}
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

            <div className="flex items-center gap-2">
              <button
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-[#0A3C2F] hover:bg-[#edf5f1] hover:text-[#0A3C2F] transition cursor-pointer"
                onClick={() => setHistoryModalPlan(selectedPlanForReview)}
                type="button"
              >
                <History className="h-3.5 w-3.5 text-[#0A3C2F]" />
                Version History (v
                {getCurrentPlanVersionNumber(selectedPlanForReview.id)})
              </button>
              <span className="text-xs font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                {selectedPlanForReview.status}
              </span>
            </div>
          </div>
        </section>

        {/* Rejection Alert Banner (Director & Viewer Insight) */}
        {(() => {
          const parsed = parseRejectionDetails(
            selectedPlanForReview.rejectionReason,
          );
          if (parsed.scope === "SPECIFIC") {
            return (
              <section className="rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50/40 p-4 shadow-2xs space-y-2.5 animate-in fade-in">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded-lg bg-amber-100 border border-amber-200 shrink-0 mt-0.5">
                      <AlertTriangle className="h-4 w-4 text-amber-700" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider">
                        Committee Objection: Specific Activities Flagged (
                        {parsed.rejectedActivityRefs.length} item
                        {parsed.rejectedActivityRefs.length > 1 ? "s" : ""})
                      </h3>
                      <p className="text-xs text-amber-900/90 mt-0.5 leading-relaxed">
                        The Endorsement Committee returned this plan due to
                        objections on specific activities. Per regulations, the
                        entire plan package is on hold until these specific
                        activities are revised.
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-200/70 text-amber-900 border border-amber-300 shrink-0">
                    Specific Activity Rejection
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/60 text-xs">
                  <span className="font-bold text-amber-950 text-[11px]">
                    Flagged Activities:
                  </span>
                  {parsed.rejectedActivityRefs.map((ref) => (
                    <button
                      key={ref}
                      type="button"
                      onClick={() => {
                        const el = document.getElementById(
                          `review-activity-row-${ref}`,
                        );
                        if (el) {
                          el.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                        }
                      }}
                      className="inline-flex items-center gap-1.5 font-mono font-bold text-rose-900 bg-rose-100 hover:bg-rose-200 border border-rose-300 hover:border-rose-400 px-2.5 py-1 rounded-md text-[11px] transition-all cursor-pointer shadow-2xs group"
                      title={`Click to jump to activity ${ref}`}
                    >
                      <AlertCircle className="h-3 w-3 text-rose-600" />
                      <span>{ref}</span>
                      <span className="font-sans text-[10px] text-rose-700 group-hover:underline">
                        ↓ Jump to Activity
                      </span>
                    </button>
                  ))}
                </div>

                {parsed.cleanRemarks && (
                  <div className="text-xs bg-white/90 rounded-lg p-3 border border-amber-200/80 shadow-2xs text-amber-950">
                    <span className="font-bold text-slate-800">
                      Committee Feedback &amp; Deliberation Notes:{" "}
                    </span>
                    <span className="italic text-slate-700 font-medium">
                      &ldquo;{parsed.cleanRemarks}&rdquo;
                    </span>
                  </div>
                )}
              </section>
            );
          }
          if (
            (selectedPlanForReview.status === "Returned" ||
              selectedPlanForReview.rejectionReason) &&
            parsed.cleanRemarks
          ) {
            return (
              <section className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 shadow-2xs space-y-2 animate-in fade-in">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-rose-100 border border-rose-200 shrink-0">
                      <RotateCcw className="h-4 w-4 text-rose-700" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-rose-950 uppercase tracking-wider">
                        Plan Returned: Common / Entire Plan Package Rejection
                      </h3>
                      <p className="text-xs text-rose-900/90 mt-0.5">
                        The Endorsement Committee returned the entire
                        procurement plan package for general revisions across
                        all activities.
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200 shrink-0">
                    General Rejection (All Activities)
                  </span>
                </div>

                {parsed.cleanRemarks && (
                  <div className="text-xs bg-white/90 rounded-lg p-3 border border-rose-200/80 shadow-2xs text-rose-950">
                    <span className="font-bold text-slate-800">
                      Revision Notes:{" "}
                    </span>
                    <span className="italic text-slate-700 font-medium">
                      &ldquo;{parsed.cleanRemarks}&rdquo;
                    </span>
                  </div>
                )}
              </section>
            );
          }
          return null;
        })()}

        {/* Full-Width Plan Scope & Package Activities Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-6">
          {/* Plan Description & Scope Overview */}
          <div className="space-y-2 pb-2">
            <span className="text-[11px] font-extrabold text-[#0A3C2F] uppercase tracking-wider block">
              Plan Description & Scope Overview
            </span>
            {user.role === "ENDORSING_COMMITTEE" ? (
              <div className="w-full text-xs text-slate-800 leading-relaxed rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                {selectedPlanForReview.description ||
                  "No description provided."}
              </div>
            ) : (
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
            )}
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
              <table className="w-full text-left text-xs border-collapse min-w-210">
                <thead className="bg-[#0A3C2F] text-white text-[11px] font-extrabold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3.5 w-8 text-center">#</th>
                    <th className="py-3 px-3.5 min-w-42.5 w-45">
                      Ref No & Method
                    </th>
                    <th className="py-3 px-3.5 min-w-60">
                      Activity Description
                    </th>
                    <th className="py-3 px-3.5 min-w-37.5">
                      Target Date (Roadmap)
                    </th>
                    <th className="py-3 px-3.5 min-w-37.5">Clarifications</th>
                    <th className="py-3 px-3.5 min-w-37.5">Technical Notes</th>
                    <th className="py-3 px-3.5 text-center min-w-22.5">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 bg-white">
                  {reviewActivities.length > 0 ? (
                    reviewActivities.map((act, idx) => {
                      const currentTargetDate =
                        act.roadmap.find(
                          (s: ActivityStage) =>
                            s.revisedTargetDate || s.originalPlannedDate,
                        )?.revisedTargetDate ||
                        act.roadmap[0]?.originalPlannedDate ||
                        "N/A";

                      const isTargeted =
                        selectedActivityRef &&
                        (act.activityRefNo?.toLowerCase().trim() ===
                          selectedActivityRef.toLowerCase().trim() ||
                          act.id.toLowerCase().trim() ===
                            selectedActivityRef.toLowerCase().trim());

                      return (
                        <tr
                          key={act.id}
                          id={`review-activity-row-${act.activityRefNo}`}
                          onClick={() => setEditingActivity(act)}
                          className={`transition-all duration-300 cursor-pointer group ${
                            isTargeted
                              ? "bg-rose-100/90 ring-3 ring-rose-500 shadow-md"
                              : "hover:bg-emerald-50/40"
                          }`}
                        >
                          <td className="py-3.5 px-3.5 text-center font-bold text-slate-400 align-top pt-4">
                            {idx + 1}
                          </td>

                          {/* Ref No & Method */}
                          <td className="py-3.5 px-3.5 align-top space-y-1.5 pt-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-extrabold text-[#0A3C2F] text-[11px] whitespace-nowrap block group-hover:text-emerald-800">
                                {act.activityRefNo}
                              </span>
                              {isTargeted && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-600 text-white animate-pulse">
                                  Targeted Activity
                                </span>
                              )}
                            </div>
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

                          {/* Action Button */}
                          <td className="py-3.5 px-3.5 align-top text-center">
                            {user.role === "ENDORSING_COMMITTEE" ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingActivity(act);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>View</span>
                              </button>
                            ) : (
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
                            )}
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

        {/* Decision & Workflow Actions Card */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="h-5 w-5 text-[#0A3C2F]" />
            <h3 className="text-sm font-bold text-slate-900">
              {user.role === "ENDORSING_COMMITTEE"
                ? "Endorsement Committee Decision & Voting"
                : "Director Decision & Workflow Actions"}
            </h3>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              {user.role === "ENDORSING_COMMITTEE" ? (
                <>
                  Committee Feedback / Deliberation Notes
                  <span className="ml-1 text-rose-500 text-[10px] font-semibold">
                    (Required to reject)
                  </span>
                </>
              ) : (
                <>
                  Revision Notes
                  <span className="ml-1 text-rose-500 text-[10px] font-semibold">
                    (Required to return to Officer)
                  </span>
                </>
              )}
            </label>
            <textarea
              rows={3}
              value={returnRemarks}
              onChange={(e) => setReturnRemarks(e.target.value)}
              placeholder={
                user.role === "ENDORSING_COMMITTEE"
                  ? "Enter your voting remarks or rejection reason (visible to Director)..."
                  : "Specify required corrections, missing documents or revision notes for the Procurement Officer..."
              }
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-[#0A3C2F]"
            />
            {user.role === "ENDORSING_COMMITTEE" && !returnRemarks.trim() && (
              <p className="text-[10px] text-slate-400 font-medium">
                A comment is required before rejecting a plan.
              </p>
            )}
            {user.role !== "ENDORSING_COMMITTEE" && !returnRemarks.trim() && (
              <p className="text-[10px] text-slate-400 font-medium">
                Revision notes are required before returning a plan to the
                Procurement Officer.
              </p>
            )}
            {user.role === "ENDORSING_COMMITTEE" && (
              <p className="text-[11px] text-slate-500 font-medium pt-1">
                Note: A plan requires at least 3 approval votes from the
                Endorsement Committee to be officially endorsed. Rejection
                comments will be visible in the Director review panel.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          {user.role === "ENDORSING_COMMITTEE" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() =>
                  handleCommitteeVote(selectedPlanForReview, "APPROVE")
                }
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0A3C2F] text-white hover:bg-[#072b22] text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4 text-[#A3E635]" />
                <span>Vote: Endorse & Approve Plan</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCommitteeRejectionModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-colors bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer shadow-2xs"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Vote: Reject / Return Plan</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Committee Voting Deadline
                  <span className="ml-1 text-slate-500 font-normal">
                    (Used for backend automated email reminders)
                  </span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="date"
                    value={committeeDeadlineDate}
                    onChange={(e) => setCommitteeDeadlineDate(e.target.value)}
                    className="rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-[#0A3C2F]"
                  />
                  <div className="flex items-center gap-1">
                    {[3, 7, 14].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setDate(d.getDate() + days);
                          setCommitteeDeadlineDate(
                            d.toISOString().split("T")[0],
                          );
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 transition-colors"
                      >
                        +{days} Days
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPendingApprovePlan(selectedPlanForReview)}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0A3C2F] text-white hover:bg-[#072b22] text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Send className="h-4 w-4 text-[#A3E635]" />
                  <span>Approve &amp; Send to Committee</span>
                </button>

                <button
                  type="button"
                  disabled={!returnRemarks.trim()}
                  onClick={() => handleReturnPlan(selectedPlanForReview)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-colors ${
                    returnRemarks.trim()
                      ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                      : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60"
                  }`}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Return to Officer for Revision</span>
                </button>
              </div>
            </div>
          )}
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
                      setEditingActivity((prev: ProcurementActivity | null) =>
                        prev ? { ...prev, description: e.target.value } : null,
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-3 text-xs text-slate-900 outline-none focus:border-[#0A3C2F] focus:bg-white focus:ring-2 focus:ring-[#0A3C2F]/10 transition-all leading-relaxed"
                    placeholder="Enter activity description..."
                  />
                </div>

                {/* Target Date in Roadmap */}
                <DualCalendarField
                  id="review-target-planned-date"
                  label="Target Planned Date (Roadmap Milestone)"
                  gregorianValue={
                    editingActivity.roadmap.find(
                      (s: ActivityStage) =>
                        s.revisedTargetDate || s.originalPlannedDate,
                    )?.revisedTargetDate ||
                    editingActivity.roadmap[0]?.originalPlannedDate ||
                    ""
                  }
                  onChange={(newDate) => {
                    const updatedRoadmap = editingActivity.roadmap.map(
                      (s: ActivityStage, sIdx: number) =>
                        sIdx === 0 ? { ...s, revisedTargetDate: newDate } : s,
                    );
                    setEditingActivity((prev: ProcurementActivity | null) =>
                      prev ? { ...prev, roadmap: updatedRoadmap } : null,
                    );
                  }}
                  required={false}
                />

                {/* Clarifications */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Clarifications (Remarks / Comments)
                  </label>
                  <input
                    type="text"
                    value={editingActivity.remarks || ""}
                    onChange={(e) =>
                      setEditingActivity((prev: ProcurementActivity | null) =>
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
                      setEditingActivity((prev: ProcurementActivity | null) =>
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
                {user.role === "ENDORSING_COMMITTEE" ? (
                  <button
                    type="button"
                    onClick={() => setEditingActivity(null)}
                    className="px-5 py-2.5 rounded-xl bg-[#0A3C2F] text-white hover:bg-[#072b22] text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                ) : (
                  <>
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
                            additionalRemarks:
                              editingActivity.additionalRemarks,
                          });
                          setEditingActivity(null);
                        }
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#0A3C2F] text-white hover:bg-[#072b22] text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      Save Activity Changes
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <CommitteeRejectionModal
          isOpen={isCommitteeRejectionModalOpen}
          onClose={() => setIsCommitteeRejectionModalOpen(false)}
          onConfirm={(scope, activityIds, activityRefs, remarks) => {
            handleCommitteeVote(selectedPlanForReview, "REJECT", remarks, {
              scope,
              rejectedActivityIds: activityIds,
              rejectedActivityRefs: activityRefs,
            });
          }}
          activities={(
            selectedPlanForReview.activities || reviewActivities
          ).map((a: any) => ({
            id: a.id,
            activityRefNo: a.activityRefNo || a.reference,
            description: a.description,
            method: a.method || a.procurementMethod?.label,
            estimatedAmount: a.estimatedAmount || a.estimatedBudget,
            currency: a.currency,
          }))}
          planName={selectedPlanForReview.planName}
          projectCode={selectedPlanForReview.projectCode}
        />
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
        <span className="font-bold text-[#0A3C2F]">
          {user.role === "ENDORSING_COMMITTEE"
            ? "Committee Plan for Review"
            : "Plan for Review"}
        </span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {user.role === "ENDORSING_COMMITTEE"
              ? "Endorsement Committee \u2014 Plans for Review"
              : "Director \u2014 Plan for Review"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {user.role === "ENDORSING_COMMITTEE"
              ? "Review procurement plans awaiting committee endorsement and record your approval or rejection vote."
              : "Review procurement plans submitted by Officers, examine activities, and approve or return for revision."}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar (Single Horizontal Row Line) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1 min-w-50 max-w-md">
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
          <table className="w-full text-left border-collapse min-w-[1080px]">
            <thead>
              <tr className="bg-[#0A3C2F] text-white text-[11px] font-extrabold uppercase tracking-wider">
                <th className="py-3.5 px-3.5 text-center w-12">#</th>
                <th className="py-3.5 px-3.5 w-36">Project Code</th>
                <th className="py-3.5 px-3.5 min-w-64 max-w-80">Plan Name</th>
                <th className="py-3.5 px-3.5 w-36">Category</th>
                <th className="py-3.5 px-3.5 w-28">Budget Year</th>
                <th className="py-3.5 px-3.5 w-44">Coverage Period</th>
                <th className="py-3.5 px-3.5 w-36">Region / Unit</th>
                <th className="py-3.5 px-3.5 w-40">Responsible Officer</th>
                <th className="py-3.5 px-3.5 text-center w-36">Status</th>
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
                    onClick={() => setActivitiesPlan(plan)}
                    className="hover:bg-emerald-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3.5 font-mono text-slate-400 font-semibold text-center">
                      {index + 1}
                    </td>

                    <td className="py-3 px-3.5">
                      <span className="font-mono font-extrabold text-[#0A3C2F] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs inline-block max-w-32 truncate">
                        {plan.projectCode}
                      </span>
                    </td>

                    <td className="py-3 px-3.5 min-w-64 max-w-80 wrap-break-word">
                      <p className="font-bold text-slate-900 text-xs leading-snug group-hover:text-[#0A3C2F] wrap-break-word">
                        {plan.planName}
                      </p>
                      {plan.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug wrap-break-word line-clamp-2">
                          {plan.description}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-3.5 font-bold text-slate-800">
                      {plan.category}
                    </td>

                    <td className="py-3 px-3.5 font-semibold text-slate-800">
                      {plan.budgetYear}
                    </td>

                    <td className="py-3 px-3.5 text-slate-600 text-xs whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <div>
                          <span className="text-slate-400 font-medium">
                            From:
                          </span>{" "}
                          <span className="font-semibold text-slate-800">
                            {plan.planPeriodFrom || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium">
                            To:
                          </span>{" "}
                          <span className="font-semibold text-slate-800">
                            {plan.planPeriodTo || "—"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3.5 font-semibold text-slate-800">
                      {plan.organizationRegion}
                    </td>

                    <td className="py-3 px-3.5 font-semibold text-slate-900 text-xs">
                      {plan.assignedOfficer ||
                        plan.createdBy ||
                        "Procurement Officer"}
                    </td>

                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                          plan.status === "Submitted to Director"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : plan.status === "Committee Review"
                              ? "bg-blue-50 text-blue-800 border border-blue-200"
                              : plan.status === "Returned"
                                ? "bg-rose-50 text-rose-800 border border-rose-200"
                                : "bg-slate-100 text-slate-700"
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

      {historyModalPlan && (
        <VersionHistoryModal
          currentStatus={historyModalPlan.status}
          isOpen={Boolean(historyModalPlan)}
          onClose={() => setHistoryModalPlan(null)}
          planId={historyModalPlan.id}
          planName={historyModalPlan.planName}
          projectCode={historyModalPlan.projectCode}
        />
      )}

      {/* SEND TO COMMITTEE DEADLINE MODAL */}
      {pendingApprovePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-[#0A3C2F] rounded-xl">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Forward Plan to Committee
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Set voting deadline &amp; trigger email notifications
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPendingApprovePlan(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="text-xs font-bold text-slate-900">
                  {pendingApprovePlan.planName}
                </p>
                <p className="text-[11px] font-mono text-slate-600">
                  Project: {pendingApprovePlan.projectCode} •{" "}
                  {pendingApprovePlan.budgetYear}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Select Committee Voting Deadline Date
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={committeeDeadlineDate}
                    onChange={(e) => setCommitteeDeadlineDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-[#0A3C2F] font-medium"
                  />
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-500">
                    Quick Presets:
                  </span>
                  {[3, 7, 14].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + days);
                        setCommitteeDeadlineDate(d.toISOString().split("T")[0]);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
                    >
                      +{days} Days
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
                <Clock className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                  Endorsement Committee members will receive an automated email
                  notification with a direct link and voting instructions valid
                  until <strong>{committeeDeadlineDate}</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPendingApprovePlan(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  handleApprovePlan(pendingApprovePlan, committeeDeadlineDate)
                }
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A3C2F] text-white hover:bg-[#072b22] text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Send className="h-3.5 w-3.5 text-[#A3E635]" />
                <span>Confirm &amp; Send to Committee</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

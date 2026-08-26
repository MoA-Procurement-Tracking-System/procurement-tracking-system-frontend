"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Home,
  FileText,
  Clock,
  Eye,
  Search,
  Filter,
  DollarSign,
  MapPin,
  CheckCircle2,
  Lock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import type { PlanCategory, ProcurementPlan } from "../../plans/plansData";
import type { ProjectItem } from "../../dashboards/components/director/projects/projectsData";
import {
  INITIAL_ACTIVITIES,
  type ProcurementActivity,
  type ProcurementMethod,
} from "../activitiesData";
import { officerProjects } from "../../projects/data/officerProjects";
import {
  mergeSavedPlans,
  OFFICER_PLAN_DRAFTS_STORAGE_KEY,
  parseSavedPlanRecords,
} from "../../projects/data/officerPlanDrafts";
import {
  OFFICER_ACTIVITY_DRAFTS_STORAGE_KEY,
  parseSavedActivityRecords,
} from "../../projects/data/officerActivityDrafts";
import { getPlanActivities } from "../../projects/data/fixtureActivityLifecycle";

interface ActivitiesListViewProps {
  plan: ProcurementPlan;
  project: ProjectItem;
  userRole?: "OFFICER" | "DIRECTOR" | "ADMIN";
  parentSection?: "projects" | "plan-for-review";
  onBackClick: () => void;
}

export function ActivitiesListView({
  plan,
  project,
  parentSection = "projects",
  onBackClick,
}: ActivitiesListViewProps) {
  const [activities] = useState<ProcurementActivity[]>(() => {
    const directMatches = INITIAL_ACTIVITIES.filter(
      (a) => a.planId === plan.id || a.projectCode === project.code,
    );
    if (directMatches.length > 0 && !plan.id.startsWith("officer-")) {
      return directMatches;
    }

    try {
      const planRef = plan.id.startsWith("officer-")
        ? plan.id.replace(`officer-${plan.projectCode}-`, "")
        : plan.id;
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
      const officerProject = mergedOfficerProjects.find(
        (p) => p.code === plan.projectCode,
      );
      const officerPlan = officerProject?.plans.find(
        (p) => p.reference === planRef || p.name === plan.planName,
      );

      if (officerProject && officerPlan) {
        const officerActs = getPlanActivities(
          officerProject,
          officerPlan,
          savedActivityRecords
            .filter(
              (r) =>
                r.projectCode === officerProject.code &&
                r.planReference === officerPlan.reference,
            )
            .map((r) => r.activity),
        );

        return officerActs.map((act): ProcurementActivity => ({
          id: `act-officer-${act.reference}`,
          planId: plan.id,
          planName: plan.planName,
          projectCode: plan.projectCode,
          category: act.category as PlanCategory,
          method: (act.method.includes("RFQ")
            ? "RFQ / Shopping"
            : act.method.includes("QCBS")
              ? "QCBS"
              : "RFB - National") as ProcurementMethod,
          marketApproach: "Open - National",
          qualificationApproach: "Post-qualification",
          domesticPreference: false,
          reviewType: "Prior",
          requiresUnAgency: false,
          isInProcess: false,
          activityRefNo: act.reference,
          description: act.description,
          estimatedAmount: act.estimatedAmount,
          currency: plan.id.includes("UA") ? "UA" : "ETB",
          status: "Draft",
          createdAt: "2026-08-26",
          fundingSource: "African Development Bank (AfDB)",
          fundingAllocationPercent: 100,
          component:
            act.details?.componentAllocations?.[0]?.id ?? "Component 1",
          subcomponent: "1.1 Subcomponent",
          componentAllocationPercent: 100,
          isLotRequired: false,
          classificationCode:
            act.details?.form?.classificationCode ?? "42100000",
          classificationDescription: "Procurement Package",
          locationRegion:
            act.details?.form?.location ?? plan.organizationRegion,
          roadmap: (act.details?.roadmap ?? []).map((stage, sIndex) => ({
            id: `stg-${sIndex + 1}`,
            stageName: stage.name,
            originalPlannedDate: stage.gregorianDate,
            plannedDurationDays: Number(stage.days) || 14,
            stageStatus: stage.notApplicable
              ? "Not Applicable"
              : ("Not Started" as const),
            remarks: stage.remarks,
          })),
        }));
      }
    } catch {}

    return directMatches;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("ALL");
  const [reviewFilter, setReviewFilter] = useState<string>("ALL");

  // Selected Activity for Detailed View
  const [selectedActivity, setSelectedActivity] =
    useState<ProcurementActivity | null>(null);

  // Active Detail Tab state (1: Key Details, 2: Related Info, 3: Additional Details, 4: Roadmap)
  const [activeDetailTab, setActiveDetailTab] = useState<1 | 2 | 3 | 4>(1);

  // Filter activities
  const filteredActivities = activities.filter((act) => {
    const matchesSearch =
      act.activityRefNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = methodFilter === "ALL" || act.method === methodFilter;
    const matchesReview =
      reviewFilter === "ALL" || act.reviewType === reviewFilter;
    return matchesSearch && matchesMethod && matchesReview;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-200 pb-8">
      {/* 1. SHORT & CONCISE BREADCRUMB NAVIGATION */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-xs"
      >
        <Link
          href="/dashboard"
          className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 shrink-0"
        >
          <Home className="h-3.5 w-3.5" />
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
        {parentSection === "plan-for-review" ? (
          <>
            <button
              onClick={onBackClick}
              className="text-slate-500 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
            >
              Plan for Review
            </button>
            <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
            <button
              onClick={onBackClick}
              className="text-slate-500 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
            >
              Review Plan
            </button>
          </>
        ) : (
          <button
            onClick={onBackClick}
            className="text-slate-500 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
          >
            Projects
          </button>
        )}
        <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
        <button
          onClick={() => setSelectedActivity(null)}
          className={`transition-colors cursor-pointer truncate max-w-[200px] ${
            selectedActivity
              ? "text-slate-500 hover:text-slate-900"
              : "font-bold text-[#0A3C2F]"
          }`}
        >
          Package Activities
        </button>
        {selectedActivity && (
          <>
            <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
            <span className="font-bold text-[#0A3C2F] font-mono truncate max-w-[180px]">
              {selectedActivity.activityRefNo}
            </span>
          </>
        )}
      </nav>

      {/* COMPREHENSIVE ACTIVITY DETAIL VIEW */}
      {selectedActivity ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Streamlined Header Card */}
          <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedActivity(null)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0A3C2F] hover:underline cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Activities
                    Table
                  </button>
                  <span className="text-slate-300">•</span>
                  <span className="font-mono text-xs font-extrabold text-[#0A3C2F] bg-white px-2 py-0.5 rounded border border-emerald-200">
                    {selectedActivity.activityRefNo}
                  </span>
                </div>

                <h1 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight leading-snug">
                  {selectedActivity.description}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span>
                    Category:{" "}
                    <strong className="text-slate-900">
                      {selectedActivity.category}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Method:{" "}
                    <strong className="text-[#0A3C2F]">
                      {selectedActivity.method}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Estimated Amount:{" "}
                    <strong className="text-slate-900 font-mono">
                      {selectedActivity.currency}{" "}
                      {selectedActivity.estimatedAmount.toLocaleString()}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Review Type:{" "}
                    <strong className="text-amber-800 font-bold">
                      {selectedActivity.reviewType}
                    </strong>
                  </span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-lg text-xs font-extrabold bg-[#0A3C2F] text-white shadow-2xs">
                {selectedActivity.status}
              </span>
            </div>
          </section>

          {/* Compact 4-Section Tabs */}
          <div className="bg-white p-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-bold">
              {[
                { id: 1, label: "Step 1: Key Details", icon: FileText },
                { id: 2, label: "Step 2: Related Info", icon: DollarSign },
                { id: 3, label: "Step 3: Additional Details", icon: MapPin },
                { id: 4, label: "Step 4: Roadmap", icon: Clock },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeDetailTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDetailTab(tab.id as 1 | 2 | 3 | 4)}
                    className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isActive
                        ? "bg-[#0A3C2F] text-white shadow-2xs"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 ${isActive ? "text-[#A3E635]" : "text-slate-400"}`}
                    />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* TAB 1: KEY DETAILS (Clean Unified Sheet Layout) */}
          {activeDetailTab === 1 && (
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <FileText className="h-4 w-4 text-[#0A3C2F]" />
                <h3 className="text-sm font-bold text-slate-900">
                  4.1 Step 1 — Key Details & Procurement Framework
                </h3>
              </div>

              {/* Unified Key-Value Table Sheet */}
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-500 w-1/3">
                    Procurement Category
                  </span>
                  <span className="font-extrabold text-slate-900 w-2/3 flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5 text-slate-400" />
                    {selectedActivity.category} (Inherited from Plan)
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-500 w-1/3">
                    Procurement Method
                  </span>
                  <span className="font-extrabold text-[#0A3C2F] w-2/3">
                    {selectedActivity.method}
                    {selectedActivity.specificMethod &&
                      ` (${selectedActivity.specificMethod})`}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-500 w-1/3">
                    Market Approach
                  </span>
                  <span className="font-bold text-slate-900 w-2/3">
                    {selectedActivity.marketApproach}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-500 w-1/3">
                    Qualification Approach
                  </span>
                  <span className="font-bold text-slate-900 w-2/3">
                    {selectedActivity.qualificationApproach}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-500 w-1/3">
                    Review Type / Oversight
                  </span>
                  <span className="font-extrabold text-amber-800 w-2/3">
                    {selectedActivity.reviewType} Review
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-500 w-1/3">
                    Domestic / Regional Preference
                  </span>
                  <span className="font-bold text-slate-900 w-2/3">
                    {selectedActivity.domesticPreference
                      ? "Yes (Applied)"
                      : "No"}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-500 w-1/3">
                    Procurement Process
                  </span>
                  <span className="font-bold text-slate-900 w-2/3">
                    {selectedActivity.procurementProcess ||
                      "Single Stage One Envelope"}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-500 w-1/3">
                    Procurement Document Type
                  </span>
                  <span className="font-bold text-slate-900 w-2/3">
                    {selectedActivity.procurementDocumentType ||
                      "Standard Bidding Document (SPD)"}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-500 w-1/3">
                    Framework Flags
                  </span>
                  <div className="w-2/3 flex flex-wrap gap-4 text-slate-700">
                    <span className="flex items-center gap-1">
                      <CheckCircle2
                        className={`h-3.5 w-3.5 ${selectedActivity.requiresUnAgency ? "text-emerald-600" : "text-slate-300"}`}
                      />
                      UN Contracting:{" "}
                      <strong>
                        {selectedActivity.requiresUnAgency ? "Yes" : "No"}
                      </strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2
                        className={`h-3.5 w-3.5 ${selectedActivity.isInProcess ? "text-emerald-600" : "text-slate-300"}`}
                      />
                      In-Process (Migrated):{" "}
                      <strong>
                        {selectedActivity.isInProcess ? "Yes" : "No"}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RELATED INFORMATION (Clean Unified Sheet Layout) */}
          {activeDetailTab === 2 && (
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <DollarSign className="h-4 w-4 text-[#0A3C2F]" />
                <h3 className="text-sm font-bold text-slate-900">
                  4.2 Step 2 — Scope, Budget, Lot Packaging & Financing
                </h3>
              </div>

              {/* Unified Key-Value Table Sheet */}
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-500 w-1/3">
                    Activity Reference No.
                  </span>
                  <span className="font-mono font-extrabold text-[#0A3C2F] w-2/3">
                    {selectedActivity.activityRefNo}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-500 w-1/3">
                    Estimated Amount
                  </span>
                  <span className="font-mono font-extrabold text-slate-950 w-2/3">
                    {selectedActivity.currency}{" "}
                    {selectedActivity.estimatedAmount.toLocaleString()}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-500 w-1/3">
                    Funding Source & Instrument
                  </span>
                  <div className="w-2/3 font-bold text-slate-900">
                    {selectedActivity.fundingSource}
                    {selectedActivity.loanGrantNo && (
                      <span className="font-mono text-[11px] text-slate-500 ml-2 font-normal">
                        (No: {selectedActivity.loanGrantNo}, 100% allocation)
                      </span>
                    )}
                  </div>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-500 w-1/3">
                    Project Component
                  </span>
                  <div className="w-2/3 font-bold text-slate-900">
                    {selectedActivity.component || "N/A"}
                    {selectedActivity.subcomponent && (
                      <span className="text-[11px] text-slate-600 ml-2 font-normal">
                        [{selectedActivity.subcomponent}]
                      </span>
                    )}
                  </div>
                </div>

                {selectedActivity.invitationRefNo && (
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="font-semibold text-slate-500 w-1/3">
                      Invitation / Bid Ref No.
                    </span>
                    <span className="font-mono font-bold text-slate-900 w-2/3">
                      {selectedActivity.invitationRefNo}
                    </span>
                  </div>
                )}

                <div className="py-2.5 flex items-start justify-between">
                  <span className="font-semibold text-slate-500 w-1/3 pt-0.5">
                    Lot Packaging Requirements
                  </span>
                  <div className="w-2/3 space-y-1.5">
                    <div className="font-bold text-slate-900">
                      {selectedActivity.isLotRequired
                        ? `${selectedActivity.lots?.length || 0} Repeatable Lots Configured`
                        : "Single Package (No Split Lots)"}
                    </div>
                    {selectedActivity.isLotRequired &&
                      selectedActivity.lots && (
                        <div className="space-y-1 text-xs pt-1">
                          {selectedActivity.lots.map((lot) => (
                            <div
                              key={lot.id}
                              className="flex items-center justify-between text-slate-700 font-medium"
                            >
                              <span>
                                <strong>{lot.lotNumber}:</strong>{" "}
                                {lot.lotDescription}
                              </span>
                              <span className="font-mono font-bold text-[#0A3C2F] ml-3">
                                {selectedActivity.currency}{" "}
                                {lot.estimatedAmount.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ADDITIONAL DETAILS (Clean Unified Sheet Layout) */}
          {activeDetailTab === 3 && (
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <MapPin className="h-4 w-4 text-[#0A3C2F]" />
                <h3 className="text-sm font-bold text-slate-900">
                  4.3 Step 3 — Classification & Regional Location
                </h3>
              </div>

              {/* Unified Key-Value Table Sheet */}
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-500 w-1/3">
                    Classification Code
                  </span>
                  <span className="font-mono font-extrabold text-slate-900 w-2/3">
                    {selectedActivity.classificationCode || "42100000"} —{" "}
                    {selectedActivity.classificationDescription ||
                      "Agricultural Machinery & Equipment"}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-500 w-1/3">
                    Implementation Location / Region
                  </span>
                  <span className="font-bold text-slate-900 w-2/3">
                    {selectedActivity.locationRegion || plan.organizationRegion}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-500 w-1/3">
                    Location Coordinates
                  </span>
                  <span className="font-mono font-bold text-slate-900 w-2/3">
                    Latitude: {selectedActivity.latitude || "9.0192"} |
                    Longitude: {selectedActivity.longitude || "38.7525"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ROADMAP */}
          {activeDetailTab === 4 && (
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#0A3C2F]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    4.4 Step 4 — Activity Roadmap & Stage Milestones
                  </h3>
                </div>
                <span className="text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-emerald-600" />
                  Method: {selectedActivity.method}
                </span>
              </div>

              <div className="rounded-lg border border-slate-200 overflow-hidden text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[650px]">
                    <thead className="bg-[#0A3C2F] text-white text-[11px] font-extrabold uppercase">
                      <tr>
                        <th className="py-2.5 px-3 w-8 text-center">#</th>
                        <th className="py-2.5 px-3 min-w-[180px]">
                          Stage Name
                        </th>
                        <th className="py-2.5 px-3 font-mono">
                          Original Baseline
                        </th>
                        <th className="py-2.5 px-3 font-mono">
                          Current Target
                        </th>
                        <th className="py-2.5 px-3 font-mono">Actual Date</th>
                        <th className="py-2.5 px-3 text-center">
                          Stage Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {selectedActivity.roadmap.map((stage, idx) => (
                        <tr key={stage.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-center font-bold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-900">
                            {stage.stageName}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-600">
                            {stage.originalPlannedDate || "—"}
                          </td>
                          <td className="py-2 px-3 font-mono font-semibold text-slate-900">
                            {stage.revisedTargetDate ||
                              stage.originalPlannedDate ||
                              "—"}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-emerald-700">
                            {stage.actualDate || "—"}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                stage.stageStatus === "Completed"
                                  ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                  : stage.stageStatus === "In Progress"
                                    ? "bg-blue-100 text-blue-900 border border-blue-300"
                                    : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {stage.stageStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* MAIN TABULAR ACTIVITY DIRECTORY */
        <div className="space-y-4">
          {/* Context Header */}
          <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={onBackClick}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0A3C2F] hover:underline cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </button>
                  <span className="text-slate-300">•</span>
                  <span className="font-mono text-xs font-extrabold text-[#0A3C2F] bg-white px-2 py-0.5 rounded border border-emerald-200">
                    {project.code}
                  </span>
                </div>

                <h1 className="text-lg font-extrabold text-slate-950 tracking-tight">
                  Package Activities — {plan.planName}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span>
                    Category:{" "}
                    <strong className="text-slate-900">{plan.category}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Fiscal Year:{" "}
                    <strong className="text-slate-900">
                      {plan.budgetYear}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Region:{" "}
                    <strong className="text-slate-900">
                      {plan.organizationRegion}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search package activities by Ref No or Description..."
                className="w-full pl-10 pr-4 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-[#0A3C2F] outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="bg-transparent font-semibold text-slate-700 outline-none text-xs"
                >
                  <option value="ALL">All Procurement Methods</option>
                  <option value="RFB - National">RFB - National</option>
                  <option value="RFB - International">
                    RFB - International
                  </option>
                  <option value="RFQ / Shopping">RFQ / Shopping</option>
                  <option value="QCBS">QCBS</option>
                  <option value="Direct Procurement">Direct Procurement</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
                <select
                  value={reviewFilter}
                  onChange={(e) => setReviewFilter(e.target.value)}
                  className="bg-transparent font-semibold text-slate-700 outline-none text-xs"
                >
                  <option value="ALL">All Review Types</option>
                  <option value="Prior">Prior Review</option>
                  <option value="Post">Post Review</option>
                  <option value="Audit">Audit</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabular Activity Directory */}
          <div className="rounded-xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[920px]">
                <thead>
                  <tr className="bg-[#0A3C2F] text-white text-[11px] font-extrabold uppercase tracking-wider">
                    <th className="py-2.5 px-3 text-center w-10">#</th>
                    <th className="py-2.5 px-3 min-w-[140px]">
                      Activity Ref No
                    </th>
                    <th className="py-2.5 px-3 min-w-[220px]">
                      Description & Scope
                    </th>
                    <th className="py-2.5 px-3 min-w-[140px]">
                      Method / Market
                    </th>
                    <th className="py-2.5 px-3 min-w-[90px]">Review</th>
                    <th className="py-2.5 px-3 min-w-[120px]">
                      Estimated Amount
                    </th>
                    <th className="py-2.5 px-3 text-center min-w-[110px]">
                      Progress
                    </th>
                    <th className="py-2.5 px-3 text-center min-w-[80px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredActivities.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-8 text-center text-slate-500"
                      >
                        <FileText className="mx-auto h-7 w-7 text-slate-300 mb-1" />
                        <p className="font-semibold text-slate-700 text-xs">
                          No procurement activities found
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredActivities.map((act, index) => {
                      const completedStages = act.roadmap.filter(
                        (s) => s.stageStatus === "Completed",
                      ).length;
                      const totalStages = act.roadmap.length;
                      const percentComplete = Math.round(
                        (completedStages / (totalStages || 1)) * 100,
                      );

                      return (
                        <tr
                          key={act.id}
                          onClick={() => setSelectedActivity(act)}
                          className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                        >
                          <td className="py-2 px-3 font-mono text-slate-400 font-semibold text-center">
                            {index + 1}
                          </td>

                          <td className="py-2 px-3 font-mono font-bold text-slate-900 text-xs">
                            {act.activityRefNo}
                          </td>

                          <td className="py-2 px-3 max-w-xs">
                            <p className="font-bold text-slate-900 text-xs leading-snug">
                              {act.description}
                            </p>
                          </td>

                          <td className="py-2 px-3 text-xs">
                            <div className="font-bold text-[#0A3C2F]">
                              {act.method}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {act.marketApproach}
                            </div>
                          </td>

                          <td className="py-2 px-3">
                            <span
                              className={`text-xs font-extrabold ${
                                act.reviewType === "Prior"
                                  ? "text-amber-800"
                                  : "text-slate-700"
                              }`}
                            >
                              {act.reviewType}
                            </span>
                          </td>

                          <td className="py-2 px-3 font-mono font-bold text-slate-900 text-xs">
                            {act.currency}{" "}
                            {act.estimatedAmount.toLocaleString()}
                          </td>

                          <td className="py-2 px-3 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                              <Clock className="h-3 w-3 text-emerald-700" />
                              {completedStages}/{totalStages} ({percentComplete}
                              %)
                            </span>
                          </td>

                          <td className="py-2 px-3 text-center whitespace-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedActivity(act);
                              }}
                              title="View Activity Details"
                              className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer mx-auto"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
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
      )}
    </div>
  );
}

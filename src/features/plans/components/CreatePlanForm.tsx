"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  FileText,
  Home,
  Info,
  Lock,
  Save,
} from "lucide-react";
import Link from "next/link";
import type { ProjectItem } from "../../dashboards/components/director/projects/projectsData";
import {
  PLAN_CATEGORY_CHOICES,
  type PlanCategory,
  type PlanStatus,
  type ProcurementPlan,
} from "../plansData";

interface CreatePlanFormProps {
  project: ProjectItem;
  initialData?: ProcurementPlan | null;
  userRole?: "OFFICER" | "DIRECTOR" | "ADMIN";
  onBackClick: () => void;
  onSavePlan: (plan: ProcurementPlan) => void;
}

const BUDGET_YEAR_OPTIONS = [
  "2018 EFY (2025/2026)",
  "2017 EFY (2024/2025)",
  "2019 EFY (2026/2027)",
];

const ORGANIZATION_REGION_OPTIONS = [
  "FPCU / Federal",
  "Oromia",
  "Somali",
  "Afar",
  "Southwest Ethiopia",
  "South Ethiopia",
  "Amhara",
  "Tigray",
  "Sidama",
  "Gambella",
  "Benishangul-Gumuz",
  "Dire Dawa",
  "Harari",
];

export function CreatePlanForm({
  project,
  initialData,
  userRole = "OFFICER",
  onBackClick,
  onSavePlan,
}: CreatePlanFormProps) {
  const isDirector = userRole === "DIRECTOR";

  const [budgetYear, setBudgetYear] = useState(
    initialData?.budgetYear || project.budgetYear || "2018 EFY (2025/2026)",
  );
  const [category, setCategory] = useState<PlanCategory>(
    initialData?.category || "Goods",
  );
  const [planName, setPlanName] = useState(
    initialData?.planName ||
      `${project.code} - Goods Procurement Plan - 2018 EFY`,
  );
  const [planPeriodFrom, setPlanPeriodFrom] = useState(
    initialData?.planPeriodFrom || "2025-07-08",
  );
  const [planPeriodTo, setPlanPeriodTo] = useState(
    initialData?.planPeriodTo || "2026-07-07",
  );
  const [organizationRegion, setOrganizationRegion] = useState(
    initialData?.organizationRegion || project.region || "FPCU / Federal",
  );
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [generalNoticeDate, setGeneralNoticeDate] = useState(
    initialData?.generalNoticeDate || "",
  );
  const [status, setStatus] = useState<PlanStatus>(
    initialData?.status || "Draft",
  );

  const [dateError, setDateError] = useState<string | null>(null);

  // Auto-generate suggested plan name when project, category, or budgetYear changes (only for new officer plans)
  useEffect(() => {
    if (!initialData && !isDirector) {
      const yearShort = budgetYear.split(" ")[0] || "2018 EFY";
      setPlanName(
        `${project.code} - ${category} Procurement Plan - ${yearShort}`,
      );
    }
  }, [category, budgetYear, project.code, initialData, isDirector]);

  const selectedCategoryInfo = PLAN_CATEGORY_CHOICES.find(
    (c) => c.category === category,
  );

  // Is Director trying to view/edit a Draft plan?
  const isDraftPlanForDirector = isDirector && status === "Draft";

  const handleSaveWithStatus = (targetStatus?: PlanStatus) => {
    setDateError(null);

    if (new Date(planPeriodTo) <= new Date(planPeriodFrom)) {
      setDateError("Plan coverage end date must be after start date.");
      return;
    }

    const finalStatus = targetStatus || status;

    const savedPlan: ProcurementPlan = {
      id: initialData?.id || `plan-${Date.now()}`,
      projectId: project.id,
      projectCode: project.code,
      projectName: project.name,
      planName: planName.trim(),
      budgetYear,
      category,
      planPeriodFrom,
      planPeriodTo,
      organizationRegion,
      description: description.trim() || undefined,
      approvalDate:
        finalStatus === "Committee Review" || finalStatus === "Finally Approved"
          ? new Date().toISOString().split("T")[0]
          : initialData?.approvalDate,
      generalNoticeDate: generalNoticeDate.trim() || undefined,
      status: finalStatus,
      createdBy: initialData?.createdBy || "Procurement Officer",
      createdAt:
        initialData?.createdAt || new Date().toISOString().split("T")[0],
      activitiesCount: initialData?.activitiesCount || 0,
    };

    onSavePlan(savedPlan);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDraftPlanForDirector) return;
    handleSaveWithStatus();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200 pb-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
        <Link
          href="/dashboard"
          className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
        >
          <Home className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <button
          onClick={onBackClick}
          className="text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          {project.code} Plans
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="font-bold text-[#0A3C2F]">
          {isDirector
            ? "Director Plan Review & Edits"
            : initialData
              ? "Edit Procurement Plan"
              : "Create Procurement Plan"}
        </span>
      </nav>

      {/* 1. Inherited Project Identity Header Context (Light Background) */}
      <section className="rounded-2xl border border-emerald-200/90 bg-emerald-50/60 p-5 sm:p-6 shadow-2xs">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-[#0A3C2F] shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="text-[11px] font-extrabold text-[#0A3C2F] uppercase tracking-wider block mb-0.5">
              Inherited Project Context (Locked)
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-950 tracking-tight">
              {project.code} — {project.name}
            </h2>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
              <div>
                <span className="text-slate-500 font-medium">SAP ID:</span>{" "}
                <span className="font-mono font-semibold text-slate-900">
                  {project.sapNumber || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">
                  Donor / Funding:
                </span>{" "}
                <span className="font-semibold text-slate-900">
                  {project.fundingSource}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">
                  Executing Agency:
                </span>{" "}
                <span className="font-semibold text-slate-900">
                  {project.executingAgency}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Procurement Plan Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#0A3C2F]" />
              <h3 className="text-base font-bold text-slate-900">
                Plan Identity & Scope
              </h3>
            </div>
            {isDirector && (
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                Restricted Director Controls
              </span>
            )}
          </div>

          {/* Category Dropdown & Enforcement Notice */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-slate-800">
                Procurement Category <span className="text-rose-500">*</span>
              </label>
              {isDirector && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                  <Lock className="h-3 w-3" /> Locked for Director
                </span>
              )}
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PlanCategory)}
              disabled={isDirector || isDraftPlanForDirector}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors ${
                isDirector
                  ? "bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed"
                  : "bg-white text-slate-900 border-slate-300 focus:border-[#0A3C2F] focus:ring-1 focus:ring-[#0A3C2F]"
              }`}
              required
            >
              {PLAN_CATEGORY_CHOICES.map((c) => (
                <option key={c.category} value={c.category}>
                  {c.category} ({c.description})
                </option>
              ))}
            </select>

            {/* Category Explanation & Examples box */}
            {selectedCategoryInfo && (
              <div className="mt-2.5 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs leading-relaxed text-slate-700">
                <p className="font-bold text-slate-900">
                  {selectedCategoryInfo.category} Category Examples:
                </p>
                <p className="text-slate-600 mt-0.5">
                  {selectedCategoryInfo.examples}
                </p>
                <p className="text-[11px] font-semibold text-emerald-800 mt-1.5 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  Activities created inside this Plan strictly inherit this
                  category.
                </p>
              </div>
            )}
          </div>

          {/* Plan Name */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
              Plan Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              disabled={isDraftPlanForDirector}
              placeholder="e.g. BREFONS - Goods Procurement Plan - 2018 EFY"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-[#0A3C2F] focus:ring-1 focus:ring-[#0A3C2F] outline-none transition-colors"
              required
            />
          </div>

          {/* Grid: Budget Year & Organization/Region */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Budget / Fiscal Year */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-slate-800">
                  Budget / Fiscal Year <span className="text-rose-500">*</span>
                </label>
                {isDirector && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                    <Lock className="h-3 w-3" /> Restricted
                  </span>
                )}
              </div>
              <select
                value={budgetYear}
                onChange={(e) => setBudgetYear(e.target.value)}
                disabled={isDirector || isDraftPlanForDirector}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors ${
                  isDirector
                    ? "bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed"
                    : "bg-white text-slate-900 border-slate-300 focus:border-[#0A3C2F] focus:ring-1 focus:ring-[#0A3C2F]"
                }`}
                required
              >
                {BUDGET_YEAR_OPTIONS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Organization / Region */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                Organization / Region <span className="text-rose-500">*</span>
              </label>
              <select
                value={organizationRegion}
                onChange={(e) => setOrganizationRegion(e.target.value)}
                disabled={isDraftPlanForDirector}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 bg-white focus:border-[#0A3C2F] focus:ring-1 focus:ring-[#0A3C2F] outline-none transition-colors"
                required
              >
                {ORGANIZATION_REGION_OPTIONS.map((reg) => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid: Plan Period From & To */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#0A3C2F]" />
              <label className="text-xs sm:text-sm font-semibold text-slate-800">
                Plan Coverage Period <span className="text-rose-500">*</span>
              </label>
            </div>

            {dateError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
                {dateError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Plan Period From (Start Date)
                </label>
                <input
                  type="date"
                  value={planPeriodFrom}
                  onChange={(e) => setPlanPeriodFrom(e.target.value)}
                  disabled={isDraftPlanForDirector}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-[#0A3C2F] focus:ring-1 focus:ring-[#0A3C2F] outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Plan Period To (End Date)
                </label>
                <input
                  type="date"
                  value={planPeriodTo}
                  onChange={(e) => setPlanPeriodTo(e.target.value)}
                  disabled={isDraftPlanForDirector}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-[#0A3C2F] focus:ring-1 focus:ring-[#0A3C2F] outline-none transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* General Notice Date & Workflow Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                General Procurement Notice Date (Optional)
              </label>
              <input
                type="date"
                value={generalNoticeDate}
                onChange={(e) => setGeneralNoticeDate(e.target.value)}
                disabled={isDirector || isDraftPlanForDirector}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors ${
                  isDirector
                    ? "bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed"
                    : "bg-white text-slate-900 border-slate-300 focus:border-[#0A3C2F] focus:ring-1 focus:ring-[#0A3C2F]"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                Current Workflow Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PlanStatus)}
                disabled={isDirector || isDraftPlanForDirector}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors ${
                  isDirector
                    ? "bg-slate-100 text-slate-800 font-bold border-slate-200 cursor-not-allowed"
                    : "bg-white text-slate-900 border-slate-300 focus:border-[#0A3C2F] focus:ring-1 focus:ring-[#0A3C2F]"
                }`}
              >
                <option value="Draft">Draft</option>
                <option value="Submitted to Director">
                  Submitted to Director
                </option>
                <option value="Committee Review">Committee Review</option>
                <option value="Returned">Returned</option>
                <option value="Finally Approved">Finally Approved</option>
              </select>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
              Description / Remarks (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isDraftPlanForDirector}
              placeholder="Plan-level notes, special coverage notes or donor guidelines..."
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-[#0A3C2F] focus:ring-1 focus:ring-[#0A3C2F] outline-none transition-colors"
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onBackClick}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Back to Plans List
            </button>

            {!isDraftPlanForDirector && (
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0A3C2F] hover:bg-[#072b22] text-xs sm:text-sm font-bold text-white shadow-xs transition-colors cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>
                  {isDirector
                    ? "Save Edits"
                    : initialData
                      ? "Save Changes"
                      : "Create Procurement Plan"}
                </span>
              </button>
            )}
          </div>
        </section>
      </form>
    </div>
  );
}

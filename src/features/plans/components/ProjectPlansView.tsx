"use client";

import { useState } from "react";
import {
  ChevronRight,
  Edit,
  Eye,
  FileText,
  Home,
  ListChecks,
  Search,
} from "lucide-react";
import Link from "next/link";
import type { ProjectItem } from "../../dashboards/components/director/projects/projectsData";
import type { PlanCategory, ProcurementPlan } from "../plansData";

interface ProjectPlansViewProps {
  project: ProjectItem;
  plans: ProcurementPlan[];
  userRole?: "OFFICER" | "DIRECTOR" | "ADMIN";
  onBackToProjects: () => void;
  onCreatePlanClick?: () => void;
  onEditPlanClick?: (plan: ProcurementPlan) => void;
  onViewActivitiesClick: (plan: ProcurementPlan) => void;
}

const CATEGORY_BADGES: Record<
  PlanCategory,
  { bg: string; text: string; border: string }
> = {
  Goods: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
  },
  Works: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
  },
  "Non-Consulting Services": {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  "Consultancy Services": {
    bg: "bg-purple-50",
    text: "text-purple-800",
    border: "border-purple-200",
  },
};

const STATUS_BADGES: Record<string, { bg: string; text: string }> = {
  Draft: { bg: "bg-slate-100", text: "text-slate-700" },
  "Submitted to Director": { bg: "bg-blue-100", text: "text-blue-800" },
  "Committee Review": { bg: "bg-purple-100", text: "text-purple-800" },
  Returned: { bg: "bg-rose-100", text: "text-rose-800" },
  "Finally Approved": { bg: "bg-emerald-100", text: "text-emerald-800" },
};

export function ProjectPlansView({
  project,
  plans,
  userRole = "OFFICER",
  onBackToProjects,
  onEditPlanClick,
  onViewActivitiesClick,
}: ProjectPlansViewProps) {
  const isDirector = userRole === "DIRECTOR";
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  // Filter plans under this project
  const projectPlans = plans.filter((p) => p.projectId === project.id);

  const filteredPlans = projectPlans.filter((plan) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      plan.planName.toLowerCase().includes(q) ||
      plan.budgetYear.toLowerCase().includes(q) ||
      plan.organizationRegion.toLowerCase().includes(q) ||
      plan.category.toLowerCase().includes(q);

    const matchesCategory =
      categoryFilter === "All Categories" || plan.category === categoryFilter;

    const matchesStatus =
      statusFilter === "All Statuses" || plan.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
        <Link
          href="/dashboard"
          className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
        >
          <Home className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <button
          onClick={onBackToProjects}
          className="text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          Projects Directory
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="font-bold text-[#0A3C2F]">{project.code} Plans</span>
      </nav>

      {/* 2. Page Title Header Section */}
      <div className="space-y-3 pb-2 border-b border-slate-200/60">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-mono font-extrabold text-xs px-3 py-1 rounded-lg bg-[#0A3C2F] text-[#A3E635] border border-[#125241] shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635]" />
            {project.code}
          </span>
          {project.sapNumber && (
            <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
              SAP: {project.sapNumber}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
          {project.name}
        </h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 font-medium">
          <span>
            Donor:{" "}
            <strong className="text-slate-800 font-semibold">
              {project.fundingSource}
            </strong>
          </span>
          <span className="text-slate-300">•</span>
          <span>
            Agency:{" "}
            <strong className="text-slate-800 font-semibold">
              {project.executingAgency}
            </strong>
          </span>
          <span className="text-slate-300">•</span>
          <span>
            Region:{" "}
            <strong className="text-slate-800 font-semibold">
              {project.region}
            </strong>
          </span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-3 lg:space-y-0 lg:flex lg:items-center lg:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plans by name, category, region, budget year..."
            className="w-full rounded-xl bg-slate-50/80 border border-slate-200/90 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl bg-slate-50/80 border border-slate-200/90 px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer"
          >
            <option value="All Categories">All Plan Categories</option>
            <option value="Goods">Goods</option>
            <option value="Works">Works</option>
            <option value="Non-Consulting Services">
              Non-Consulting Services
            </option>
            <option value="Consultancy Services">Consultancy Services</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl bg-slate-50/80 border border-slate-200/90 px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer"
          >
            <option value="All Statuses">All Plan Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Submitted to Director">Submitted to Director</option>
            <option value="Committee Review">Committee Review</option>
            <option value="Returned">Returned</option>
            <option value="Finally Approved">Finally Approved</option>
          </select>
        </div>
      </div>

      {/* 4. Tabular View of Procurement Plans */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[960px]">
            <thead>
              <tr className="bg-[#0A3C2F] text-white text-[11px] font-extrabold uppercase tracking-wider">
                <th className="py-3 px-3 text-center w-10">#</th>
                <th className="py-3 px-3 min-w-[180px] max-w-[220px]">
                  Plan Name
                </th>
                <th className="py-3 px-3 min-w-[130px]">Category</th>
                <th className="py-3 px-3 min-w-[140px]">Budget Year</th>
                <th className="py-3 px-3 min-w-[150px]">Coverage Period</th>
                <th className="py-3 px-3 min-w-[120px]">Region / Unit</th>
                <th className="py-3 px-3 min-w-[130px]">Notice / Approval</th>
                <th className="py-3 px-3 text-center min-w-[110px]">Status</th>
                <th className="py-3 px-3 text-center min-w-[90px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700 text-sm">
                      No procurement plans found for this project
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Click &quot;Create Procurement Plan&quot; to add a new
                      plan for {project.code}.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPlans.map((plan, index) => {
                  const catStyle =
                    CATEGORY_BADGES[plan.category] || CATEGORY_BADGES.Goods;
                  const statusStyle =
                    STATUS_BADGES[plan.status] || STATUS_BADGES.Draft;

                  return (
                    <tr
                      key={plan.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Index */}
                      <td className="py-2.5 px-3 font-mono text-slate-400 font-semibold text-center">
                        {index + 1}
                      </td>

                      {/* Plan Name */}
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

                      {/* Category Badge */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-[11px] font-extrabold ${catStyle.text}`}
                        >
                          {plan.category}
                        </span>
                      </td>

                      {/* Budget Year */}
                      <td className="py-2.5 px-3 font-semibold text-slate-800 text-xs">
                        {plan.budgetYear}
                      </td>

                      {/* Coverage Period */}
                      <td className="py-2.5 px-3 text-slate-600 font-medium text-xs">
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

                      {/* Organization / Region */}
                      <td className="py-2.5 px-3 font-semibold text-slate-800 text-xs">
                        {plan.organizationRegion}
                      </td>

                      {/* Notice / Approval Dates */}
                      <td className="py-2.5 px-3 text-slate-500">
                        {plan.approvalDate ? (
                          <p className="text-emerald-700 font-semibold text-[11px]">
                            Approved: {plan.approvalDate}
                          </p>
                        ) : (
                          <p className="text-slate-400 text-[11px]">
                            Pending Approval
                          </p>
                        )}
                        {plan.generalNoticeDate && (
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Notice: {plan.generalNoticeDate}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[10px] font-extrabold ${statusStyle.text}`}
                        >
                          {plan.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Package Activities */}
                          <button
                            onClick={() => onViewActivitiesClick(plan)}
                            title="View Package Activities under Plan"
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                          >
                            <ListChecks className="h-3.5 w-3.5" />
                          </button>

                          {/* Plan Review / Edit / View Actions */}
                          {onEditPlanClick &&
                            (isDirector ? (
                              plan.status === "Draft" ? (
                                <span
                                  title="Directors cannot review or edit Draft plans until submitted by Officer"
                                  className="text-[10px] font-semibold text-slate-400 italic px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md"
                                >
                                  Draft (Officer Working)
                                </span>
                              ) : plan.status === "Submitted to Director" ? (
                                <button
                                  onClick={() => onEditPlanClick(plan)}
                                  title="Review & Restricted Edit Plan (Director Authorized)"
                                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0A3C2F] text-white hover:bg-[#072b22] transition-colors cursor-pointer shadow-2xs"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => onEditPlanClick(plan)}
                                  title="View Plan Details (Read-only)"
                                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                              )
                            ) : (
                              <button
                                onClick={() => onEditPlanClick(plan)}
                                title="Edit Procurement Plan"
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                            ))}
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

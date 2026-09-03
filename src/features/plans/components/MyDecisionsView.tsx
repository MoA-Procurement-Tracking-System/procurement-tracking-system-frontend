"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Home,
  ChevronRight,
  ArrowLeft,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { fetchPlans, mapBackendPlanToFrontend } from "../../../lib/plansApi";
import type { AuthUser } from "../../../lib/authTypes";
import { INITIAL_PLANS, type ProcurementPlan } from "../plansData";

interface DecisionRecord {
  id: string;
  planName: string;
  subtitle: string;
  project: string;
  category: "GOODS" | "WORKS" | "CONSULTANCY" | "NON-CONSULTING";
  decision: "Approved" | "Rejected";
  dateRecorded: string;
  overallStatus: string;
  progress: number;
  progressText: string;
  rejectionReason?: string;
}

interface MyDecisionsViewProps {
  user: AuthUser;
}

export function MyDecisionsView({ user }: MyDecisionsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [decisionFilter, setDecisionFilter] = useState("ALL");
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [plans, setPlans] = useState<ProcurementPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlans() {
      try {
        setLoading(true);
        const rawPlans = await fetchPlans();
        const mapped = rawPlans.map((p) =>
          mapBackendPlanToFrontend(p, user.id, user.email),
        );

        const planMap = new Map<string, ProcurementPlan>();
        INITIAL_PLANS.forEach((p) => planMap.set(p.id, p));
        mapped.forEach((p) => planMap.set(p.id, p));

        setPlans(Array.from(planMap.values()));
      } catch (err) {
        console.error("Failed to load decisions:", err);
        setPlans([...INITIAL_PLANS]);
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, [user.id, user.email]);

  const [selectedDecision, setSelectedDecision] =
    useState<DecisionRecord | null>(null);

  useEffect(() => {
    const handleReset = (event: Event) => {
      const customEvent = event as CustomEvent<{ href?: string }>;
      if (!customEvent.detail?.href || customEvent.detail.href === "/workspace/my-decisions") {
        setSelectedDecision(null);
      }
    };

    window.addEventListener("pts:sidebar-reset", handleReset);
    return () => window.removeEventListener("pts:sidebar-reset", handleReset);
  }, []);

  const decisions: DecisionRecord[] = plans
    .filter((p) => p.committeeDecision !== undefined)
    .map((p) => {
      let categoryVal: "GOODS" | "WORKS" | "CONSULTANCY" | "NON-CONSULTING" =
        "GOODS";
      if (p.category === "Works") categoryVal = "WORKS";
      else if (p.category === "Consultancy Services")
        categoryVal = "CONSULTANCY";
      else if (p.category === "Non-Consulting Services")
        categoryVal = "NON-CONSULTING";

      return {
        id: p.id,
        planName: p.planName,
        subtitle: `${p.budgetYear} • ${p.activitiesCount} Activities`,
        project: p.projectCode,
        category: categoryVal,
        decision: p.committeeDecision === "Approved" ? "Approved" : "Rejected",
        dateRecorded: p.decisionRecordedDate || "Recent",
        overallStatus:
          p.status === "Finally Approved" ? "Finally Approved" : "Pending",
        progress: p.progress || 0,
        progressText: p.progressText || "",
        rejectionReason: p.rejectionReason,
      };
    });

  // Filtering Logic
  const filteredDecisions = decisions.filter((dec) => {
    const matchesSearch =
      dec.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dec.project.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDecision =
      decisionFilter === "ALL" || dec.decision.toUpperCase() === decisionFilter;
    const matchesProject =
      projectFilter === "ALL" || dec.project.toUpperCase() === projectFilter;

    return matchesSearch && matchesDecision && matchesProject;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
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
          onClick={() => setSelectedDecision(null)}
          className={`transition-colors cursor-pointer ${
            selectedDecision
              ? "text-slate-500 hover:text-slate-900"
              : "font-bold text-[#0A3C2F]"
          }`}
        >
          My Decisions
        </button>
        {selectedDecision && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-bold text-[#0A3C2F]">
              Decision: {selectedDecision.planName}
            </span>
          </>
        )}
      </nav>

      {/* VIEW 1: DETAILED VIEW */}
      {selectedDecision ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedDecision(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A3C2F] hover:underline cursor-pointer mb-1"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to My Decisions List
                </button>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                  {selectedDecision.planName}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedDecision.subtitle}
                </p>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
                  selectedDecision.decision === "Approved"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : "bg-rose-50 text-rose-700 border-rose-100"
                }`}
              >
                {selectedDecision.decision === "Approved" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                {selectedDecision.decision}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-600 pt-2">
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wide">
                  Project:
                </span>
                <strong className="text-slate-900 text-sm font-bold">
                  {selectedDecision.project}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wide">
                  Category:
                </span>
                <strong className="text-slate-900 text-sm font-bold">
                  {selectedDecision.category}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wide">
                  Date Recorded:
                </span>
                <strong className="text-slate-900 text-sm font-bold">
                  {selectedDecision.dateRecorded}
                </strong>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-900">
                Consensus & Quorum Status
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-48 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${selectedDecision.progress}%` }}
                  ></div>
                </div>
                <span className="text-xs text-slate-600 font-semibold">
                  {selectedDecision.progressText} (
                  {selectedDecision.overallStatus})
                </span>
              </div>
            </div>

            {selectedDecision.rejectionReason && (
              <div className="pt-4 border-t border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wide mb-1.5">
                  Mandatory Rejection Comment:
                </span>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-700 italic font-medium leading-relaxed">
                  &quot;{selectedDecision.rejectionReason}&quot;
                </div>
              </div>
            )}
          </section>
        </div>
      ) : (
        /* VIEW 2: SEARCH & FILTER + LIST VIEW */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="relative flex-1 min-w-60">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search decisions by plan name or project..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:border-[#0A3C2F] outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={decisionFilter}
                  onChange={(e) => setDecisionFilter(e.target.value)}
                  className="bg-transparent font-semibold text-slate-700 outline-none text-xs"
                >
                  <option value="ALL">All Decisions</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="bg-transparent font-semibold text-slate-700 outline-none text-xs"
                >
                  <option value="ALL">All Projects</option>
                  <option value="DRIVE">DRIVE</option>
                  <option value="BREFONS">BREFONS</option>
                  <option value="NATIONAL AG">National Ag</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabular Decisions Directory */}
          <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-200 text-xs">
                <thead>
                  <tr className="bg-[#0A3C2F] text-white text-[11px] font-extrabold uppercase tracking-wider">
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Date Voted</th>
                    <th className="py-3 px-4">My Vote</th>
                    <th className="py-3 px-4">Consensus Quorum</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-slate-500 font-medium"
                      >
                        Loading decisions...
                      </td>
                    </tr>
                  ) : filteredDecisions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-slate-500"
                      >
                        <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-700 text-sm">
                          No decisions recorded matching search filters
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredDecisions.map((dec) => (
                      <tr
                        key={dec.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs wrap-break-word">
                          <span className="wrap-break-word line-clamp-2">{dec.planName}</span>
                          <div className="text-[10px] text-slate-400 font-normal mt-0.5 wrap-break-word line-clamp-2">
                            {dec.subtitle}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-800 wrap-break-word max-w-44">
                          {dec.project}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                              dec.category === "GOODS"
                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                : dec.category === "CONSULTANCY"
                                  ? "bg-purple-50 text-purple-700 border-purple-100"
                                  : "bg-amber-50 text-amber-700 border-amber-100"
                            }`}
                          >
                            {dec.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {dec.dateRecorded}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                              dec.decision === "Approved"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-rose-50 text-rose-700 border-rose-100"
                            }`}
                          >
                            {dec.decision === "Approved"
                              ? "✓ Approved"
                              : "✗ Rejected"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-100 rounded-full h-1">
                              <div
                                className="bg-emerald-500 h-full rounded-full"
                                style={{ width: `${dec.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-[10px] text-slate-500 font-semibold whitespace-nowrap">
                              {dec.progressText}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => setSelectedDecision(dec)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A3C2F] text-white hover:bg-[#072b22] transition-colors cursor-pointer text-[10px] font-bold"
                          >
                            Inspect details
                          </button>
                        </td>
                      </tr>
                    ))
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

"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { fetchPlans, type BackendPlan } from "@/lib/plansApi";
import { fetchProjects, type BackendProject } from "@/lib/projectsApi";
import {
  fetchLookups,
  fetchOfficers,
  type LookupItem,
  type OfficerUserItem,
} from "@/lib/lookupsApi";
import {
  downloadAnnualProcurementPlanReport,
  downloadPlanVsActualReport,
  downloadProcurementStepsReport,
  downloadDelayedProcurementReport,
  downloadMonthlySummaryReport,
  downloadContractPaymentReport,
  downloadDetailedProcurementReport,
  downloadProjectOfficerSummaryReport,
} from "@/lib/reportsApi";
import {
  type AnnualPlanReportRow,
  type PlanVsActualReportRow,
  type DelayedProcurementRow,
} from "../reportsData";
import {
  type ReportType,
  type ReportFilterState,
  DEFAULT_FILTERS,
} from "../types";
import { ShieldAlert, LogOut } from "lucide-react";
import { ReportTypeSelector } from "./ReportTypeSelector";
import { ReportFiltersPanel } from "./ReportFiltersPanel";
import { ReportTables } from "./ReportTables";

export function ReportsView() {
  const [activeReport, setActiveReport] = useState<ReportType>("annual-plan");
  const [backendPlans, setBackendPlans] = useState<BackendPlan[]>([]);
  const [backendProjects, setBackendProjects] = useState<BackendProject[]>([]);
  const [fundingSources, setFundingSources] = useState<LookupItem[]>([]);
  const [methods, setMethods] = useState<LookupItem[]>([]);
  const [officers, setOfficers] = useState<OfficerUserItem[]>([]);
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // Per-report filter state persistence
  const [savedFiltersPerReport, setSavedFiltersPerReport] = useState<
    Partial<Record<ReportType, ReportFilterState>>
  >({
    "annual-plan": { ...DEFAULT_FILTERS },
  });

  const [filters, setFilters] = useState<ReportFilterState>({
    ...DEFAULT_FILTERS,
  });
  const [isApplying, setIsApplying] = useState(false);
  const [appliedFeedback, setAppliedFeedback] = useState(false);

  // Switch report type & restore last used filters
  const handleSelectReport = (newReport: ReportType) => {
    setActiveReport(newReport);
    const saved = savedFiltersPerReport[newReport] || { ...DEFAULT_FILTERS };
    setFilters(saved);
    setSavedFiltersPerReport((prev) => ({ ...prev, [newReport]: saved }));
  };

  const updateFilter = <K extends keyof ReportFilterState>(
    key: K,
    value: ReportFilterState[K],
  ) => {
    setFilters((prev) => {
      const updated = { ...prev, [key]: value };
      setSavedFiltersPerReport((s) => ({ ...s, [activeReport]: updated }));
      return updated;
    });
  };

  const triggerApplyFeedback = () => {
    setIsApplying(true);
    setAppliedFeedback(false);
    setTimeout(() => {
      setIsApplying(false);
      setAppliedFeedback(true);
      setTimeout(() => setAppliedFeedback(false), 1800);
    }, 250);
  };

  const handleResetFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
    setSavedFiltersPerReport((prev) => ({
      ...prev,
      [activeReport]: { ...DEFAULT_FILTERS },
    }));
    triggerApplyFeedback();
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setCurrentTime(Date.now()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Fetch real backend metadata for live dropdowns & export matching
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [plans, projects, fsList, pmList, offList] = await Promise.all([
          fetchPlans(),
          fetchProjects(),
          fetchLookups("FUNDING_SOURCE"),
          fetchLookups("PROCUREMENT_METHOD"),
          fetchOfficers(),
        ]);
        if (isMounted) {
          setBackendPlans(plans || []);
          setBackendProjects(projects || []);
          setFundingSources(fsList || []);
          setMethods(pmList || []);
          setOfficers(offList || []);
        }
      } catch (err: any) {
        console.warn("ReportsView loadData error:", err);
        if (
          err?.status === 401 ||
          err?.message?.toLowerCase().includes("session") ||
          err?.message?.toLowerCase().includes("unauthorized")
        ) {
          setIsSessionExpired(true);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Dropdown options mapped with real IDs
  const projectOptions = useMemo(() => {
    const list = [{ value: "ALL", label: "All Projects" }];
    backendProjects.forEach((p) => {
      list.push({
        value: p.id,
        label: p.code ? `${p.code} — ${p.name}` : p.name,
      });
    });
    return list;
  }, [backendProjects]);

  const fundingSourceOptions = useMemo(() => {
    const list = [{ value: "ALL", label: "All Sources" }];
    fundingSources.forEach((fs) => {
      list.push({
        value: fs.id,
        label: fs.label || fs.code,
      });
    });
    return list;
  }, [fundingSources]);

  const methodOptions = useMemo(() => {
    const list = [{ value: "ALL", label: "All Methods" }];
    methods.forEach((m) => {
      list.push({
        value: m.id,
        label: m.label || m.code,
      });
    });
    return list;
  }, [methods]);

  const officerOptions = useMemo(() => {
    const list = [{ value: "ALL", label: "All Officers" }];
    officers.forEach((o) => {
      list.push({
        value: o.id,
        label: o.name || o.email,
      });
    });
    return list;
  }, [officers]);

  const categoryOptions = useMemo(
    () => [
      { value: "ALL", label: "All Categories" },
      { value: "GOODS", label: "Goods" },
      { value: "WORKS", label: "Works" },
      { value: "NON_CONSULTING", label: "Non-Consulting Services" },
      { value: "CONSULTANCY", label: "Consultancy Services" },
    ],
    [],
  );

  // Active Filter Count Calculation
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeReport === "annual-plan") {
      if (filters.efy !== "ALL") count++;
      if (filters.project !== "ALL") count++;
      if (filters.category !== "ALL") count++;
      if (filters.procurementMethod !== "ALL") count++;
      if (filters.fundingSource !== "ALL") count++;
      if (filters.planStatus !== "ALL") count++;
    } else if (activeReport === "plan-vs-actual") {
      if (filters.efy !== "ALL") count++;
      if (filters.project !== "ALL") count++;
      if (filters.fromDate !== "2025-07-08" || filters.toDate !== "2026-07-07")
        count++;
    } else if (activeReport === "procurement-step") {
      if (filters.project !== "ALL") count++;
      if (filters.marketApproach !== "ALL") count++;
      if (filters.reviewType !== "ALL") count++;
    } else if (activeReport === "delayed-procurement") {
      if (filters.project !== "ALL") count++;
      if (filters.delayRange !== "ALL") count++;
      if (filters.officer !== "ALL") count++;
    } else if (activeReport === "monthly-summary") {
      if (filters.efy !== "ALL") count++;
      if (filters.fundingType !== "ALL") count++;
      if (filters.currency !== "ETB") count++;
    } else if (activeReport === "contract-payment") {
      if (filters.project !== "ALL") count++;
      if (filters.contractStatus !== "ALL") count++;
      if (filters.region !== "ALL") count++;
    } else if (activeReport === "detailed-procurement") {
      if (filters.project !== "ALL") count++;
      if (filters.category !== "ALL") count++;
    } else if (activeReport === "project-officer") {
      if (filters.project !== "ALL") count++;
      if (filters.officer !== "ALL") count++;
    }
    return count;
  }, [activeReport, filters]);

  // Derived Preview Rows
  const annualPlanRows = useMemo(() => {
    let rows: AnnualPlanReportRow[] = [];
    if (backendPlans.length > 0) {
      for (const p of backendPlans) {
        for (const a of p.activities || []) {
          rows.push({
            id: a.id,
            projectCode: p.project?.code || "MOA",
            planName: p.title || "Procurement Plan",
            refNo: a.reference || a.id,
            description: a.description || "",
            category: (p as any).category || a.category || "Goods",
            method:
              a.procurementMethod?.label ||
              a.procurementMethod?.code ||
              "RFB - National",
            estimatedAmount: a.estimatedBudget || 0,
            currency: a.currency || "ETB",
            fundingSource:
              a.fundings?.[0]?.fundingSource ||
              "African Development Bank (AfDB)",
            region: p.organization || "Federal",
            officer:
              p.creator?.displayName || p.creator?.name || "Assigned Officer",
            status:
              p.status === "APPROVED"
                ? "Approved"
                : p.status === "SUBMITTED"
                  ? "Submitted"
                  : "Draft",
          });
        }
      }
    }

    if (filters.efy !== "ALL") {
      rows = rows.filter((r) => {
        const matchingPlan = backendPlans.find((p) =>
          p.activities?.some((a) => a.id === r.id),
        );
        return matchingPlan ? matchingPlan.budgetYear === filters.efy : true;
      });
    }
    if (filters.project !== "ALL") {
      rows = rows.filter((r) => {
        const matchingPlan = backendPlans.find((p) =>
          p.activities?.some((a) => a.id === r.id),
        );
        return matchingPlan?.projectId === filters.project;
      });
    }
    if (filters.category !== "ALL") {
      rows = rows.filter((r) =>
        r.category.toLowerCase().includes(filters.category.toLowerCase()),
      );
    }
    if (filters.procurementMethod !== "ALL") {
      rows = rows.filter((r) => {
        const matchingPlan = backendPlans.find((p) =>
          p.activities?.some((a) => a.id === r.id),
        );
        const matchingAct = matchingPlan?.activities?.find(
          (a) => a.id === r.id,
        );
        return matchingAct?.procurementMethodId === filters.procurementMethod;
      });
    }
    if (filters.fundingSource !== "ALL") {
      rows = rows.filter((r) => {
        const matchingPlan = backendPlans.find((p) =>
          p.activities?.some((a) => a.id === r.id),
        );
        const matchingAct = matchingPlan?.activities?.find(
          (a) => a.id === r.id,
        );
        return matchingAct?.fundings?.some(
          (f: any) => f.fundingSourceId === filters.fundingSource,
        );
      });
    }
    if (filters.planStatus !== "ALL") {
      rows = rows.filter((r) => {
        const matchingPlan = backendPlans.find((p) =>
          p.activities?.some((a) => a.id === r.id),
        );
        return matchingPlan?.status === filters.planStatus;
      });
    }
    return rows;
  }, [backendPlans, filters]);

  const planVsActualRows = useMemo(() => {
    let rows: PlanVsActualReportRow[] = [];
    if (backendPlans.length > 0) {
      for (const p of backendPlans) {
        for (const a of p.activities || []) {
          const stages = a.stages || [];
          const adv = stages.find(
            (s: any) =>
              s.stageType?.label?.toLowerCase().includes("advert") ||
              s.stageType?.label?.toLowerCase().includes("notice") ||
              s.sequence === 1,
          );
          const opn = stages.find(
            (s: any) =>
              s.stageType?.label?.toLowerCase().includes("opening") ||
              s.stageType?.label?.toLowerCase().includes("bid submission"),
          );
          const awd = stages.find(
            (s: any) =>
              s.stageType?.label?.toLowerCase().includes("award") ||
              s.stageType?.label?.toLowerCase().includes("evaluation"),
          );
          const sig = stages.find(
            (s: any) =>
              s.stageType?.label?.toLowerCase().includes("contract") ||
              s.stageType?.label?.toLowerCase().includes("sign"),
          );

          rows.push({
            id: a.id,
            refNo: a.reference || a.id,
            description: a.description || "",
            method:
              a.procurementMethod?.label || a.procurementMethod?.code || "RFB",
            plannedAdvertisingDate: adv?.plannedStartDate
              ? new Date(adv.plannedStartDate).toISOString().slice(0, 10)
              : "—",
            actualAdvertisingDate: adv?.actualStartDate
              ? new Date(adv.actualStartDate).toISOString().slice(0, 10)
              : "—",
            plannedOpeningDate: opn?.plannedStartDate
              ? new Date(opn.plannedStartDate).toISOString().slice(0, 10)
              : "—",
            actualOpeningDate: opn?.actualStartDate
              ? new Date(opn.actualStartDate).toISOString().slice(0, 10)
              : "—",
            plannedAwardDate: awd?.plannedStartDate
              ? new Date(awd.plannedStartDate).toISOString().slice(0, 10)
              : "—",
            actualAwardDate: awd?.actualStartDate
              ? new Date(awd.actualStartDate).toISOString().slice(0, 10)
              : "—",
            plannedSignatureDate: sig?.plannedStartDate
              ? new Date(sig.plannedStartDate).toISOString().slice(0, 10)
              : "—",
            actualSignatureDate: sig?.actualStartDate
              ? new Date(sig.actualStartDate).toISOString().slice(0, 10)
              : "—",
            status:
              a.status === "COMPLETED"
                ? "Signed"
                : a.status === "IN_PROGRESS"
                  ? "In Progress"
                  : "Not Started",
          });
        }
      }
    }
    return rows;
  }, [backendPlans]);

  const delayedProcurementRows = useMemo(() => {
    let rows: DelayedProcurementRow[] = [];
    if (backendPlans.length > 0) {
      for (const p of backendPlans) {
        for (const a of p.activities || []) {
          const stages = a.stages || [];
          for (const s of stages) {
            const isOverdue =
              s.currentTargetStartDate &&
              currentTime !== null &&
              new Date(s.currentTargetStartDate).getTime() < currentTime &&
              s.status !== "COMPLETED" &&
              !s.isNotApplicable;
            if (s.status === "DELAYED" || isOverdue) {
              const target = s.currentTargetStartDate
                ? new Date(s.currentTargetStartDate).toISOString().slice(0, 10)
                : "2026-08-01";
              const delayDays =
                s.currentTargetStartDate && currentTime !== null
                  ? Math.max(
                      1,
                      Math.floor(
                        (currentTime -
                          new Date(s.currentTargetStartDate).getTime()) /
                          (1000 * 60 * 60 * 24),
                      ),
                    )
                  : 14;
              const latestRev = (s.revisions || [])[
                (s.revisions || []).length - 1
              ];
              rows.push({
                id: `${a.id}-${s.id}`,
                refNo: a.reference || a.id,
                description: a.description || "",
                method:
                  a.procurementMethod?.label ||
                  a.procurementMethod?.code ||
                  "RFB",
                currentOverdueStage:
                  s.stageType?.label || (s as any).name || "Overdue Stage",
                effectiveTargetDate: target,
                actualOrCurrentDate: new Date().toISOString().slice(0, 10),
                delayDays,
                replanningReason:
                  latestRev?.reason ||
                  s.remarks ||
                  "Delay in evaluation completion",
                officer:
                  p.creator?.displayName ||
                  p.creator?.name ||
                  "Assigned Officer",
              });
            }
          }
        }
      }
    }
    return rows;
  }, [backendPlans, currentTime]);

  const handleExportExcel = async () => {
    setExportError(null);
    setIsExporting(true);
    try {
      switch (activeReport) {
        case "annual-plan":
          await downloadAnnualProcurementPlanReport({
            budgetYear:
              filters.efy && filters.efy !== "ALL" ? filters.efy : "2017 EFY",
            projectId: filters.project !== "ALL" ? filters.project : undefined,
            category: filters.category !== "ALL" ? filters.category : undefined,
            methodId:
              filters.procurementMethod !== "ALL"
                ? filters.procurementMethod
                : undefined,
            fundingSourceId:
              filters.fundingSource !== "ALL"
                ? filters.fundingSource
                : undefined,
            status:
              filters.planStatus !== "ALL" ? filters.planStatus : undefined,
          });
          break;

        case "plan-vs-actual":
          await downloadPlanVsActualReport({
            budgetYear: filters.efy !== "ALL" ? filters.efy : undefined,
            projectId: filters.project !== "ALL" ? filters.project : undefined,
            dateFrom: filters.fromDate,
            dateTo: filters.toDate,
          });
          break;

        case "procurement-step":
          await downloadProcurementStepsReport({
            projectId: filters.project !== "ALL" ? filters.project : undefined,
            marketApproach:
              filters.marketApproach !== "ALL"
                ? filters.marketApproach
                : undefined,
            reviewType:
              filters.reviewType !== "ALL" ? filters.reviewType : undefined,
          });
          break;

        case "delayed-procurement":
          await downloadDelayedProcurementReport({
            projectId: filters.project !== "ALL" ? filters.project : undefined,
            officerId: filters.officer !== "ALL" ? filters.officer : undefined,
            delayBucket:
              filters.delayRange !== "ALL"
                ? (filters.delayRange as "1-7" | "8-30" | "31-60" | "60+")
                : undefined,
          });
          break;

        case "monthly-summary":
          await downloadMonthlySummaryReport({
            year: Number(filters.efy),
            fundingSourceId:
              filters.fundingType !== "ALL" ? filters.fundingType : undefined,
          });
          break;

        case "contract-payment":
          await downloadContractPaymentReport({
            projectId: filters.project !== "ALL" ? filters.project : undefined,
            contractStatus:
              filters.contractStatus !== "ALL"
                ? filters.contractStatus
                : undefined,
            region: filters.region !== "ALL" ? filters.region : undefined,
          });
          break;

        case "detailed-procurement":
          await downloadDetailedProcurementReport({
            projectId: filters.project !== "ALL" ? filters.project : undefined,
            category: filters.category !== "ALL" ? filters.category : undefined,
          });
          break;

        case "project-officer":
          await downloadProjectOfficerSummaryReport({
            projectId: filters.project !== "ALL" ? filters.project : undefined,
            officerId: filters.officer !== "ALL" ? filters.officer : undefined,
          });
          break;
      }
    } catch (err: any) {
      console.error("Export failed:", err);
      if (
        err?.status === 401 ||
        err?.message?.toLowerCase().includes("session") ||
        err?.message?.toLowerCase().includes("unauthorized")
      ) {
        setIsSessionExpired(true);
        setExportError("Your session has ended. Please sign in again.");
      } else {
        setExportError(
          err instanceof Error ? err.message : "Failed to generate report",
        );
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200 pb-12 max-w-full overflow-hidden">
      {/* BREADCRUMB NAVIGATION */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs mb-1"
      >
        <Link
          href="/dashboard"
          className="text-slate-500 hover:text-slate-900 transition-colors"
        >
          Home
        </Link>
        <span className="text-slate-400 text-xs">›</span>
        <span className="font-bold text-[#0A3C2F]">Reports</span>
      </nav>

      {/* SESSION EXPIRED BANNER */}
      {isSessionExpired && (
        <div className="bg-amber-50/90 border border-amber-300 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Session Expired
              </h4>
              <p className="text-xs text-amber-800 font-medium">
                Your session has ended. Please sign in again to continue working
                with reports.
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-900 text-white hover:bg-amber-950 text-xs font-bold transition-all shadow-2xs whitespace-nowrap self-start sm:self-auto"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign In Again</span>
          </Link>
        </div>
      )}

      {/* TOP SECTION: Horizontal Report Type Selector & Export Button */}
      <ReportTypeSelector
        activeReport={activeReport}
        onSelectReport={handleSelectReport}
        onExport={handleExportExcel}
        isExporting={isExporting}
      />

      {/* Dynamic Filter Panel (Full Width) */}
      <ReportFiltersPanel
        activeReport={activeReport}
        filters={filters}
        onUpdateFilter={updateFilter}
        onApply={triggerApplyFeedback}
        onReset={handleResetFilters}
        onExport={handleExportExcel}
        isExporting={isExporting}
        exportError={exportError}
        isApplying={isApplying}
        appliedFeedback={appliedFeedback}
        activeFilterCount={activeFilterCount}
        projectOptions={projectOptions}
        fundingSourceOptions={fundingSourceOptions}
        methodOptions={methodOptions}
        officerOptions={officerOptions}
        categoryOptions={categoryOptions}
      />

      {/* Bottom Container: Full Width Data Output Tables */}
      <ReportTables
        activeReport={activeReport}
        annualPlanRows={annualPlanRows}
        planVsActualRows={planVsActualRows}
        delayedProcurementRows={delayedProcurementRows}
        contractPaymentRows={[]}
      />
    </div>
  );
}

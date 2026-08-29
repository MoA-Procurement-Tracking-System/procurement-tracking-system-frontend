"use client";

import { useState, useEffect, useMemo } from "react";
import { FileSpreadsheet, ChevronRight, Filter } from "lucide-react";
import Link from "next/link";
import { fetchPlans, type BackendPlan } from "@/lib/plansApi";
import { fetchProjects, type BackendProject } from "@/lib/projectsApi";
import {
  MOCK_ANNUAL_PLAN_REPORT,
  MOCK_PLAN_VS_ACTUAL_REPORT,
  MOCK_STEP_REPORT,
  MOCK_DELAYED_PROCUREMENT_REPORT,
  MOCK_MONTHLY_SUMMARY_REPORT,
  MOCK_CONTRACT_PAYMENT_REPORT,
  MOCK_DETAILED_PROCUREMENT_REPORT,
  MOCK_PROJECT_OFFICER_SUMMARY_REPORT,
  exportToExcelCSV,
  type AnnualPlanReportRow,
  type PlanVsActualReportRow,
  type DelayedProcurementRow,
} from "../reportsData";

type ReportType =
  | "annual-plan"
  | "plan-vs-actual"
  | "procurement-step"
  | "delayed-procurement"
  | "monthly-summary"
  | "contract-payment"
  | "detailed-procurement"
  | "project-officer";

export function ReportsView() {
  const [activeReport, setActiveReport] = useState<ReportType>("annual-plan");
  const [backendPlans, setBackendPlans] = useState<BackendPlan[]>([]);
  const [backendProjects, setBackendProjects] = useState<BackendProject[]>([]);
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setCurrentTime(Date.now()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [plans, projects] = await Promise.all([
          fetchPlans(),
          fetchProjects(),
        ]);
        if (isMounted) {
          setBackendPlans(plans || []);
          setBackendProjects(projects || []);
        }
      } catch (err) {
        console.warn("ReportsView loadData error:", err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const annualPlanRows = useMemo(() => {
    if (backendPlans.length === 0) return MOCK_ANNUAL_PLAN_REPORT;
    const rows: AnnualPlanReportRow[] = [];
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
            a.fundings?.[0]?.fundingSource || "African Development Bank (AfDB)",
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
    return rows.length > 0 ? rows : MOCK_ANNUAL_PLAN_REPORT;
  }, [backendPlans]);

  const planVsActualRows = useMemo(() => {
    if (backendPlans.length === 0) return MOCK_PLAN_VS_ACTUAL_REPORT;
    const rows: PlanVsActualReportRow[] = [];
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
    return rows.length > 0 ? rows : MOCK_PLAN_VS_ACTUAL_REPORT;
  }, [backendPlans]);

  const delayedProcurementRows = useMemo(() => {
    if (backendPlans.length === 0) return MOCK_DELAYED_PROCUREMENT_REPORT;
    const rows: DelayedProcurementRow[] = [];
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
            const delayDays = s.currentTargetStartDate && currentTime !== null
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
                p.creator?.displayName || p.creator?.name || "Assigned Officer",
            });
          }
        }
      }
    }
    return rows.length > 0 ? rows : MOCK_DELAYED_PROCUREMENT_REPORT;
  }, [backendPlans, currentTime]);

  // Dynamic Filters State
  const [efy, setEfy] = useState("2018");
  const [fromDate, setFromDate] = useState("2025-07-08");
  const [toDate, setToDate] = useState("2026-07-07");
  const [project, setProject] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [fundingSource, setFundingSource] = useState("ALL");
  const [fundingType, setFundingType] = useState("ALL");
  const [procurementMethod, setProcurementMethod] = useState("ALL");
  const [marketApproach, setMarketApproach] = useState("ALL");
  const [reviewType, setReviewType] = useState("ALL");
  const [planStatus, setPlanStatus] = useState("ALL");
  const [contractStatus, setContractStatus] = useState("ALL");
  const [officer, setOfficer] = useState("ALL");
  const [delayRange, setDelayRange] = useState("ALL");
  const [currency, setCurrency] = useState("ETB");
  const [region, setRegion] = useState("ALL");

  const handleExportExcel = () => {
    switch (activeReport) {
      case "annual-plan": {
        const headers = [
          "Project",
          "Plan Name",
          "Activity Ref",
          "Description",
          "Category",
          "Method",
          "Est Amount",
          "Currency",
          "Funding Source",
          "Region",
          "Officer",
          "Status",
        ];
        const rows = annualPlanRows.map((r) => [
          r.projectCode,
          r.planName,
          r.refNo,
          r.description,
          r.category,
          r.method,
          r.estimatedAmount,
          r.currency,
          r.fundingSource,
          r.region,
          r.officer,
          r.status,
        ]);
        exportToExcelCSV("MoA_Annual_Procurement_Plan_Report", headers, rows);
        break;
      }
      case "plan-vs-actual": {
        const headers = [
          "Activity Ref",
          "Description",
          "Method",
          "Plan Advertising",
          "Actual Advertising",
          "Plan Opening",
          "Actual Opening",
          "Plan Award",
          "Actual Award",
          "Plan Signature",
          "Actual Signature",
          "Status",
        ];
        const rows = planVsActualRows.map((r) => [
          r.refNo,
          r.description,
          r.method,
          r.plannedAdvertisingDate,
          r.actualAdvertisingDate,
          r.plannedOpeningDate,
          r.actualOpeningDate,
          r.plannedAwardDate,
          r.actualAwardDate,
          r.plannedSignatureDate,
          r.actualSignatureDate,
          r.status,
        ]);
        exportToExcelCSV("MoA_Plan_vs_Actual_Report", headers, rows);
        break;
      }
      case "procurement-step": {
        const headers = [
          "Activity Ref",
          "Description",
          "Category",
          "Method",
          "Market Approach",
          "Review Type",
          "Process Status",
          "Activity Status",
          "Est Amount",
          "Contract Amount",
        ];
        const rows = MOCK_STEP_REPORT.map((r) => [
          r.refNo,
          r.description,
          r.category,
          r.method,
          r.marketApproach,
          r.reviewType,
          r.processStatus,
          r.activityStatus,
          r.estimatedAmount,
          r.signedContractAmount,
        ]);
        exportToExcelCSV("MoA_STEP_Procurement_Report", headers, rows);
        break;
      }
      case "delayed-procurement": {
        const headers = [
          "Activity Ref",
          "Description",
          "Method",
          "Overdue Stage",
          "Target Date",
          "Current Date",
          "Delay Days",
          "Replanning Reason",
          "Officer",
        ];
        const rows = delayedProcurementRows.map((r) => [
          r.refNo,
          r.description,
          r.method,
          r.currentOverdueStage,
          r.effectiveTargetDate,
          r.actualOrCurrentDate,
          r.delayDays,
          r.replanningReason,
          r.officer,
        ]);
        exportToExcelCSV(
          "MoA_Delayed_Procurement_Action_Report",
          headers,
          rows,
        );
        break;
      }
      case "monthly-summary": {
        const headers = [
          "Month / Year",
          "Category",
          "Method",
          "Funding Type",
          "Package Count",
          "Total Amount (ETB)",
        ];
        const rows = MOCK_MONTHLY_SUMMARY_REPORT.map((r) => [
          r.monthYear,
          r.category,
          r.method,
          r.fundingType,
          r.packageCount,
          r.totalAmountETB,
        ]);
        exportToExcelCSV("MoA_Monthly_Quarterly_Summary_Report", headers, rows);
        break;
      }
      case "contract-payment": {
        const headers = [
          "Contract No",
          "Activity Ref",
          "Supplier / Contractor",
          "Region",
          "Original Amount",
          "VAT Amount",
          "Final Amount",
          "Total Paid",
          "Remaining Balance",
          "Status",
        ];
        const rows = MOCK_CONTRACT_PAYMENT_REPORT.map((r) => [
          r.contractNo,
          r.refNo,
          r.supplierName,
          r.region,
          r.originalContractAmount,
          r.vatAmount,
          r.finalContractAmount,
          r.totalPaidAmount,
          r.remainingBalance,
          r.contractStatus,
        ]);
        exportToExcelCSV("MoA_Contract_and_Payment_Report", headers, rows);
        break;
      }
      case "detailed-procurement": {
        const headers = [
          "Activity Ref",
          "Description",
          "Category",
          "Method",
          "Winner Supplier",
          "Awarded Amount",
          "Currency",
          "Funding Source",
          "Completion Date",
          "Status",
        ];
        const rows = MOCK_DETAILED_PROCUREMENT_REPORT.map((r) => [
          r.refNo,
          r.description,
          r.category,
          r.method,
          r.winnerSupplier,
          r.awardedAmount,
          r.currency,
          r.fundingSource,
          r.completionDate,
          r.status,
        ]);
        exportToExcelCSV("MoA_Detailed_Procurement_Report", headers, rows);
        break;
      }
      case "project-officer": {
        const headers = [
          "Project Code",
          "Assigned Officer",
          "Total Plans",
          "Total Activities",
          "Total Budget (ETB)",
          "Approved Count",
          "Delayed Count",
        ];
        const rows = MOCK_PROJECT_OFFICER_SUMMARY_REPORT.map((r) => [
          r.projectCode,
          r.officerName,
          r.totalPlans,
          r.totalActivities,
          r.totalBudgetETB,
          r.approvedCount,
          r.delayedCount,
        ]);
        exportToExcelCSV("MoA_Project_Officer_Summary_Report", headers, rows);
        break;
      }
    }
  };

  const reportList: { id: ReportType; label: string }[] = [
    { id: "annual-plan", label: "Annual Procurement Plan" },
    { id: "plan-vs-actual", label: "Plan vs Actual" },
    { id: "procurement-step", label: "Procurement Step" },
    { id: "delayed-procurement", label: "Delayed Procurement" },
    { id: "monthly-summary", label: "Monthly Summary" },
    { id: "contract-payment", label: "Contract & Payment" },
    { id: "detailed-procurement", label: "Detailed Procurement" },
    { id: "project-officer", label: "Project & Officer Summary" },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-12 max-w-full overflow-hidden">
      {/* BREADCRUMB NAVIGATION */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
        <Link
          href="/dashboard"
          className="text-slate-500 hover:text-slate-900 transition-colors"
        >
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="font-bold text-[#0A3C2F]">Reports</span>
      </nav>

      {/* MAIN TWO-COLUMN RESPONSIVE LAYOUT */}
      <div className="flex flex-col lg:flex-row items-start gap-5 max-w-full overflow-hidden">
        {/* LEFT REPORTS SIDEBAR */}
        <aside className="w-full lg:w-56 shrink-0 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
            System Reports
          </div>
          {reportList.map((item) => {
            const isActive = activeReport === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveReport(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer text-left ${
                  isActive
                    ? "border-l-4 border-l-[#0A3C2F] bg-slate-50 text-[#0A3C2F] font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <ChevronRight className="h-3.5 w-3.5 text-[#0A3C2F]" />
                )}
              </button>
            );
          })}
        </aside>

        {/* RIGHT WORKSPACE: DYNAMIC FILTERS & OUTPUT DATA TABLES */}
        <main className="flex-1 min-w-0 w-full max-w-full overflow-hidden space-y-5">
          {/* DYNAMIC FILTER PANEL BASED ON ACTIVE REPORT TYPE */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#0A3C2F]" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Report Filters —{" "}
                  {reportList.find((r) => r.id === activeReport)?.label}
                </h3>
              </div>

              {/* Export to Excel Button */}
              <button
                onClick={handleExportExcel}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0A3C2F] text-white hover:bg-[#072b22] text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4 text-[#A3E635]" />
                <span>Export to Excel</span>
              </button>
            </div>

            {/* DYNAMIC FILTER CONTROLS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
              {/* 1. ANNUAL PROCUREMENT PLAN FILTERS */}
              {activeReport === "annual-plan" && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      EFY
                    </label>
                    <select
                      value={efy}
                      onChange={(e) => setEfy(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 bg-white outline-none"
                    >
                      <option value="2018">2018 EFY (2025/2026)</option>
                      <option value="2017">2017 EFY (2024/2025)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Project
                    </label>
                    <select
                      value={project}
                      onChange={(e) => setProject(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 bg-white outline-none"
                    >
                      <option value="ALL">All Projects</option>
                      <option value="BREFONS">BREFONS</option>
                      <option value="DRIVE">DRIVE</option>
                      <option value="FSRP">FSRP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 bg-white outline-none"
                    >
                      <option value="ALL">All Categories</option>
                      <option value="Goods">Goods</option>
                      <option value="Works">Works</option>
                      <option value="Non-Consulting Services">
                        Non-Consulting Services
                      </option>
                      <option value="Consultancy Services">
                        Consultancy Services
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Procurement Method
                    </label>
                    <select
                      value={procurementMethod}
                      onChange={(e) => setProcurementMethod(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 bg-white outline-none"
                    >
                      <option value="ALL">All Methods</option>
                      <option value="RFB - National">RFB - National</option>
                      <option value="RFQ / Shopping">RFQ / Shopping</option>
                      <option value="QCBS">QCBS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Funding Source
                    </label>
                    <select
                      value={fundingSource}
                      onChange={(e) => setFundingSource(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 bg-white outline-none"
                    >
                      <option value="ALL">All Sources</option>
                      <option value="Treasury">Treasury</option>
                      <option value="World Bank">World Bank</option>
                      <option value="AfDB">AfDB</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Plan Status
                    </label>
                    <select
                      value={planStatus}
                      onChange={(e) => setPlanStatus(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 bg-white outline-none"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="Draft">Draft</option>
                      <option value="Submitted to Director">
                        Submitted to Director
                      </option>
                      <option value="Committee Review">Committee Review</option>
                      <option value="Approved">Approved</option>
                    </select>
                  </div>
                </>
              )}

              {/* 2. PLAN VS ACTUAL FILTERS */}
              {activeReport === "plan-vs-actual" && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      EFY
                    </label>
                    <select
                      value={efy}
                      onChange={(e) => setEfy(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 bg-white outline-none"
                    >
                      <option value="2018">2018 EFY (2025/2026)</option>
                      <option value="2017">2017 EFY (2024/2025)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Date Range (Gregorian)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-2.5 py-1 font-semibold text-slate-800 bg-white outline-none"
                      />
                      <span className="text-slate-400 font-bold">-</span>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-2.5 py-1 font-semibold text-slate-800 bg-white outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Project
                    </label>
                    <select
                      value={project}
                      onChange={(e) => setProject(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 bg-white outline-none"
                    >
                      <option value="ALL">All Projects</option>
                      <option value="BREFONS">BREFONS</option>
                      <option value="DRIVE">DRIVE</option>
                    </select>
                  </div>
                </>
              )}

              {/* 3. PROCUREMENT STEP FILTERS */}
              {activeReport === "procurement-step" && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Project
                    </label>
                    <select
                      value={project}
                      onChange={(e) => setProject(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 bg-white outline-none"
                    >
                      <option value="ALL">All Projects</option>
                      <option value="BREFONS">BREFONS</option>
                      <option value="DRIVE">DRIVE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Market Approach
                    </label>
                    <select
                      value={marketApproach}
                      onChange={(e) => setMarketApproach(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 bg-white outline-none"
                    >
                      <option value="ALL">All Approaches</option>
                      <option value="Open - National">Open - National</option>
                      <option value="Open - International">
                        Open - International
                      </option>
                      <option value="Limited">Limited</option>
                      <option value="Direct">Direct</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Review Type
                    </label>
                    <select
                      value={reviewType}
                      onChange={(e) => setReviewType(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 bg-white outline-none"
                    >
                      <option value="ALL">All Review Types</option>
                      <option value="Prior">Prior Review</option>
                      <option value="Post">Post Review</option>
                    </select>
                  </div>
                </>
              )}

              {/* 4. DELAYED PROCUREMENT FILTERS */}
              {activeReport === "delayed-procurement" && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Project
                    </label>
                    <select
                      value={project}
                      onChange={(e) => setProject(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 bg-white outline-none"
                    >
                      <option value="ALL">All Projects</option>
                      <option value="BREFONS">BREFONS</option>
                      <option value="DRIVE">DRIVE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Delay Threshold
                    </label>
                    <select
                      value={delayRange}
                      onChange={(e) => setDelayRange(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 bg-white outline-none"
                    >
                      <option value="ALL">All Overdue Items</option>
                      <option value="30">1 - 30 Days Overdue</option>
                      <option value="90">31 - 90 Days Overdue</option>
                      <option value="90+">&gt; 90 Days Overdue</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Assigned Officer
                    </label>
                    <select
                      value={officer}
                      onChange={(e) => setOfficer(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 bg-white outline-none"
                    >
                      <option value="ALL">All Officers</option>
                      <option value="Taddese Worku">Taddese Worku</option>
                      <option value="Amina Hussein">Amina Hussein</option>
                      <option value="Bekele Megersa">Bekele Megersa</option>
                    </select>
                  </div>
                </>
              )}

              {/* 5. MONTHLY SUMMARY FILTERS */}
              {activeReport === "monthly-summary" && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      EFY
                    </label>
                    <select
                      value={efy}
                      onChange={(e) => setEfy(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 bg-white outline-none"
                    >
                      <option value="2018">2018 EFY (2025/2026)</option>
                      <option value="2017">2017 EFY (2024/2025)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Funding Type
                    </label>
                    <select
                      value={fundingType}
                      onChange={(e) => setFundingType(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 bg-white outline-none"
                    >
                      <option value="ALL">All Funding Types</option>
                      <option value="Treasury">Treasury</option>
                      <option value="Loan">Loan</option>
                      <option value="Grant">Grant</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Currency Output
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 bg-white outline-none"
                    >
                      <option value="ETB">ETB (Ethiopian Birr)</option>
                      <option value="USD">USD (US Dollar)</option>
                      <option value="UA">UA (AfDB Unit of Account)</option>
                    </select>
                  </div>
                </>
              )}

              {/* 6. CONTRACT & PAYMENT FILTERS */}
              {activeReport === "contract-payment" && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Project
                    </label>
                    <select
                      value={project}
                      onChange={(e) => setProject(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 bg-white outline-none"
                    >
                      <option value="ALL">All Projects</option>
                      <option value="BREFONS">BREFONS</option>
                      <option value="DRIVE">DRIVE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Contract Status
                    </label>
                    <select
                      value={contractStatus}
                      onChange={(e) => setContractStatus(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 bg-white outline-none"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="Active">Active / In Execution</option>
                      <option value="Completed">Completed</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Region
                    </label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 bg-white outline-none"
                    >
                      <option value="ALL">All Regions</option>
                      <option value="Federal">Federal / FPCU</option>
                      <option value="Oromia">Oromia</option>
                      <option value="Somali">Somali</option>
                    </select>
                  </div>
                </>
              )}

              {/* 7. DETAILED PROCUREMENT FILTERS */}
              {activeReport === "detailed-procurement" && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Project
                    </label>
                    <select
                      value={project}
                      onChange={(e) => setProject(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 bg-white outline-none"
                    >
                      <option value="ALL">All Projects</option>
                      <option value="BREFONS">BREFONS</option>
                      <option value="DRIVE">DRIVE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 bg-white outline-none"
                    >
                      <option value="ALL">All Categories</option>
                      <option value="Goods">Goods</option>
                      <option value="Works">Works</option>
                    </select>
                  </div>
                </>
              )}

              {/* 8. PROJECT & OFFICER SUMMARY FILTERS */}
              {activeReport === "project-officer" && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Project
                    </label>
                    <select
                      value={project}
                      onChange={(e) => setProject(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 bg-white outline-none"
                    >
                      <option value="ALL">All Projects</option>
                      <option value="BREFONS">BREFONS</option>
                      <option value="DRIVE">DRIVE</option>
                      <option value="FSRP">FSRP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Assigned Officer
                    </label>
                    <select
                      value={officer}
                      onChange={(e) => setOfficer(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 font-semibold text-slate-800 bg-white outline-none"
                    >
                      <option value="ALL">All Officers</option>
                      <option value="Taddese Worku">Taddese Worku</option>
                      <option value="Amina Hussein">Amina Hussein</option>
                      <option value="Bekele Megersa">Bekele Megersa</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* REPORT DATA OUTPUT TABLE CONTAINER */}
          <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden max-w-full">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">
                {reportList.find((r) => r.id === activeReport)?.label} Output
              </h4>
              <span className="text-xs font-semibold text-slate-500">
                Displaying filtered results
              </span>
            </div>

            <div className="overflow-x-auto w-full max-w-full">
              {activeReport === "annual-plan" && (
                <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                  <thead>
                    <tr className="bg-[#0A3C2F] text-white text-[11px] font-extrabold uppercase">
                      <th className="py-3 px-3">Project</th>
                      <th className="py-3 px-3">Plan Name</th>
                      <th className="py-3 px-3">Activity Ref</th>
                      <th className="py-3 px-3">Description</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Method</th>
                      <th className="py-3 px-3 font-mono">Est Amount</th>
                      <th className="py-3 px-3">Funding Source</th>
                      <th className="py-3 px-3">Officer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {annualPlanRows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#0A3C2F]">
                          {row.projectCode}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {row.planName}
                        </td>
                        <td className="py-2.5 px-3 font-mono">{row.refNo}</td>
                        <td className="py-2.5 px-3">{row.description}</td>
                        <td className="py-2.5 px-3 font-semibold">
                          {row.category}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#0A3C2F]">
                          {row.method}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {row.currency} {row.estimatedAmount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3">{row.fundingSource}</td>
                        <td className="py-2.5 px-3 font-medium">
                          {row.officer}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeReport === "plan-vs-actual" && (
                <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                  <thead>
                    <tr className="bg-[#0A3C2F] text-white text-[11px] font-extrabold uppercase">
                      <th className="py-3 px-3">Activity Ref</th>
                      <th className="py-3 px-3">Description</th>
                      <th className="py-3 px-3">Method</th>
                      <th className="py-3 px-3 font-mono">Plan Advert</th>
                      <th className="py-3 px-3 font-mono">Actual Advert</th>
                      <th className="py-3 px-3 font-mono">Plan Award</th>
                      <th className="py-3 px-3 font-mono">Actual Award</th>
                      <th className="py-3 px-3 font-mono">Plan Signed</th>
                      <th className="py-3 px-3 font-mono">Actual Signed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {planVsActualRows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#0A3C2F]">
                          {row.refNo}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {row.description}
                        </td>
                        <td className="py-2.5 px-3 font-semibold">
                          {row.method}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">
                          {row.plannedAdvertisingDate}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                          {row.actualAdvertisingDate}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">
                          {row.plannedAwardDate}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                          {row.actualAwardDate}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">
                          {row.plannedSignatureDate}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                          {row.actualSignatureDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeReport === "delayed-procurement" && (
                <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                  <thead>
                    <tr className="bg-[#0A3C2F] text-white text-[11px] font-extrabold uppercase">
                      <th className="py-3 px-3">Activity Ref</th>
                      <th className="py-3 px-3">Description</th>
                      <th className="py-3 px-3">Method</th>
                      <th className="py-3 px-3">Current Overdue Stage</th>
                      <th className="py-3 px-3 font-mono">Target Date</th>
                      <th className="py-3 px-3 font-mono">Delay Days</th>
                      <th className="py-3 px-3">Replanning Reason</th>
                      <th className="py-3 px-3">Officer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {delayedProcurementRows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#0A3C2F]">
                          {row.refNo}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {row.description}
                        </td>
                        <td className="py-2.5 px-3 font-semibold">
                          {row.method}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-rose-800">
                          {row.currentOverdueStage}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">
                          {row.effectiveTargetDate}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-extrabold text-rose-700">
                          {row.delayDays} Days
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 italic">
                          &quot;{row.replanningReason}&quot;
                        </td>
                        <td className="py-2.5 px-3 font-medium">
                          {row.officer}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeReport === "contract-payment" && (
                <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                  <thead>
                    <tr className="bg-[#0A3C2F] text-white text-[11px] font-extrabold uppercase">
                      <th className="py-3 px-3">Contract No</th>
                      <th className="py-3 px-3">Activity Ref</th>
                      <th className="py-3 px-3">Supplier / Contractor</th>
                      <th className="py-3 px-3 font-mono">Original Amount</th>
                      <th className="py-3 px-3 font-mono">VAT (15%)</th>
                      <th className="py-3 px-3 font-mono">Final Amount</th>
                      <th className="py-3 px-3 font-mono">Total Paid</th>
                      <th className="py-3 px-3 font-mono">Remaining Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {MOCK_CONTRACT_PAYMENT_REPORT.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {row.contractNo}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#0A3C2F]">
                          {row.refNo}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {row.supplierName}
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          {row.originalContractAmount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">
                          {row.vatAmount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {row.finalContractAmount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-extrabold text-emerald-700">
                          {row.totalPaidAmount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-extrabold text-slate-950">
                          {row.remainingBalance.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {(activeReport === "procurement-step" ||
                activeReport === "monthly-summary" ||
                activeReport === "detailed-procurement" ||
                activeReport === "project-officer") && (
                <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                  <thead>
                    <tr className="bg-[#0A3C2F] text-white text-[11px] font-extrabold uppercase">
                      <th className="py-3 px-3">Item Ref / Code</th>
                      <th className="py-3 px-3">Description / Scope</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Method</th>
                      <th className="py-3 px-3 font-mono">Amount (ETB)</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {MOCK_ANNUAL_PLAN_REPORT.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#0A3C2F]">
                          {row.refNo}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {row.description}
                        </td>
                        <td className="py-2.5 px-3 font-semibold">
                          {row.category}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#0A3C2F]">
                          {row.method}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {row.currency} {row.estimatedAmount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-extrabold text-emerald-700">
                          {row.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

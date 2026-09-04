"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronsRight,
  FileText,
  AlertCircle,
  CircleDollarSign,
  TrendingUp,
} from "lucide-react";
import type { AuthUser } from "@/lib/authTypes";
import { fetchProjects, type BackendProject } from "@/lib/projectsApi";
import { fetchPlans, type BackendPlan } from "@/lib/plansApi";
import { fetchContracts, type BackendContract } from "@/lib/contractsApi";
import type {
  DirectorPlan,
  CriticalDelay,
  PipelineStageVolume,
  DirectorateHealthMetrics,
  FinancialCapitalSummary,
} from "./directorData";

function formatETB(amount: number | string): string {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat("en-US").format(Math.round(num));
}

function formatCompactM(amount: number | string): string {
  const num = Number(amount) || 0;
  if (Math.abs(num) >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B ETB`;
  }
  return `${(num / 1_000_000).toFixed(1)}M ETB`;
}

function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return "recently";
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "today";
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  } catch {
    return "recently";
  }
}

export function DirectorDashboard({ user: _user }: { user: AuthUser }) {
  const [projects, setProjects] = useState<BackendProject[]>([]);
  const [plans, setPlans] = useState<BackendPlan[]>([]);
  const [contracts, setContracts] = useState<BackendContract[]>([]);
  const [_loading, setLoading] = useState(true);

  // Filter States matching mockup
  const [selectedFiscalYear, setSelectedFiscalYear] = useState("2017 EFY");
  const [selectedSector, setSelectedSector] = useState("All Sectors");
  const [selectedProject, setSelectedProject] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        const [projRes, planRes, contractRes] = await Promise.all([
          fetchProjects(),
          fetchPlans(),
          fetchContracts(),
        ]);
        if (isMounted) {
          setProjects(projRes || []);
          setPlans(planRes || []);
          setContracts(contractRes || []);
        }
      } catch (err) {
        console.warn("DirectorDashboard load error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute available sectors from live projects
  const availableSectors = useMemo(() => {
    const sectorSet = new Set<string>();
    projects.forEach((p) => {
      if (p.sector?.label) sectorSet.add(p.sector.label);
    });
    const standardSectors = [
      "Agriculture Development",
      "Livestock & Pastoral",
      "Natural Resources",
      "Institutional Support",
      "Irrigation & Drainage",
    ];
    standardSectors.forEach((s) => sectorSet.add(s));
    return Array.from(sectorSet);
  }, [projects]);

  // Project options list
  const availableProjects = useMemo(() => {
    if (projects.length > 0) {
      return projects.map((p) => ({
        id: p.id,
        name: p.name || (p as any).title || "Project",
      }));
    }
    return [];
  }, [projects]);

  // Filter projects based on sector
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (
        selectedSector !== "All Sectors" &&
        p.sector?.label !== selectedSector &&
        p.name !== selectedSector
      ) {
        return false;
      }
      return true;
    });
  }, [projects, selectedSector]);

  // Top KPI Metric: Total Projects
  const totalProjectsCount = filteredProjects.length;

  // Filter plans based on selected fiscal year, sector, project, and status
  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      if (selectedFiscalYear !== "All Fiscal Years") {
        const yr = selectedFiscalYear.replace(/[^0-9]/g, "");
        const is2017 = yr === "2017";
        const is2016 = yr === "2016";
        const matchesYear =
          !p.budgetYear ||
          p.budgetYear.includes(yr) ||
          (is2017 &&
            (p.budgetYear.includes("2024") ||
              p.budgetYear.includes("2025") ||
              p.budgetYear.includes("2017"))) ||
          (is2016 &&
            (p.budgetYear.includes("2023") ||
              p.budgetYear.includes("2024") ||
              p.budgetYear.includes("2016")));
        if (!matchesYear) {
          return false;
        }
      }
      if (selectedSector !== "All Sectors") {
        const planSector = (
          (p.project as any)?.sector?.label || ""
        ).toLowerCase();
        const projName = (
          p.project?.name ||
          p.organization ||
          ""
        ).toLowerCase();
        const targetSector = selectedSector.toLowerCase();
        if (
          !planSector.includes(targetSector) &&
          !targetSector.includes(planSector) &&
          !projName.includes(targetSector)
        ) {
          return false;
        }
      }
      if (selectedProject !== "ALL") {
        const selectedProj = availableProjects.find(
          (proj) => proj.id === selectedProject,
        );
        const projName = selectedProj
          ? selectedProj.name.toLowerCase()
          : selectedProject.toLowerCase();
        const planProjName = (
          p.project?.name ||
          p.organization ||
          ""
        ).toLowerCase();
        if (
          p.project?.id !== selectedProject &&
          p.projectId !== selectedProject &&
          !planProjName.includes(projName) &&
          !projName.includes(planProjName)
        ) {
          return false;
        }
      }
      if (selectedStatus !== "ALL") {
        if (selectedStatus === "Awaiting Review") {
          const isAwaiting =
            p.status === "SUBMITTED" ||
            p.status === "PENDING_REVIEW" ||
            p.status === "UPDATE_REQUESTED" ||
            (p as any).status === "Submitted to Director";
          if (!isAwaiting) return false;
        } else if (selectedStatus === "In Progress") {
          const isInProgress =
            p.status === "IN_PROGRESS" ||
            p.status === "DRAFT" ||
            p.status === "WITH_COMMITTEE";
          if (!isInProgress) return false;
        } else if (selectedStatus === "Delayed") {
          if (p.status !== "DELAYED") return false;
        } else if (selectedStatus === "Approved") {
          if (p.status !== "APPROVED") return false;
        }
      }
      return true;
    });
  }, [
    plans,
    selectedFiscalYear,
    selectedSector,
    selectedProject,
    selectedStatus,
    availableProjects,
  ]);

  // Top KPI Metric: Awaiting Review Plans
  const pendingPlansLive: DirectorPlan[] = useMemo(() => {
    return filteredPlans
      .filter(
        (p) =>
          p.status === "SUBMITTED" ||
          p.status === "PENDING_REVIEW" ||
          p.status === "UPDATE_REQUESTED" ||
          (p as any).status === "Submitted to Director",
      )
      .map((p) => ({
        id: p.id,
        title: p.title || "Procurement Plan",
        directorate: p.project?.name || p.organization || "—",
        submittedBy:
          p.creator?.displayName || p.creator?.name || "Assigned Officer",
        submissionDate: formatRelativeTime(p.createdAt),
        status: "Awaiting Review" as const,
        totalActivitiesCount: p.activities?.length || 0,
        estimatedBudgetETB: (p.activities || []).reduce((sum, a) => {
          const budget = Number(a.estimatedBudget) || 0;
          const rate = a.currency === "USD" ? 125 : 1;
          return sum + budget * rate;
        }, 0),
        description: p.description || "",
        activities: [],
      }));
  }, [filteredPlans]);

  const awaitingReviewCount = pendingPlansLive.length;

  // Top KPI Metric: Committee Progress Plans
  const committeePlansCount = useMemo(() => {
    return filteredPlans.filter(
      (p) =>
        p.status === "WITH_COMMITTEE" ||
        p.status === "UNDER_COMMITTEE_REVIEW" ||
        (p as any).status === "Committee Review",
    ).length;
  }, [filteredPlans]);

  // Critical Delays (Live activities with overdue stages > 7 days)
  const criticalDelaysLive: CriticalDelay[] = useMemo(() => {
    const delays: CriticalDelay[] = [];
    const now = Date.now();

    for (const plan of filteredPlans) {
      for (const act of plan.activities || []) {
        const delayedStage = (act.stages || []).find((s: any) => {
          if (s.isNotApplicable || s.status === "COMPLETED") return false;
          if (s.status === "DELAYED") return true;
          const deadline = s.currentTargetEndDate || s.plannedEndDate;
          if (deadline && new Date(deadline).getTime() < now) {
            return true;
          }
          return false;
        });

        if (act.status === "DELAYED" || delayedStage) {
          const deadline =
            delayedStage?.currentTargetEndDate ||
            delayedStage?.plannedEndDate ||
            plan.createdAt;
          const daysOverdue = deadline
            ? Math.max(
                1,
                Math.round(
                  (now - new Date(deadline).getTime()) / (1000 * 60 * 60 * 24),
                ),
              )
            : 0;

          const stageLabel =
            delayedStage?.stageType?.label ||
            (delayedStage as any)?.name ||
            "Delayed Stage";

          delays.push({
            id: act.id,
            activityTitle: act.description || "Procurement Activity",
            fullTitle: act.description || "Procurement Activity",
            projectName: plan.project?.name || plan.title || "Project",
            directorate: plan.project?.name || plan.organization || "—",
            delayDetail: stageLabel,
            stageName: stageLabel,
            daysOverdue,
            status: "Delayed",
            assignedOfficer:
              plan.creator?.displayName ||
              plan.creator?.name ||
              "Assigned Officer",
            plannedCompletionDate: deadline ? deadline.slice(0, 10) : "",
            currentBottleneck:
              delayedStage?.remarks || "Pending stage completion",
          });
        }
      }
    }

    return delays;
  }, [filteredPlans]);

  const criticalDelaysCount = criticalDelaysLive.length;

  // Displayed pending plans and critical delays (filtered via top dropdowns)
  const displayedPendingPlans = pendingPlansLive;
  const displayedCriticalDelays = criticalDelaysLive;

  // Procurement Financial Capital & Contract Summary Calculation
  const financialSummary: FinancialCapitalSummary = useMemo(() => {
    // 1. Calculate plan estimated sum from filteredPlans (with currency normalization)
    const planEstimatedSum = filteredPlans.reduce(
      (sum, p) =>
        sum +
        (p.activities || []).reduce((aSum, a) => {
          const budget = Number(a.estimatedBudget) || 0;
          const rate = a.currency === "USD" ? 125 : 1;
          return aSum + budget * rate;
        }, 0),
      0,
    );

    // 2. Identify activity IDs in filteredPlans so contracts align with filtered scope
    const allowedActivityIds = new Set(
      filteredPlans.flatMap((p) => (p.activities || []).map((a) => a.id)),
    );

    // Filter contracts matching filtered activities (or if all, include all)
    const relevantContracts = contracts.filter((c) => {
      if (selectedProject !== "ALL" || selectedSector !== "All Sectors") {
        return c.activityId && allowedActivityIds.has(c.activityId);
      }
      return true;
    });

    const signedCommittedSum = relevantContracts.reduce((sum, c) => {
      const val = Number(c.totalValue) || 0;
      const rate = c.currency === "USD" ? 125 : 1;
      return sum + val * rate;
    }, 0);

    const actualDisbursedSum = relevantContracts.reduce((sum, c) => {
      const rate = c.currency === "USD" ? 125 : 1;
      const fromContract = Number(c.paidAmount) || 0;
      const fromPayments = (c.payments || [])
        .filter((pay) => pay.status === "PAID")
        .reduce((pSum, pay) => pSum + (Number(pay.amount) || 0), 0);
      const paid = fromContract > 0 ? fromContract : fromPayments;
      return sum + paid * rate;
    }, 0);

    // Database active entries calculation
    let planEstimatedValueETB = planEstimatedSum;
    let signedContractsCommittedETB = signedCommittedSum;
    let actualDisbursedETB = actualDisbursedSum;

    // Enclose plan envelope around contracted value if plan has no estimated budget
    if (
      signedContractsCommittedETB > planEstimatedValueETB &&
      planEstimatedValueETB === 0
    ) {
      planEstimatedValueETB = signedContractsCommittedETB;
    }
    if (actualDisbursedETB > signedContractsCommittedETB) {
      actualDisbursedETB = signedContractsCommittedETB;
    }

    const committedPendingPayETB = Math.max(
      0,
      signedContractsCommittedETB - actualDisbursedETB,
    );

    const uncontractedETB = Math.max(
      0,
      planEstimatedValueETB - signedContractsCommittedETB,
    );

    const remainingUncommittedETB = uncontractedETB;

    const contractExecutionRatePct =
      planEstimatedValueETB > 0
        ? Number(
            (
              (signedContractsCommittedETB / planEstimatedValueETB) *
              100
            ).toFixed(1),
          )
        : 0;

    const disbursedOfContractedPct =
      signedContractsCommittedETB > 0
        ? Number(
            ((actualDisbursedETB / signedContractsCommittedETB) * 100).toFixed(
              1,
            ),
          )
        : 0;

    const availableCapacityPct =
      planEstimatedValueETB > 0
        ? Number(
            ((remainingUncommittedETB / planEstimatedValueETB) * 100).toFixed(
              1,
            ),
          )
        : 0;

    return {
      planEstimatedValueETB,
      signedContractsCommittedETB,
      actualDisbursedETB,
      remainingUncommittedETB,
      contractExecutionRatePct,
      disbursedOfContractedPct,
      availableCapacityPct,
      committedPendingPayETB,
      uncontractedETB,
    };
  }, [filteredPlans, contracts, selectedProject, selectedSector]);

  // Pipeline Stages (Macro workflow stages calculated dynamically from live filtered data)
  const pipelineStages: PipelineStageVolume[] = useMemo(() => {
    let draftPlans = 0;
    let submittedPlans = 0;
    let committeePlans = 0;
    let tenderCount = 0;
    let evalCount = 0;
    let awardCount = 0;
    let contractCount = 0;
    let execCount = 0;
    let doneCount = 0;

    for (const plan of filteredPlans) {
      if (plan.status === "DRAFT") draftPlans++;
      if (
        plan.status === "SUBMITTED" ||
        plan.status === "PENDING_REVIEW" ||
        plan.status === "UPDATE_REQUESTED" ||
        (plan as any).status === "Submitted to Director"
      ) {
        submittedPlans++;
      }
      if (
        plan.status === "WITH_COMMITTEE" ||
        plan.status === "UNDER_COMMITTEE_REVIEW" ||
        (plan as any).status === "Committee Review"
      ) {
        committeePlans++;
      }

      for (const act of plan.activities || []) {
        if (act.status === "COMPLETED") {
          doneCount++;
          continue;
        }

        const activeStage = (act.stages || []).find(
          (s) => s.status !== "COMPLETED",
        );
        const stageName = (
          activeStage?.stageType?.label ||
          activeStage?.stageType?.code ||
          (activeStage as any)?.name ||
          ""
        ).toLowerCase();

        if (
          stageName.includes("tender") ||
          stageName.includes("spn") ||
          stageName.includes("notice") ||
          stageName.includes("rfb") ||
          stageName.includes("rfq") ||
          stageName.includes("eoi")
        ) {
          tenderCount++;
        } else if (
          stageName.includes("eval") ||
          stageName.includes("scoring") ||
          stageName.includes("opening") ||
          stageName.includes("technical") ||
          stageName.includes("financial")
        ) {
          evalCount++;
        } else if (
          stageName.includes("award") ||
          stageName.includes("intention") ||
          stageName.includes("recommendation")
        ) {
          awardCount++;
        } else if (
          stageName.includes("contract") ||
          stageName.includes("sign")
        ) {
          contractCount++;
        } else if (
          stageName.includes("delivery") ||
          stageName.includes("exec") ||
          stageName.includes("implementation") ||
          stageName.includes("work")
        ) {
          execCount++;
        } else {
          tenderCount++;
        }
      }
    }

    // Correlate with relevant contracts
    const allowedActivityIds = new Set(
      filteredPlans.flatMap((p) => (p.activities || []).map((a) => a.id)),
    );
    const relevantContracts = contracts.filter((c) => {
      if (selectedProject !== "ALL" || selectedSector !== "All Sectors") {
        return c.activityId && allowedActivityIds.has(c.activityId);
      }
      return true;
    });

    const activeContracts = relevantContracts.filter(
      (c) => c.status === "ACTIVE" || c.status === "PENDING",
    );
    const completedContracts = relevantContracts.filter(
      (c) => c.status === "COMPLETED",
    );
    if (activeContracts.length > 0) {
      contractCount = Math.max(contractCount, activeContracts.length);
      execCount = Math.max(
        execCount,
        activeContracts.filter((c) => Number(c.paidAmount || 0) > 0).length,
      );
    }
    if (completedContracts.length > 0) {
      doneCount += completedContracts.length;
    }

    return [
      {
        id: 1,
        code: "1. PLAN",
        title: "1. PLAN",
        sublabel: "Created",
        count: draftPlans,
        accent: "default",
      },
      {
        id: 2,
        code: "2. REVIEW",
        title: "2. REVIEW",
        sublabel: "Director",
        count: awaitingReviewCount,
        accent: "amber",
      },
      {
        id: 3,
        code: "3. COMM",
        title: "3. COMM",
        sublabel: "Voting",
        count: committeePlansCount,
        accent: "purple",
      },
      {
        id: 4,
        code: "4. TENDER",
        title: "4. TENDER",
        sublabel: "Published",
        count: tenderCount,
        accent: "default",
      },
      {
        id: 5,
        code: "5. EVAL",
        title: "5. EVAL",
        sublabel: "Technical",
        count: evalCount,
        accent: "default",
      },
      {
        id: 6,
        code: "6. AWARD",
        title: "6. AWARD",
        sublabel: "Intention",
        count: awardCount,
        accent: "default",
      },
      {
        id: 7,
        code: "7. CONT",
        title: "7. CONT",
        sublabel: "Signed",
        count: contractCount,
        accent: "teal",
      },
      {
        id: 8,
        code: "8. EXEC",
        title: "8. EXEC",
        sublabel: "Delivery",
        count: execCount,
        accent: "default",
      },
      {
        id: 9,
        code: "9. DONE",
        title: "9. DONE",
        sublabel: "Completed",
        count: doneCount,
        accent: "emerald",
      },
    ];
  }, [filteredPlans, contracts, awaitingReviewCount, committeePlansCount]);

  // Health Metrics
  const healthMetrics: DirectorateHealthMetrics = useMemo(() => {
    let bottleneckStage = "None detected";
    if (criticalDelaysLive.length > 0) {
      const stageDelayCounts: Record<string, number> = {};
      criticalDelaysLive.forEach((d) => {
        const stage = d.stageName || d.delayDetail || "Unknown Stage";
        stageDelayCounts[stage] = (stageDelayCounts[stage] || 0) + 1;
      });
      const sorted = Object.entries(stageDelayCounts).sort(
        (a, b) => b[1] - a[1],
      );
      if (sorted[0] && sorted[0][0]) {
        bottleneckStage = `${sorted[0][0]} (${sorted[0][1]} active delays)`;
      }
    }

    return {
      contractExecutionRate: financialSummary.contractExecutionRatePct,
      disbursementPace: financialSummary.disbursedOfContractedPct,
      scheduleAdherence:
        criticalDelaysLive.length === 0
          ? 100
          : Math.max(0, 100 - criticalDelaysLive.length * 5),
      nextAuditDate: "Not scheduled",
      bottleneckStage,
      standardDaysPerStage: 14,
    };
  }, [financialSummary, criticalDelaysLive]);

  // Spend composition bar percentages
  const spendPercentages = useMemo(() => {
    const total = financialSummary.planEstimatedValueETB;
    if (!total || total <= 0) {
      return {
        disbursed: "0.0",
        committedPending: "0.0",
        uncontracted: "0.0",
      };
    }
    const disbursedPct = (financialSummary.actualDisbursedETB / total) * 100;
    const committedPendingPct =
      (financialSummary.committedPendingPayETB / total) * 100;
    const uncontractedPct = Math.max(
      0,
      100 - disbursedPct - committedPendingPct,
    );
    return {
      disbursed: disbursedPct.toFixed(1),
      committedPending: committedPendingPct.toFixed(1),
      uncontracted: uncontractedPct.toFixed(1),
    };
  }, [financialSummary]);

  const isFiltered = useMemo(() => {
    return (
      selectedFiscalYear !== "2017 EFY" ||
      selectedSector !== "All Sectors" ||
      selectedProject !== "ALL" ||
      selectedStatus !== "ALL"
    );
  }, [selectedFiscalYear, selectedSector, selectedProject, selectedStatus]);

  return (
    <div className="w-full max-w-full min-w-0 overflow-x-hidden space-y-3 sm:space-y-3.5 animate-in fade-in duration-200">
      {/* 1. TOP FILTER BAR (4 PILLS: YEAR DROPDOWN, ALL SECTORS, ALL PROJECTS, ALL STATUSES IN ONE LINE) */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-nowrap w-full py-0.5 overflow-x-auto no-scrollbar">
        {/* Year Dropdown Pill (Mint background with Calendar icon) */}
        <div className="relative inline-flex items-center shrink-0">
          <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#047857] pointer-events-none" />
          <select
            value={selectedFiscalYear}
            onChange={(e) => setSelectedFiscalYear(e.target.value)}
            className="appearance-none bg-[#ecfdf5] hover:bg-[#d1fae5] border border-[#a7f3d0] rounded-xl pl-7.5 pr-6.5 py-1.5 text-xs sm:text-[13px] font-semibold text-[#065f46] focus:outline-hidden focus:ring-1.5 focus:ring-emerald-500 cursor-pointer shadow-2xs transition-all w-auto max-w-[130px] truncate"
            aria-label="Filter by Fiscal Year"
          >
            <option value="2017 EFY">2017 EFY</option>
            <option value="2016 EFY">2016 EFY</option>
            <option value="All Fiscal Years">All Fiscal Years</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#047857] pointer-events-none" />
        </div>

        {/* Sector Dropdown Pill */}
        <div className="relative inline-flex items-center shrink-0">
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="appearance-none bg-white hover:bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-6.5 py-1.5 text-xs sm:text-[13px] font-medium text-slate-800 focus:outline-hidden focus:ring-1.5 focus:ring-[#006837] cursor-pointer shadow-2xs transition-all w-auto max-w-[135px] sm:max-w-[155px] truncate"
            aria-label="Filter by Sector"
          >
            <option value="All Sectors">All Sectors</option>
            {availableSectors.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
        </div>

        {/* Project Dropdown Pill */}
        <div className="relative inline-flex items-center shrink-0">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="appearance-none bg-white hover:bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-6.5 py-1.5 text-xs sm:text-[13px] font-medium text-slate-800 focus:outline-hidden focus:ring-1.5 focus:ring-[#006837] cursor-pointer shadow-2xs transition-all w-auto max-w-[145px] sm:max-w-[170px] truncate"
            aria-label="Filter by Project"
          >
            <option value="ALL">All Projects ({totalProjectsCount})</option>
            {availableProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
        </div>

        {/* Status Dropdown Pill */}
        <div className="relative inline-flex items-center shrink-0">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="appearance-none bg-white hover:bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-6.5 py-1.5 text-xs sm:text-[13px] font-medium text-slate-800 focus:outline-hidden focus:ring-1.5 focus:ring-[#006837] cursor-pointer shadow-2xs transition-all w-auto max-w-[125px] sm:max-w-[140px] truncate"
            aria-label="Filter by Status"
          >
            <option value="ALL">All Statuses</option>
            <option value="Awaiting Review">Awaiting Review</option>
            <option value="In Progress">In Progress</option>
            <option value="Delayed">Delayed</option>
            <option value="Approved">Approved</option>
            <option value="Completed">Completed</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={() => {
              setSelectedFiscalYear("2017 EFY");
              setSelectedSector("All Sectors");
              setSelectedProject("ALL");
              setSelectedStatus("ALL");
            }}
            className="text-xs text-slate-500 hover:text-emerald-700 font-medium underline underline-offset-2 cursor-pointer transition-colors px-1 shrink-0"
          >
            Reset
          </button>
        )}
      </div>

      {/* 2. TOP 4 SUMMARY METRIC CARDS */}
      <section
        aria-label="Director metrics summary"
        className="grid grid-cols-1 gap-2.5 sm:gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {/* CARD 1: TOTAL PROJECTS */}
        <article className="flex flex-col justify-between rounded-xl bg-white p-3 sm:p-3.5 border border-slate-200/90 shadow-2xs transition-all duration-200 hover:shadow-md min-h-[105px]">
          <div className="flex items-start justify-between">
            <h3 className="text-[11px] font-bold text-slate-700">
              Total Projects
            </h3>
          </div>
          <div className="my-0.5">
            <p className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-slate-900 leading-none">
              {totalProjectsCount}
            </p>
          </div>
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium text-[11px]">
              Active Portfolios
            </span>
            <Link
              href="/workspace/projects"
              className="text-[#006837] hover:text-[#004f29] font-bold text-[11px] flex items-center gap-0.5 cursor-pointer hover:underline"
            >
              View All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </article>

        {/* CARD 2: AWAITING REVIEW */}
        <article className="flex flex-col justify-between rounded-xl bg-white p-3 sm:p-3.5 border border-slate-200/90 shadow-2xs transition-all duration-200 hover:shadow-md min-h-[105px]">
          <div className="flex items-start justify-between">
            <h3 className="text-[11px] font-bold text-slate-700">
              Awaiting Review
            </h3>
            <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0 mt-0.5" />
          </div>
          <div className="my-0.5 flex items-baseline gap-1.5">
            <p className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-slate-900 leading-none">
              {awaitingReviewCount}
            </p>
            <span className="text-xs font-semibold text-slate-500">plans</span>
          </div>
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium text-[11px]">
              Pending Decision
            </span>
            <Link
              href="/workspace/plan-for-review"
              className="text-amber-700 hover:text-amber-800 font-bold text-[11px] flex items-center gap-0.5 cursor-pointer hover:underline"
            >
              Review Now <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </article>

        {/* CARD 3: COMMITTEE PROGRESS */}
        <article className="flex flex-col justify-between rounded-xl bg-white p-3 sm:p-3.5 border border-slate-200/90 shadow-2xs transition-all duration-200 hover:shadow-md min-h-[105px]">
          <div className="flex items-start justify-between">
            <h3 className="text-[11px] font-bold text-slate-700">
              Committee Progress
            </h3>
          </div>
          <div className="my-0.5 flex items-baseline gap-1.5">
            <p className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-slate-900 leading-none">
              {committeePlansCount}
            </p>
            <span className="text-xs font-semibold text-slate-500">plans</span>
          </div>
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium text-[11px]">
              In Deliberation
            </span>
            <Link
              href="/workspace/committee-progress"
              className="text-purple-700 hover:text-purple-800 font-bold text-[11px] flex items-center gap-0.5 cursor-pointer hover:underline"
            >
              Check Votes <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </article>

        {/* CARD 4: CRITICAL DELAYS */}
        <article className="flex flex-col justify-between rounded-xl bg-white p-3 sm:p-3.5 border border-slate-200/90 shadow-2xs transition-all duration-200 hover:shadow-md min-h-[105px]">
          <div className="flex items-start justify-between">
            <h3 className="text-[11px] font-bold text-slate-700">
              Critical Delays
            </h3>
            <span className="h-2 w-2 rounded-full bg-rose-600 shrink-0 mt-0.5" />
          </div>
          <div className="my-0.5 flex items-baseline gap-1.5">
            <p className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-rose-600 leading-none">
              {criticalDelaysCount}
            </p>
            <span className="text-xs font-semibold text-slate-700">
              overdue &gt;7d
            </span>
          </div>
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium text-[11px]">
              Action Required
            </span>
            <Link
              href="/workspace/activity-tracker"
              className="text-rose-600 hover:text-rose-700 font-bold text-[11px] flex items-center gap-0.5 cursor-pointer hover:underline"
            >
              Needs Action <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </article>
      </section>

      {/* 3. PROCUREMENT FINANCIAL CAPITAL & CONTRACT SUMMARY */}
      <section className="rounded-xl bg-white p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs w-full max-w-full min-w-0 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              <CircleDollarSign className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
                Procurement Financial Capital & Contract Summary
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                Aggregated expenditure, signed commitments, and liquid
                disbursement balance for 2017 EFY
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200">
              {financialSummary.disbursedOfContractedPct}% Executed Disbursed
            </span>
            <span className="text-[11px] text-slate-600 font-medium">
              Currency:{" "}
              <span className="font-bold text-slate-900">
                ETB (Ethiopian Birr)
              </span>
            </span>
          </div>
        </div>

        {/* 4 Financial Indicator Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 py-2.5">
          {/* Col 1 */}
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 truncate">
              Plan Estimated Value
            </p>
            <p
              className="text-base sm:text-lg lg:text-xl font-extrabold text-slate-900 mt-0.5 truncate"
              title={`${formatETB(financialSummary.planEstimatedValueETB)} ETB`}
            >
              {formatETB(financialSummary.planEstimatedValueETB)}{" "}
              <span className="text-xs font-bold text-slate-500">ETB</span>
            </p>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5 truncate">
              Approved annual allocation
            </p>
          </div>

          {/* Col 2 */}
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 truncate">
              Signed Contracts Committed
            </p>
            <p
              className="text-base sm:text-lg lg:text-xl font-extrabold text-[#007A78] mt-0.5 truncate"
              title={`${formatETB(financialSummary.signedContractsCommittedETB)} ETB`}
            >
              {formatETB(financialSummary.signedContractsCommittedETB)}{" "}
              <span className="text-xs font-bold text-slate-500">ETB</span>
            </p>
            <p className="text-[10px] font-bold text-[#007A78] mt-0.5 truncate">
              {financialSummary.contractExecutionRatePct}% Contract Execution
              Rate
            </p>
          </div>

          {/* Col 3 */}
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 truncate">
              Actual Disbursed / Paid
            </p>
            <p
              className="text-base sm:text-lg lg:text-xl font-extrabold text-emerald-600 mt-0.5 truncate"
              title={`${formatETB(financialSummary.actualDisbursedETB)} ETB`}
            >
              {formatETB(financialSummary.actualDisbursedETB)}{" "}
              <span className="text-xs font-bold text-slate-500">ETB</span>
            </p>
            <p className="text-[10px] font-bold text-emerald-600 mt-0.5 truncate">
              {financialSummary.disbursedOfContractedPct}% of Contracted Amount
            </p>
          </div>

          {/* Col 4 */}
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 truncate">
              Remaining Uncommitted Balance
            </p>
            <p
              className="text-base sm:text-lg lg:text-xl font-extrabold text-slate-900 mt-0.5 truncate"
              title={`${formatETB(financialSummary.remainingUncommittedETB)} ETB`}
            >
              {formatETB(financialSummary.remainingUncommittedETB)}{" "}
              <span className="text-xs font-bold text-slate-500">ETB</span>
            </p>
            <p className="text-[10px] font-medium text-slate-500 mt-0.5 truncate">
              {financialSummary.availableCapacityPct}% Available capacity
            </p>
          </div>
        </div>

        {/* Portfolio Spend Composition Multi-Segment Progress Bar */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
            <span className="text-[11px] font-bold text-slate-700">
              Portfolio Spend Composition
            </span>
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-[11px]">
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-xs bg-emerald-600 inline-block" />
                <span className="text-slate-600 font-medium">
                  Disbursed (
                  {formatCompactM(financialSummary.actualDisbursedETB)})
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-xs bg-[#007A78] inline-block" />
                <span className="text-slate-600 font-medium">
                  Committed Pending Pay (
                  {formatCompactM(financialSummary.committedPendingPayETB)})
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-xs bg-slate-300 inline-block" />
                <span className="text-slate-600 font-medium">
                  Uncontracted (
                  {formatCompactM(financialSummary.uncontractedETB)})
                </span>
              </div>
            </div>
          </div>

          {/* Bar */}
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${spendPercentages.disbursed}%` }}
              className="bg-emerald-600 h-full transition-all duration-500"
              title={`Disbursed: ${spendPercentages.disbursed}%`}
            />
            <div
              style={{ width: `${spendPercentages.committedPending}%` }}
              className="bg-[#007A78] h-full transition-all duration-500"
              title={`Committed Pending Pay: ${spendPercentages.committedPending}%`}
            />
            <div
              style={{ width: `${spendPercentages.uncontracted}%` }}
              className="bg-slate-300 h-full transition-all duration-500"
              title={`Uncontracted: ${spendPercentages.uncontracted}%`}
            />
          </div>
        </div>
      </section>

      {/* 4. MIDDLE SECTION (2/3 + 1/3 GRID) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-3.5 items-stretch">
        {/* LEFT: PROCUREMENT WORKFLOW PIPELINE (2/3 cols) */}
        <div className="lg:col-span-2 rounded-xl bg-white p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <ChevronsRight className="h-4 w-4 text-slate-600" />
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                  Procurement Workflow Pipeline (Stage Volume)
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                Across {totalProjectsCount} Portfolios
              </span>
            </div>

            {/* 9 Stage Cards */}
            <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5 sm:gap-2 my-2.5">
              {pipelineStages.map((stage) => {
                let borderClass = "border-slate-200 bg-white";
                let textClass = "text-slate-800";
                let badgeClass = "text-slate-600 bg-slate-100";

                if (stage.accent === "amber") {
                  borderClass = "border-amber-300 bg-amber-50/50";
                  textClass = "text-amber-800";
                  badgeClass = "text-amber-800 bg-amber-100/80";
                } else if (stage.accent === "purple") {
                  borderClass = "border-purple-300 bg-purple-50/50";
                  textClass = "text-purple-800";
                  badgeClass = "text-purple-800 bg-purple-100/80";
                } else if (stage.accent === "teal") {
                  borderClass = "border-teal-300 bg-teal-50/50";
                  textClass = "text-teal-800";
                  badgeClass = "text-teal-800 bg-teal-100/80";
                } else if (stage.accent === "emerald") {
                  borderClass = "border-emerald-300 bg-emerald-50/50";
                  textClass = "text-emerald-800";
                  badgeClass = "text-emerald-800 bg-emerald-100/80";
                }

                const stageHref =
                  stage.code === "PLAN"
                    ? "/workspace/projects"
                    : stage.code === "REVIEW"
                      ? "/workspace/plan-for-review"
                      : stage.code === "COMM"
                        ? "/workspace/committee-progress"
                        : "/workspace/activity-tracker";

                return (
                  <Link
                    key={stage.id}
                    href={stageHref}
                    title={`Open ${stage.title} (${stage.sublabel}) in workspace`}
                    className={`flex flex-col items-center justify-between p-1.5 sm:p-2 rounded-xl border text-center transition-all hover:shadow-xs hover:scale-[1.02] h-[82px] sm:h-[86px] w-full min-w-0 overflow-hidden cursor-pointer ${borderClass}`}
                  >
                    {/* Uniform Top Badge */}
                    <div className="w-full flex items-center justify-center min-h-[24px]">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md leading-tight text-center ${badgeClass}`}
                      >
                        {stage.title}
                      </span>
                    </div>

                    {/* Uniform Middle Number */}
                    <span
                      className={`text-base sm:text-lg font-extrabold my-0.5 leading-none ${textClass}`}
                    >
                      {stage.count}
                    </span>

                    {/* Uniform Bottom Sublabel */}
                    <span className="text-[10px] font-medium text-slate-500 leading-none truncate w-full text-center">
                      {stage.sublabel}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Footer inside pipeline card */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-500">
            <div>
              Primary bottleneck:{" "}
              <span className="font-bold text-amber-700">
                {healthMetrics.bottleneckStage}
              </span>
            </div>
            <div className="font-medium text-slate-400 text-[10px]">
              System standard: {healthMetrics.standardDaysPerStage} days per
              stage
            </div>
          </div>
        </div>

        {/* RIGHT: PROCUREMENT FINANCIAL POSITION (PLAN VS ACTUAL) (1/3 cols) */}
        <div className="rounded-xl bg-white p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-[#006837]" />
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                  Procurement Financial Position
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                Plan vs Actual
              </span>
            </div>

            {/* Subtitle / Currency Indicator */}
            <div className="flex items-center justify-between mt-2 mb-2 text-[11px]">
              <span className="font-medium text-slate-500">
                Expenditure Tracking
              </span>
              <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                ETB
              </span>
            </div>

            {/* 3 Horizontal Comparison Bars */}
            <div className="space-y-2.5 my-1">
              {/* 1. Estimated (Plan) */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold mb-1">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-slate-800 shrink-0" />
                    Estimated (Plan)
                  </span>
                  <span className="text-slate-900 font-extrabold font-mono">
                    {formatCompactM(financialSummary.planEstimatedValueETB)}
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                  <div
                    style={{ width: "100%" }}
                    className="bg-slate-800 h-full rounded-full transition-all duration-500"
                    title={`Estimated Plan: ${formatETB(financialSummary.planEstimatedValueETB)} ETB`}
                  />
                </div>
              </div>

              {/* 2. Contracted */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold mb-1">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#007A78] shrink-0" />
                    Contracted
                  </span>
                  <span className="text-[#007A78] font-extrabold font-mono">
                    {formatCompactM(
                      financialSummary.signedContractsCommittedETB,
                    )}
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                  <div
                    style={{
                      width: `${Math.min(100, (financialSummary.signedContractsCommittedETB / (financialSummary.planEstimatedValueETB || 1)) * 100)}%`,
                    }}
                    className="bg-[#007A78] h-full rounded-full transition-all duration-500"
                    title={`Contracted: ${formatETB(financialSummary.signedContractsCommittedETB)} ETB`}
                  />
                </div>
              </div>

              {/* 3. Paid (Disbursed) */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold mb-1">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-600 shrink-0" />
                    Paid (Disbursed)
                  </span>
                  <span className="text-emerald-600 font-extrabold font-mono">
                    {formatCompactM(financialSummary.actualDisbursedETB)}
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                  <div
                    style={{
                      width: `${Math.min(100, (financialSummary.actualDisbursedETB / (financialSummary.planEstimatedValueETB || 1)) * 100)}%`,
                    }}
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    title={`Paid: ${formatETB(financialSummary.actualDisbursedETB)} ETB`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Audit Footer */}
          <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">
              Next Directorate Audit
            </span>
            <span className="font-bold text-slate-800">
              {healthMetrics.nextAuditDate}
            </span>
          </div>
        </div>
      </section>

      {/* 5. BOTTOM SECTION (1/2 + 1/2 GRID) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-3.5 items-start">
        {/* LEFT PANEL: Plans Awaiting Director Review */}
        <div className="rounded-xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Header */}
          <div className="p-3 sm:px-3.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-700" />
              <div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">
                  Plans Awaiting Director Review ({pendingPlansLive.length})
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Require formal Directorate approval or returned revision
                </p>
              </div>
            </div>
            <Link
              href="/workspace/plan-for-review"
              className="text-[#006837] hover:text-[#004f29] font-bold text-[11px] flex items-center gap-0.5 shrink-0 hover:underline cursor-pointer"
            >
              View All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Plan Cards List */}
          <div className="p-2.5 sm:p-3 space-y-2 sm:space-y-2.5">
            {displayedPendingPlans.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No plans matching current filter criteria.
              </div>
            ) : (
              displayedPendingPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-lg border border-slate-200/80 p-2.5 sm:p-3 hover:border-slate-300 hover:shadow-xs transition-all bg-white"
                >
                  {/* Top row: Badge and Budget */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full border border-amber-300 bg-amber-50 text-amber-800 text-[9px] font-bold tracking-wide">
                      Awaiting Review
                    </span>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        {formatETB(plan.estimatedBudgetETB)} ETB
                      </span>
                      <p className="text-[10px] text-slate-500">
                        {plan.totalActivitiesCount} Activities
                      </p>
                    </div>
                  </div>

                  {/* Middle: Plan title and Sector */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs leading-snug">
                      {plan.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Sector: {plan.directorate} • Officer:{" "}
                      <span className="font-medium text-slate-700">
                        {plan.submittedBy}
                      </span>
                    </p>
                  </div>

                  {/* Bottom: Submission timestamp and Review Button */}
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Submitted: {plan.submissionDate}
                    </span>
                    <Link
                      href={`/workspace/plan-for-review?plan=${encodeURIComponent(plan.id)}`}
                      className="inline-flex items-center gap-1 bg-[#006837] hover:bg-[#005229] text-white text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer shadow-2xs"
                    >
                      Review Plan <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Critical Delays Requiring Immediate Intervention */}
        <div className="rounded-xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Header */}
          <div className="p-3 sm:px-3.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">
                  Critical Delays Requiring Immediate Intervention (
                  {criticalDelaysLive.length})
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Activities delayed by 7+ days past scheduled milestone
                  completion
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-bold text-[9px] tracking-wider shrink-0">
              ALERT ACTIVE
            </span>
          </div>

          {/* Delays Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="px-3 py-1.5">Activity & Project</th>
                  <th className="px-2 py-1.5">Owner</th>
                  <th className="px-2 py-1.5">Delay</th>
                  <th className="px-3 py-1.5 text-right">Intervention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedCriticalDelays.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-6 text-center text-xs text-slate-400"
                    >
                      No critical delays found.
                    </td>
                  </tr>
                ) : (
                  displayedCriticalDelays.map((delay) => (
                    <tr
                      key={delay.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-3 py-2">
                        <p className="font-bold text-slate-900 text-xs leading-tight">
                          {delay.activityTitle}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {delay.projectName || delay.directorate} •{" "}
                          <span className="text-slate-600">
                            {delay.stageName}
                          </span>
                        </p>
                      </td>
                      <td className="px-2 py-2 font-medium text-slate-700 text-xs">
                        {delay.assignedOfficer}
                      </td>
                      <td className="px-2 py-2">
                        <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 font-bold text-[11px]">
                          +{delay.daysOverdue} Days
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Link
                          href={`/workspace/activity-tracker?activity=${encodeURIComponent(delay.id)}`}
                          className="text-[#006837] hover:text-[#004f29] font-bold text-[11px] hover:underline cursor-pointer"
                        >
                          Inspect
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. SYSTEM FOOTER BAR */}
      <footer className="pt-2 pb-2 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 font-medium">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-600 inline-block" />
            PTS System Operational (v2.4-Gov)
          </span>
          <span>•</span>
          <span>
            Baseline Preservation Lock:{" "}
            <strong className="text-slate-700">Active</strong>
          </span>
        </div>
        <div>
          Ministry of Agriculture • Federal Democratic Republic of Ethiopia •
          2017 EFY
        </div>
      </footer>
    </div>
  );
}

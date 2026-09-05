"use client";

import { useState, useEffect, useMemo } from "react";
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
import { formatRelativeTime } from "./directorFormatters";
import { DirectorTopFilterBar } from "./components/DirectorTopFilterBar";
import { DirectorSummaryCards } from "./components/DirectorSummaryCards";
import { DirectorFinancialSummaryCard } from "./components/DirectorFinancialSummaryCard";
import { DirectorWorkflowPipelineChart } from "./components/DirectorWorkflowPipelineChart";
import { DirectorSpendCompositionChart } from "./components/DirectorSpendCompositionChart";
import { DirectorFinancialPositionChart } from "./components/DirectorFinancialPositionChart";
import { DirectorActionPanels } from "./components/DirectorActionPanels";

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
  const [currentTime, setCurrentTime] = useState<number>(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setCurrentTime(Date.now()), 0);
    return () => window.clearTimeout(timer);
  }, []);

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
    const now = currentTime;

    for (const plan of filteredPlans) {
      for (const act of plan.activities || []) {
        const delayedStage = (act.stages || []).find((s: any) => {
          if (s.isNotApplicable || s.status === "COMPLETED") return false;
          if (s.status === "DELAYED") return true;
          const deadline = s.currentTargetEndDate || s.plannedEndDate;
          if (deadline && now && new Date(deadline).getTime() < now) {
            return true;
          }
          return false;
        });

        if (act.status === "DELAYED" || delayedStage) {
          const deadline =
            delayedStage?.currentTargetEndDate ||
            delayedStage?.plannedEndDate ||
            plan.createdAt;
          const daysOverdue =
            deadline && now
              ? Math.max(
                  1,
                  Math.round(
                    (now - new Date(deadline).getTime()) /
                      (1000 * 60 * 60 * 24),
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
  }, [filteredPlans, currentTime]);

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
    const signedContractsCommittedETB = signedCommittedSum;
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
    <div className="w-full max-w-full min-w-0 overflow-x-hidden space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* 1. TOP FILTER BAR */}
      <DirectorTopFilterBar
        selectedFiscalYear={selectedFiscalYear}
        onSelectFiscalYear={setSelectedFiscalYear}
        selectedSector={selectedSector}
        onSelectSector={setSelectedSector}
        availableSectors={availableSectors}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        availableProjects={availableProjects}
        totalProjectsCount={totalProjectsCount}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        isFiltered={isFiltered}
        onReset={() => {
          setSelectedFiscalYear("2017 EFY");
          setSelectedSector("All Sectors");
          setSelectedProject("ALL");
          setSelectedStatus("ALL");
        }}
      />

      {/* 2. TOP 4 SUMMARY METRIC CARDS */}
      <DirectorSummaryCards
        totalProjectsCount={totalProjectsCount}
        awaitingReviewCount={awaitingReviewCount}
        committeePlansCount={committeePlansCount}
        criticalDelaysCount={criticalDelaysCount}
        selectedFiscalYear={selectedFiscalYear}
        selectedSector={selectedSector}
      />

      {/* 3. PROCUREMENT FINANCIAL CAPITAL & CONTRACT SUMMARY */}
      <DirectorFinancialSummaryCard
        financialSummary={financialSummary}
        spendPercentages={spendPercentages}
        selectedFiscalYear={selectedFiscalYear}
      />

      {/* 4. MIDDLE SECTION: WORKFLOW PIPELINE & SPEND COMPOSITION (2 CARDS SIDE-BY-SIDE) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-stretch">
        <DirectorWorkflowPipelineChart
          stages={pipelineStages}
          totalProjectsCount={totalProjectsCount}
          bottleneckStage={healthMetrics.bottleneckStage}
          standardDaysPerStage={healthMetrics.standardDaysPerStage}
        />
        <DirectorSpendCompositionChart
          financialSummary={financialSummary}
          spendPercentages={spendPercentages}
        />
      </section>

      {/* 5. FULL WIDTH: PROCUREMENT FINANCIAL POSITION (PLAN VS ACTUAL) */}
      <DirectorFinancialPositionChart
        financialSummary={financialSummary}
        selectedFiscalYear={selectedFiscalYear}
        nextAuditDate={healthMetrics.nextAuditDate}
      />

      {/* 6. BOTTOM PANELS: PENDING REVIEWS & CRITICAL DELAYS */}
      <DirectorActionPanels
        pendingPlans={displayedPendingPlans}
        criticalDelays={displayedCriticalDelays}
      />

      {/* 7. SYSTEM FOOTER BAR */}
      <footer className="pt-2 pb-2 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 font-medium">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-600 inline-block" />
            System Operational
          </span>
          <span>•</span>
          <span>
            Baseline Lock: <strong className="text-slate-700">Active</strong>
          </span>
        </div>
        <div>Ministry of Agriculture • 2017 EFY</div>
      </footer>
    </div>
  );
}

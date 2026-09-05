import type { BackendPlan } from "@/lib/plansApi";
import type { BackendContract } from "@/lib/contractsApi";
import type { BackendProject } from "@/lib/projectsApi";
import type {
  DirectorPlan,
  CriticalDelay,
  PipelineStageVolume,
  DirectorateHealthMetrics,
  FinancialCapitalSummary,
} from "./directorData";
import { formatRelativeTime } from "./directorFormatters";

export interface FilterParams {
  fiscalYear: string;
  sector: string;
  project: string;
  status: string;
  availableProjects: { id: string; name: string }[];
}

import { gregorianToEthiopian } from "@/features/projects/utils/ethiopianCalendar";

export function getCurrentEthiopianYear(): number {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const eth = gregorianToEthiopian(today);
    if (eth && eth.year) {
      return eth.year;
    }
  } catch {
    // fallback
  }
  const now = new Date();
  const gYear = now.getFullYear();
  const gMonth = now.getMonth() + 1;
  return gMonth >= 9 ? gYear - 7 : gYear - 8;
}

/**
 * Dynamically extract distinct fiscal years available from plans and current date.
 * Automatically accommodates next year and future years without hardcoding.
 */
export function extractAvailableFiscalYears(plans: BackendPlan[]): string[] {
  const yearsSet = new Set<string>();
  const currentEFY = getCurrentEthiopianYear();

  // Always include current and recent previous EFYs
  yearsSet.add(`${currentEFY} EFY`);
  yearsSet.add(`${currentEFY - 1} EFY`);

  // Scan plans for any future or past fiscal years
  plans.forEach((p) => {
    if (p.budgetYear) {
      const match = p.budgetYear.match(/\b(20\d{2})\b/);
      if (match) {
        const num = parseInt(match[1], 10);
        // If year is Gregorian (e.g. 2025/2026), map to corresponding EFY
        const efy = num >= 2024 && num > currentEFY + 5 ? num - 8 : num;
        yearsSet.add(`${efy} EFY`);
      }
    }
  });

  return Array.from(yearsSet).sort((a, b) => {
    const numA = parseInt(a.replace(/[^0-9]/g, ""), 10) || 0;
    const numB = parseInt(b.replace(/[^0-9]/g, ""), 10) || 0;
    return numB - numA;
  });
}

/**
 * Dynamically match a plan's budget year against the selected fiscal year.
 * For any Ethiopian year E, Gregorian correspondence is E + 7 / E + 8.
 */
export function matchesFiscalYear(
  planBudgetYear: string | undefined | null,
  selectedFiscalYear: string,
): boolean {
  if (selectedFiscalYear === "All Fiscal Years") return true;
  if (!planBudgetYear) return true;

  const efyNum = parseInt(selectedFiscalYear.replace(/[^0-9]/g, ""), 10);
  if (!efyNum) return true;

  const efyStr = String(efyNum);
  const gYear1 = String(efyNum + 7);
  const gYear2 = String(efyNum + 8);

  const by = planBudgetYear.trim();
  return by.includes(efyStr) || by.includes(gYear1) || by.includes(gYear2);
}

/**
 * Filter plans by fiscal year, sector, project, and review/execution status
 */
export function filterPlans(plans: BackendPlan[], filters: FilterParams): BackendPlan[] {
  const { fiscalYear, sector, project, status, availableProjects } = filters;

  return plans.filter((p) => {
    // 1. Fiscal Year Filter (Dynamic for any year)
    if (!matchesFiscalYear(p.budgetYear, fiscalYear)) {
      return false;
    }

    // 2. Sector Filter
    if (sector !== "All Sectors") {
      const planSector = ((p.project as any)?.sector?.label || "").toLowerCase();
      const projName = (p.project?.name || p.organization || "").toLowerCase();
      const targetSector = sector.toLowerCase();
      if (
        !planSector.includes(targetSector) &&
        !targetSector.includes(planSector) &&
        !projName.includes(targetSector)
      ) {
        return false;
      }
    }

    // 3. Project Filter
    if (project !== "ALL") {
      const selectedProj = availableProjects.find((proj) => proj.id === project);
      const projName = selectedProj
        ? selectedProj.name.toLowerCase()
        : project.toLowerCase();
      const planProjName = (p.project?.name || p.organization || "").toLowerCase();
      if (
        p.project?.id !== project &&
        p.projectId !== project &&
        !planProjName.includes(projName) &&
        !projName.includes(planProjName)
      ) {
        return false;
      }
    }

    // 4. Status Filter
    if (status !== "ALL") {
      if (status === "Awaiting Review") {
        const isAwaiting =
          p.status === "SUBMITTED" ||
          p.status === "PENDING_REVIEW" ||
          p.status === "UPDATE_REQUESTED" ||
          (p as any).status === "Submitted to Director";
        if (!isAwaiting) return false;
      } else if (status === "In Progress") {
        const isInProgress =
          p.status === "IN_PROGRESS" ||
          p.status === "DRAFT" ||
          p.status === "WITH_COMMITTEE";
        if (!isInProgress) return false;
      } else if (status === "Delayed") {
        if (p.status !== "DELAYED") return false;
      } else if (status === "Approved") {
        if (p.status !== "APPROVED") return false;
      }
    }

    return true;
  });
}

/**
 * Filter projects by sector
 */
export function filterProjects(projects: BackendProject[], sector: string): BackendProject[] {
  return projects.filter((p) => {
    if (
      sector !== "All Sectors" &&
      p.sector?.label !== sector &&
      p.name !== sector
    ) {
      return false;
    }
    return true;
  });
}

/**
 * Extract distinct sector labels
 */
export function extractAvailableSectors(projects: BackendProject[]): string[] {
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
}

/**
 * Compute plans awaiting director review
 */
export function computePendingPlans(filteredPlans: BackendPlan[]): DirectorPlan[] {
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
      submittedBy: p.creator?.displayName || p.creator?.name || "Assigned Officer",
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
}

/**
 * Compute count of plans under committee review
 */
export function computeCommitteePlansCount(filteredPlans: BackendPlan[]): number {
  return filteredPlans.filter(
    (p) =>
      p.status === "WITH_COMMITTEE" ||
      p.status === "UNDER_COMMITTEE_REVIEW" ||
      (p as any).status === "Committee Review",
  ).length;
}

/**
 * Identify critical delays (>7 days past scheduled end date)
 */
export function computeCriticalDelays(
  filteredPlans: BackendPlan[],
  currentTime: number,
): CriticalDelay[] {
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
              Math.round((now - new Date(deadline).getTime()) / (1000 * 60 * 60 * 24)),
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
            plan.creator?.displayName || plan.creator?.name || "Assigned Officer",
          plannedCompletionDate: deadline ? deadline.slice(0, 10) : "",
          currentBottleneck: delayedStage?.remarks || "Pending stage completion",
        });
      }
    }
  }

  return delays;
}

/**
 * Aggregated procurement financial capital calculations
 */
export function computeFinancialSummary(
  filteredPlans: BackendPlan[],
  contracts: BackendContract[],
  selectedProject: string,
  selectedSector: string,
): FinancialCapitalSummary {
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

  const allowedActivityIds = new Set(
    filteredPlans.flatMap((p) => (p.activities || []).map((a) => a.id)),
  );

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

  let planEstimatedValueETB = planEstimatedSum;
  const signedContractsCommittedETB = signedCommittedSum;
  let actualDisbursedETB = actualDisbursedSum;

  if (signedContractsCommittedETB > planEstimatedValueETB && planEstimatedValueETB === 0) {
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
      ? Number(((signedContractsCommittedETB / planEstimatedValueETB) * 100).toFixed(1))
      : 0;

  const disbursedOfContractedPct =
    signedContractsCommittedETB > 0
      ? Number(((actualDisbursedETB / signedContractsCommittedETB) * 100).toFixed(1))
      : 0;

  const availableCapacityPct =
    planEstimatedValueETB > 0
      ? Number(((remainingUncommittedETB / planEstimatedValueETB) * 100).toFixed(1))
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
}

/**
 * 9-Stage Macro Workflow Pipeline Stage Volume
 */
export function computePipelineStages(
  filteredPlans: BackendPlan[],
  contracts: BackendContract[],
  selectedProject: string,
  selectedSector: string,
  awaitingReviewCount: number,
  committeePlansCount: number,
): PipelineStageVolume[] {
  let draftPlans = 0;
  let tenderCount = 0;
  let evalCount = 0;
  let awardCount = 0;
  let contractCount = 0;
  let execCount = 0;
  let doneCount = 0;

  for (const plan of filteredPlans) {
    if (plan.status === "DRAFT") draftPlans++;
    if (plan.status === "APPROVED" || plan.status === "COMPLETED") {
      doneCount++;
    }

    for (const act of plan.activities || []) {
      const activeStage =
        (act.stages || []).find((s) => s.status === "IN_PROGRESS") ||
        (act.stages || [])[0];
      const stageName = (
        activeStage?.stageType?.label ||
        (activeStage as any)?.name ||
        ""
      ).toLowerCase();

      if (
        stageName.includes("draft") ||
        stageName.includes("initiation") ||
        stageName.includes("plan")
      ) {
        draftPlans++;
      } else if (
        stageName.includes("tender") ||
        stageName.includes("bid") ||
        stageName.includes("advert") ||
        stageName.includes("rfp")
      ) {
        tenderCount++;
      } else if (
        stageName.includes("eval") ||
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
    { id: 1, code: "1. PLAN", title: "1. PLAN", sublabel: "Created", count: draftPlans, accent: "default" },
    { id: 2, code: "2. REVIEW", title: "2. REVIEW", sublabel: "Director", count: awaitingReviewCount, accent: "amber" },
    { id: 3, code: "3. COMM", title: "3. COMM", sublabel: "Voting", count: committeePlansCount, accent: "purple" },
    { id: 4, code: "4. TENDER", title: "4. TENDER", sublabel: "Published", count: tenderCount, accent: "default" },
    { id: 5, code: "5. EVAL", title: "5. EVAL", sublabel: "Technical", count: evalCount, accent: "default" },
    { id: 6, code: "6. AWARD", title: "6. AWARD", sublabel: "Intention", count: awardCount, accent: "default" },
    { id: 7, code: "7. CONT", title: "7. CONT", sublabel: "Signed", count: contractCount, accent: "teal" },
    { id: 8, code: "8. EXEC", title: "8. EXEC", sublabel: "Delivery", count: execCount, accent: "default" },
    { id: 9, code: "9. DONE", title: "9. DONE", sublabel: "Completed", count: doneCount, accent: "emerald" },
  ];
}

/**
 * Health & bottleneck metrics
 */
export function computeDirectorHealthMetrics(
  financialSummary: FinancialCapitalSummary,
  criticalDelays: CriticalDelay[],
): DirectorateHealthMetrics {
  let bottleneckStage = "None detected";
  if (criticalDelays.length > 0) {
    const stageDelayCounts: Record<string, number> = {};
    criticalDelays.forEach((d) => {
      const stage = d.stageName || d.delayDetail || "Unknown Stage";
      stageDelayCounts[stage] = (stageDelayCounts[stage] || 0) + 1;
    });
    const sorted = Object.entries(stageDelayCounts).sort((a, b) => b[1] - a[1]);
    if (sorted[0] && sorted[0][0]) {
      bottleneckStage = `${sorted[0][0]} (${sorted[0][1]} active delays)`;
    }
  }

  return {
    contractExecutionRate: financialSummary.contractExecutionRatePct,
    disbursementPace: financialSummary.disbursedOfContractedPct,
    scheduleAdherence:
      criticalDelays.length === 0 ? 100 : Math.max(0, 100 - criticalDelays.length * 5),
    nextAuditDate: "Not scheduled",
    bottleneckStage,
    standardDaysPerStage: 14,
  };
}

/**
 * Percentage breakdown for spend composition
 */
export function computeSpendPercentages(financialSummary: FinancialCapitalSummary) {
  const total = financialSummary.planEstimatedValueETB;
  if (!total || total <= 0) {
    return {
      disbursed: "0.0",
      committedPending: "0.0",
      uncontracted: "0.0",
    };
  }
  const disbursedPct = (financialSummary.actualDisbursedETB / total) * 100;
  const committedPendingPct = (financialSummary.committedPendingPayETB / total) * 100;
  const uncontractedPct = Math.max(0, 100 - disbursedPct - committedPendingPct);
  return {
    disbursed: disbursedPct.toFixed(1),
    committedPending: committedPendingPct.toFixed(1),
    uncontracted: uncontractedPct.toFixed(1),
  };
}

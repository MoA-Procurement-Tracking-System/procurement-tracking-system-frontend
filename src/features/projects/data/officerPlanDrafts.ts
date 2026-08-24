import type {
  OfficerProject,
  ProcurementCategory,
  ProcurementPlanSummary,
} from "./officerProjects";

export const OFFICER_PLAN_DRAFTS_STORAGE_KEY = "moa-pts:officer-plan-drafts:v1";

export interface ProcurementPlanDraftInput {
  budgetYear: string;
  category: ProcurementCategory;
  generalProcurementNoticeDate: string;
  generalProcurementNoticeDateEthiopian: string;
  organizationRegion: string;
  periodFrom: string;
  periodFromEthiopian: string;
  periodTo: string;
  periodToEthiopian: string;
  planName: string;
  remarks: string;
}

export interface SavedOfficerPlanRecord {
  plan: ProcurementPlanSummary;
  projectCode: string;
}

export function createDraftPlan(
  project: OfficerProject,
  input: ProcurementPlanDraftInput,
): ProcurementPlanSummary {
  return {
    activities: 0,
    budgetYear: `${input.budgetYear} EFY`,
    category: input.category,
    completedActivities: 0,
    currency: project.baseCurrency,
    delayedActivities: 0,
    description: input.remarks.trim() || undefined,
    estimatedValue: 0,
    generalProcurementNoticeDate: input.generalProcurementNoticeDate
      ? {
          ethiopian: input.generalProcurementNoticeDateEthiopian,
          gregorian: input.generalProcurementNoticeDate,
        }
      : undefined,
    inProgressActivities: 0,
    name: input.planName.trim(),
    organizationRegion: input.organizationRegion || undefined,
    planPeriod: {
      from: {
        ethiopian: input.periodFromEthiopian,
        gregorian: input.periodFrom,
      },
      to: {
        ethiopian: input.periodToEthiopian,
        gregorian: input.periodTo,
      },
    },
    reference: nextPlanReference(project, input.budgetYear),
    status: "Draft",
  };
}

export function mergeSavedPlans(
  projects: readonly OfficerProject[],
  records: readonly SavedOfficerPlanRecord[],
): readonly OfficerProject[] {
  return projects.map((project) => {
    const savedPlans = records
      .filter((record) => record.projectCode === project.code)
      .map((record) => record.plan)
      .filter(
        (plan) =>
          !project.plans.some(
            (existingPlan) => existingPlan.reference === plan.reference,
          ),
      );

    if (savedPlans.length === 0) return project;

    return {
      ...project,
      activePlans: project.activePlans + savedPlans.length,
      plans: [...project.plans, ...savedPlans],
    };
  });
}

export function parseSavedPlanRecords(
  serializedRecords: string | null,
): SavedOfficerPlanRecord[] {
  if (!serializedRecords) return [];

  try {
    const parsed: unknown = JSON.parse(serializedRecords);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeSavedOfficerPlanRecord)
      .filter(
        (record): record is SavedOfficerPlanRecord => record !== undefined,
      );
  } catch {
    return [];
  }
}

export function addSavedPlanRecord(
  records: readonly SavedOfficerPlanRecord[],
  record: SavedOfficerPlanRecord,
): SavedOfficerPlanRecord[] {
  const duplicate = records.some(
    (existing) =>
      existing.projectCode === record.projectCode &&
      existing.plan.reference === record.plan.reference,
  );

  return duplicate ? [...records] : [...records, record];
}

function nextPlanReference(project: OfficerProject, budgetYear: string) {
  const prefix = `PP-${project.shortName}-${budgetYear}-`;
  const highestSequence = project.plans.reduce((highest, plan) => {
    if (!plan.reference.startsWith(prefix)) return highest;

    const sequence = Number(plan.reference.slice(prefix.length));
    return Number.isInteger(sequence) ? Math.max(highest, sequence) : highest;
  }, 0);

  return `${prefix}${String(highestSequence + 1).padStart(2, "0")}`;
}

function normalizeSavedOfficerPlanRecord(
  value: unknown,
): SavedOfficerPlanRecord | undefined {
  if (!value || typeof value !== "object") return undefined;

  const record = value as Partial<SavedOfficerPlanRecord>;
  if (typeof record.projectCode !== "string") return undefined;

  const plan = normalizeProcurementPlanSummary(record.plan);
  return plan ? { plan, projectCode: record.projectCode } : undefined;
}

function normalizeProcurementPlanSummary(
  value: unknown,
): ProcurementPlanSummary | undefined {
  if (!value || typeof value !== "object") return undefined;

  const plan = value as Partial<ProcurementPlanSummary> & {
    categories?: unknown;
  };
  const legacyCategory =
    Array.isArray(plan.categories) && plan.categories.length > 0
      ? plan.categories[0]
      : undefined;
  const category =
    normalizeStoredCategory(plan.category) ??
    normalizeStoredCategory(legacyCategory);

  if (
    !category ||
    !(
      typeof plan.name === "string" &&
      typeof plan.reference === "string" &&
      typeof plan.budgetYear === "string" &&
      plan.status === "Draft" &&
      (plan.currency === "ETB" ||
        plan.currency === "USD" ||
        plan.currency === "UA") &&
      typeof plan.activities === "number" &&
      typeof plan.completedActivities === "number" &&
      typeof plan.delayedActivities === "number" &&
      typeof plan.inProgressActivities === "number" &&
      typeof plan.estimatedValue === "number"
    )
  ) {
    return undefined;
  }

  const normalizedPlan = { ...plan, category };
  delete normalizedPlan.categories;
  return normalizedPlan as ProcurementPlanSummary;
}

function normalizeStoredCategory(
  value: unknown,
): ProcurementCategory | undefined {
  if (value === "Goods" || value === "Works") return value;
  if (value === "Non-Consulting" || value === "Non-Consulting Services") {
    return "Non-Consulting Services";
  }
  if (value === "Consultancy" || value === "Consultancy Services") {
    return "Consultancy Services";
  }
  return undefined;
}

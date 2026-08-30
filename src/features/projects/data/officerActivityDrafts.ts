export const OFFICER_ACTIVITY_DRAFTS_STORAGE_KEY =
  "moa-pts:officer-activity-drafts:v2";

export type ProcurementActivityStatus =
  "Completed" | "Delayed" | "In Progress" | "Not Started";

export interface ProcurementActivityAllocation {
  id: string;
  percent: string;
  selected: boolean;
}

export interface ProcurementActivityLot {
  amount: string;
  description: string;
  id: number;
  number: string;
}

export interface ProcurementActivityRoadmapStage {
  id?: string;
  stageTypeId?: string;
  sequence?: number;
  allowNotApplicable: boolean;
  days: string;
  ethiopianDate: string;
  gregorianDate: string;
  name: string;
  notApplicable: boolean;
  remarks: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  currentTargetStartDate?: string;
  currentTargetEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  actualDate?: string;
  status?: string;
  revisions?: {
    revisionNo: number;
    revisedStartDate: string;
    revisedEndDate?: string;
    reason: string;
    createdAt?: string;
  }[];
}

export interface ProcurementActivityFormValues {
  activityDescription: string;
  classificationCode: string;
  comments: string;
  contractType: string;
  currency: string;
  domesticPreference: string;
  estimatedAmount: string;
  evaluationOptionCode: string;
  fundingSource: string;
  highRiskCode: string;
  inProcess: boolean;
  invitationReference: string;
  latitude: string;
  location: string;
  longitude: string;
  lotRequired: boolean;
  marketApproach: string;
  method: string;
  oversightClassification: string;
  pricingBasis: string;
  procurementDocumentType: string;
  procurementProcess: string;
  qualificationApproach: string;
  requiresUnAgency: boolean;
  reviewType: string;
  scopeNotes: string;
  specificMethod: string;
  subcomponent: string;
}

export interface ProcurementActivityDetails {
  componentAllocations: ProcurementActivityAllocation[];
  financingAllocations: ProcurementActivityAllocation[];
  form: ProcurementActivityFormValues;
  lots: ProcurementActivityLot[];
  roadmap: ProcurementActivityRoadmapStage[];
}

export interface ProcurementActivitySummary {
  id?: string;
  activityId?: string;
  planId?: string;
  projectId?: string;
  category: string;
  currentStage: string;
  description: string;
  details?: ProcurementActivityDetails;
  estimatedAmount: number;
  method: string;
  reference: string;
  status: ProcurementActivityStatus;
}

export interface SavedOfficerActivityRecord {
  activity: ProcurementActivitySummary;
  planReference: string;
  projectCode: string;
}

export function parseSavedActivityRecords(
  serializedRecords: string | null,
): SavedOfficerActivityRecord[] {
  if (!serializedRecords) return [];

  try {
    const parsed: unknown = JSON.parse(serializedRecords);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isSavedOfficerActivityRecord)
      .filter((record) => !record.activity.reference.startsWith("MOA/"));
  } catch {
    return [];
  }
}

export function addSavedActivityRecord(
  records: readonly SavedOfficerActivityRecord[],
  record: SavedOfficerActivityRecord,
) {
  const withoutExisting = records.filter(
    (existing) =>
      existing.projectCode !== record.projectCode ||
      existing.planReference !== record.planReference ||
      existing.activity.reference !== record.activity.reference,
  );

  return [...withoutExisting, record];
}

function isSavedOfficerActivityRecord(
  value: unknown,
): value is SavedOfficerActivityRecord {
  if (!value || typeof value !== "object") return false;

  const record = value as Partial<SavedOfficerActivityRecord>;
  return (
    typeof record.projectCode === "string" &&
    typeof record.planReference === "string" &&
    record.activity !== undefined &&
    typeof record.activity === "object" &&
    typeof (record.activity as any).description === "string"
  );
}

function isProcurementActivitySummary(
  value: unknown,
): value is ProcurementActivitySummary {
  if (!value || typeof value !== "object") return false;

  const activity = value as Partial<ProcurementActivitySummary>;
  return (
    typeof activity.reference === "string" &&
    typeof activity.description === "string"
  );
}

const activityFormStringFields: readonly (keyof ProcurementActivityFormValues)[] =
  [
    "activityDescription",
    "classificationCode",
    "comments",
    "contractType",
    "currency",
    "domesticPreference",
    "estimatedAmount",
    "evaluationOptionCode",
    "fundingSource",
    "highRiskCode",
    "invitationReference",
    "latitude",
    "location",
    "longitude",
    "marketApproach",
    "method",
    "oversightClassification",
    "pricingBasis",
    "procurementDocumentType",
    "procurementProcess",
    "qualificationApproach",
    "reviewType",
    "scopeNotes",
    "specificMethod",
    "subcomponent",
  ];

function isProcurementActivityDetails(
  value: unknown,
): value is ProcurementActivityDetails {
  if (!value || typeof value !== "object") return false;

  const details = value as Partial<ProcurementActivityDetails>;
  return (
    isProcurementActivityFormValues(details.form) &&
    Array.isArray(details.componentAllocations) &&
    details.componentAllocations.every(isActivityAllocation) &&
    Array.isArray(details.financingAllocations) &&
    details.financingAllocations.every(isActivityAllocation) &&
    Array.isArray(details.lots) &&
    details.lots.every(isActivityLot) &&
    Array.isArray(details.roadmap) &&
    details.roadmap.every(isActivityRoadmapStage)
  );
}

function isProcurementActivityFormValues(
  value: unknown,
): value is ProcurementActivityFormValues {
  if (!value || typeof value !== "object") return false;

  const form = value as Partial<ProcurementActivityFormValues>;
  return (
    activityFormStringFields.every(
      (field) => typeof form[field] === "string",
    ) &&
    typeof form.inProcess === "boolean" &&
    typeof form.lotRequired === "boolean" &&
    typeof form.requiresUnAgency === "boolean"
  );
}

function isActivityAllocation(
  value: unknown,
): value is ProcurementActivityAllocation {
  if (!value || typeof value !== "object") return false;
  const allocation = value as Partial<ProcurementActivityAllocation>;
  return (
    typeof allocation.id === "string" &&
    typeof allocation.percent === "string" &&
    typeof allocation.selected === "boolean"
  );
}

function isActivityLot(value: unknown): value is ProcurementActivityLot {
  if (!value || typeof value !== "object") return false;
  const lot = value as Partial<ProcurementActivityLot>;
  return (
    typeof lot.id === "number" &&
    typeof lot.number === "string" &&
    typeof lot.description === "string" &&
    typeof lot.amount === "string"
  );
}

function isActivityRoadmapStage(
  value: unknown,
): value is ProcurementActivityRoadmapStage {
  if (!value || typeof value !== "object") return false;
  const stage = value as Partial<ProcurementActivityRoadmapStage>;
  return typeof stage.name === "string";
}

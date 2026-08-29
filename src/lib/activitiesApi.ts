export interface BackendStageRevision {
  id: string;
  revisionNo: number;
  revisedStartDate: string;
  revisedEndDate: string;
  reason: string;
  createdAt: string;
}

export interface BackendStage {
  id: string;
  activityId: string;
  stageTypeId: string;
  stageType?: {
    id: string;
    type: string;
    code: string;
    label: string;
  };
  sequence: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "DELAYED";
  plannedStartDate?: string | null;
  plannedEndDate?: string | null;
  currentTargetStartDate?: string | null;
  currentTargetEndDate?: string | null;
  actualStartDate?: string | null;
  actualEndDate?: string | null;
  revisions?: BackendStageRevision[];
}

export interface BackendActivityFunding {
  id?: string;
  fundingSource: string;
  loanGrantNumber?: string | null;
  allocationPct: number;
}

export interface BackendActivityComponent {
  id?: string;
  component: string;
  allocationPct: number;
}

export interface BackendActivity {
  id: string;
  reference: string;
  planId: string;
  procurementMethodId: string;
  procurementMethod?: {
    id: string;
    type: string;
    code: string;
    label: string;
  };
  description: string;
  estimatedBudget: number;
  currency: string;
  marketApproach?:
    "OPEN_INTERNATIONAL" | "OPEN_NATIONAL" | "LIMITED" | "DIRECT" | null;
  reviewType?: "PRIOR" | "POST" | null;
  contractType?: "LUMP_SUM" | "TIME_BASED" | null;
  lotRequired?: boolean;
  status:
    | "DRAFT"
    | "PENDING_REVIEW"
    | "APPROVED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";
  fundings?: BackendActivityFunding[];
  components?: BackendActivityComponent[];
  stages?: BackendStage[];
  plan?: {
    id: string;
    title: string;
    project?: { id: string; code: string; name: string };
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateActivityInput {
  planId: string;
  procurementMethodId: string;
  description: string;
  estimatedBudget: number;
  currency: string;
  marketApproach?:
    "OPEN_INTERNATIONAL" | "OPEN_NATIONAL" | "LIMITED" | "DIRECT";
  reviewType?: "PRIOR" | "POST";
  contractType?: "LUMP_SUM" | "TIME_BASED";
  lotRequired?: boolean;
  fundings: {
    fundingSource: string;
    loanGrantNumber?: string;
    allocationPct: number;
  }[];
  stages?: any[];
  roadmap?: any[];
}

export interface UpdateStageDatesInput {
  plannedStartDate?: string;
  plannedEndDate?: string;
}

export interface RecordActualStageDatesInput {
  actualStartDate?: string;
  actualEndDate?: string;
}

export interface ReplanStageInput {
  revisedStartDate: string;
  revisedEndDate?: string;
  reason: string;
}

import { apiClient } from "./apiClient";

export async function fetchActivities(
  planId?: string,
): Promise<BackendActivity[]> {
  try {
    const res = await apiClient.get<any>("/activities", {
      params: planId ? { planId } : undefined,
    });
    return Array.isArray(res) ? res : res.data || [];
  } catch (err) {
    console.error("fetchActivities error:", err);
    return [];
  }
}

export async function fetchActivityById(id: string): Promise<BackendActivity> {
  const res = await apiClient.get<any>(`/activities/${encodeURIComponent(id)}`);
  return res.data || res;
}

export async function createActivity(
  data: CreateActivityInput,
): Promise<BackendActivity> {
  const res = await apiClient.post<any>("/activities", data);
  return res.data || res;
}

export async function updateActivity(
  id: string,
  data: Partial<CreateActivityInput>,
): Promise<BackendActivity> {
  const res = await apiClient.patch<any>(
    `/activities/${encodeURIComponent(id)}`,
    data,
  );
  return res.data || res;
}

export async function updateStageDates(
  activityId: string,
  stageId: string,
  data: UpdateStageDatesInput,
): Promise<void> {
  await apiClient.patch(
    `/activities/${encodeURIComponent(activityId)}/stages/${encodeURIComponent(stageId)}`,
    data,
  );
}

export async function recordActualStageDates(
  activityId: string,
  stageId: string,
  data: RecordActualStageDatesInput,
): Promise<void> {
  await apiClient.patch(
    `/activities/${encodeURIComponent(activityId)}/stages/${encodeURIComponent(stageId)}/actual`,
    data,
  );
}

export async function replanStage(
  activityId: string,
  stageId: string,
  data: ReplanStageInput,
): Promise<void> {
  await apiClient.post(
    `/activities/${encodeURIComponent(activityId)}/stages/${encodeURIComponent(stageId)}/replan`,
    data,
  );
}

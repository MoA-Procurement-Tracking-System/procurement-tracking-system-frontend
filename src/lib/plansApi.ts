import type {
  ProcurementPlan,
  PlanCategory,
  PlanStatus,
} from "@/features/plans/plansData";

export interface BackendCommitteeVote {
  id: string;
  planId: string;
  round: number;
  memberId: string;
  decision: "APPROVE" | "REJECT";
  comment: string | null;
  createdAt: string;
}

export interface BackendPlan {
  id: string;
  projectId: string;
  status: "DRAFT" | "SUBMITTED" | "WITH_COMMITTEE" | "APPROVED" | "REJECTED";
  committeeRound?: number;
  committeeVoteDeadline?: string | null;
  title: string;
  budgetYear?: string | null;
  procurementCategory?:
    "GOODS" | "WORKS" | "CONSULTANCY" | "NON_CONSULTING" | null;
  periodStart: string;
  periodEnd: string;
  organization?: string | null;
  description?: string | null;
  gpnDate?: string | null;
  approvalDate?: string | null;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
  activities?: {
    id: string;
    reference?: string;
    description?: string;
    estimatedBudget: number;
    currency?: string;
    status?: string;
  }[];
  project?: { id: string; code: string; name: string };
  committeeVotes?: BackendCommitteeVote[];
}

export interface CreatePlanInput {
  projectId: string;
  title: string;
  budgetYear?: string;
  procurementCategory?: "GOODS" | "WORKS" | "CONSULTANCY" | "NON_CONSULTING";
  organization?: string;
  description?: string;
  periodStart: string;
  periodEnd: string;
  gpnDate?: string;
}

export interface UpdatePlanInput {
  title?: string;
  budgetYear?: string;
  procurementCategory?: "GOODS" | "WORKS" | "CONSULTANCY" | "NON_CONSULTING";
  organization?: string;
  description?: string;
  periodStart?: string;
  periodEnd?: string;
  gpnDate?: string;
  status?: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
}

import { apiClient } from "./apiClient";

export async function fetchPlans(): Promise<BackendPlan[]> {
  try {
    const res = await apiClient.get<any>("/plans");
    return Array.isArray(res) ? res : res.data || [];
  } catch (err) {
    console.error("fetchPlans error:", err);
    return [];
  }
}

export async function fetchPlanById(id: string): Promise<BackendPlan> {
  const res = await apiClient.get<any>(`/plans/${encodeURIComponent(id)}`);
  return res.data || res;
}

export async function createPlan(data: CreatePlanInput): Promise<BackendPlan> {
  const res = await apiClient.post<any>("/plans", data);
  return res.data || res;
}

export async function updatePlan(
  id: string,
  data: UpdatePlanInput,
): Promise<BackendPlan> {
  const res = await apiClient.patch<any>(
    `/plans/${encodeURIComponent(id)}`,
    data,
  );
  return res.data || res;
}

/** Officer submits draft plan to Director */
export async function submitPlanForReview(id: string): Promise<BackendPlan> {
  const res = await apiClient.post<any>(
    `/plans/${encodeURIComponent(id)}/submit`,
  );
  return res.data || res;
}

/** Director approves plan and forwards to Endorsing Committee */
export async function sendPlanToCommittee(id: string): Promise<BackendPlan> {
  const res = await apiClient.post<any>(
    `/plans/${encodeURIComponent(id)}/send-to-committee`,
  );
  return res.data || res;
}

/** Director rejects/returns plan to Officer with feedback */
export async function rejectPlan(
  id: string,
  reason: string,
): Promise<BackendPlan> {
  const res = await apiClient.post<any>(
    `/plans/${encodeURIComponent(id)}/reject`,
    { reason },
  );
  return res.data || res;
}

/** Committee member votes on plan */
export async function submitVote(
  planId: string,
  decision: "APPROVE" | "REJECT",
  comment?: string,
): Promise<void> {
  await apiClient.post(`/plans/${encodeURIComponent(planId)}/vote`, {
    decision,
    comment,
  });
}

export function mapBackendPlanToFrontend(
  backendPlan: BackendPlan,
  currentMemberId?: string,
): ProcurementPlan {
  // Map category
  let category: PlanCategory = "Goods";
  const rawCat = backendPlan.procurementCategory || "";
  if (rawCat === "WORKS") category = "Works";
  else if (rawCat === "CONSULTANCY") category = "Consultancy Services";
  else if (rawCat === "NON_CONSULTING") category = "Non-Consulting Services";

  // Map status
  let status: PlanStatus = "Draft";
  if (backendPlan.status === "WITH_COMMITTEE") status = "Committee Review";
  else if (backendPlan.status === "APPROVED") status = "Finally Approved";
  else if (backendPlan.status === "REJECTED") status = "Returned";
  else if (backendPlan.status === "SUBMITTED") status = "Submitted to Director";
  else if (backendPlan.status === "DRAFT") status = "Draft";

  // Calculate estimated total from activities if included
  let estimatedTotalNum = 0;
  if (backendPlan.activities && backendPlan.activities.length > 0) {
    estimatedTotalNum = backendPlan.activities.reduce(
      (sum, act) => sum + (act.estimatedBudget || 0),
      0,
    );
  }

  // Format estimatedTotal as string
  const estimatedTotal =
    estimatedTotalNum > 0
      ? `${(estimatedTotalNum / 1000000).toFixed(1)}M ETB`
      : "0.0M ETB";

  // Calculate progress details from committeeVotes relation
  const votes = backendPlan.committeeVotes || [];
  const approvalsCount = votes.filter((v) => v.decision === "APPROVE").length;
  const progress = Math.min(100, Math.round((approvalsCount / 5) * 100)); // 5 members total
  const progressText = `${approvalsCount} of 5 approved`;

  // Look for current member's decision in this plan (if provided)
  let committeeDecision: "Approved" | "Rejected" | undefined = undefined;
  let decisionRecordedDate: string | undefined = undefined;
  let rejectionReason: string | undefined = undefined;

  if (currentMemberId) {
    const myVote = votes.find((v) => v.memberId === currentMemberId);
    if (myVote) {
      committeeDecision =
        myVote.decision === "APPROVE" ? "Approved" : "Rejected";
      decisionRecordedDate = new Date(myVote.createdAt).toLocaleDateString(
        "en-GB",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        },
      );
      rejectionReason = myVote.comment || undefined;
    }
  }

  return {
    id: backendPlan.id,
    projectId: backendPlan.projectId || backendPlan.project?.id || "proj-id",
    projectCode: backendPlan.project?.code || "BREFONS",
    projectName: backendPlan.project?.name || "MoA Project",
    planName: backendPlan.title || "Untitled Plan",
    budgetYear: backendPlan.budgetYear || "2018 EFY",
    category,
    planPeriodFrom: backendPlan.periodStart
      ? new Date(backendPlan.periodStart).toISOString().split("T")[0]
      : "",
    planPeriodTo: backendPlan.periodEnd
      ? new Date(backendPlan.periodEnd).toISOString().split("T")[0]
      : "",
    organizationRegion: backendPlan.organization || "Federal",
    description: backendPlan.description || undefined,
    status,
    createdBy: backendPlan.createdBy || "Assigned Officer",
    createdAt: backendPlan.createdAt,
    activitiesCount: backendPlan.activities ? backendPlan.activities.length : 0,
    estimatedTotal,
    isPriority: backendPlan.committeeVoteDeadline
      ? new Date(backendPlan.committeeVoteDeadline).getTime() -
          new Date().getTime() <
        7 * 24 * 60 * 60 * 1000
      : false,
    progress,
    progressText,
    deadlineDate: backendPlan.committeeVoteDeadline || undefined,
    deadlineText: backendPlan.committeeVoteDeadline
      ? new Date(backendPlan.committeeVoteDeadline).toLocaleDateString(
          "en-GB",
          {
            day: "numeric",
            month: "short",
            year: "numeric",
          },
        )
      : undefined,
    decisionRecordedDate,
    committeeDecision,
    rejectionReason,
  };
}

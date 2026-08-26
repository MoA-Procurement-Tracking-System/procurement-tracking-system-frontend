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
  marketApproach?: "OPEN_INTERNATIONAL" | "OPEN_NATIONAL" | "LIMITED" | "DIRECT" | null;
  reviewType?: "PRIOR" | "POST" | null;
  contractType?: "LUMP_SUM" | "TIME_BASED" | null;
  lotRequired?: boolean;
  status: "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
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
  marketApproach?: "OPEN_INTERNATIONAL" | "OPEN_NATIONAL" | "LIMITED" | "DIRECT";
  reviewType?: "PRIOR" | "POST";
  contractType?: "LUMP_SUM" | "TIME_BASED";
  lotRequired?: boolean;
  fundings: {
    fundingSource: string;
    loanGrantNumber?: string;
    allocationPct: number;
  }[];
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

export async function fetchActivities(
  planId?: string,
): Promise<BackendActivity[]> {
  const url = planId
    ? `/api/activities?planId=${encodeURIComponent(planId)}`
    : "/api/activities";
  const response = await fetch(url, {
    method: "GET",
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error((await response.text()) || "Failed to fetch activities");
  }
  return response.json();
}

export async function fetchActivityById(id: string): Promise<BackendActivity> {
  const response = await fetch(`/api/activities/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error((await response.text()) || "Failed to fetch activity");
  }
  return response.json();
}

export async function createActivity(
  data: CreateActivityInput,
): Promise<BackendActivity> {
  const response = await fetch("/api/activities", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorText = await response.text();
    let msg = "Failed to create activity";
    try {
      const parsed = JSON.parse(errorText);
      msg = parsed.error || parsed.message || msg;
    } catch {
      msg = errorText || msg;
    }
    throw new Error(msg);
  }
  return response.json();
}

export async function updateActivity(
  id: string,
  data: Partial<CreateActivityInput>,
): Promise<BackendActivity> {
  const response = await fetch(`/api/activities/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update activity");
  }
  return response.json();
}

export async function updateStageDates(
  activityId: string,
  stageId: string,
  data: UpdateStageDatesInput,
): Promise<void> {
  const response = await fetch(
    `/api/activities/${encodeURIComponent(activityId)}/stages/${encodeURIComponent(stageId)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(data),
    },
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update stage");
  }
}

export async function recordActualStageDates(
  activityId: string,
  stageId: string,
  data: RecordActualStageDatesInput,
): Promise<void> {
  const response = await fetch(
    `/api/activities/${encodeURIComponent(activityId)}/stages/${encodeURIComponent(stageId)}/actual`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(data),
    },
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to record actual stage dates");
  }
}

export async function replanStage(
  activityId: string,
  stageId: string,
  data: ReplanStageInput,
): Promise<void> {
  const response = await fetch(
    `/api/activities/${encodeURIComponent(activityId)}/stages/${encodeURIComponent(stageId)}/replan`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(data),
    },
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to replan stage");
  }
}

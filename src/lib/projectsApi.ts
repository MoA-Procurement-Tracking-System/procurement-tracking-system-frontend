import type {
  ProjectItem,
  ProjectOfficer,
} from "@/features/dashboards/components/director/projects/projectsData";
import type { OfficerProject } from "@/features/projects/data/officerProjects";

export interface BackendProject {
  id: string;
  code: string;
  name: string;
  sapIdentificationNo?: string | null;
  country?: string | null;
  executingAgency?: string | null;
  organization?: string | null;
  fundingSourceId: string;
  fundingSource?: { id: string; type: string; code: string; label: string };
  fundingType?: string | null;
  loanGrantNumbers?: string[];
  components?: string[];
  subcomponents?: string[];
  baseCurrency?: string | null;
  projectStartDate?: string | null;
  projectEndDate?: string | null;
  sectorId: string;
  sector?: { id: string; type: string; code: string; label: string };
  status: "ACTIVE" | "CLOSED" | "SUSPENDED";
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  members?: {
    id: string;
    userId: string;
    projectId: string;
    user?: { id: string; name: string; email: string; role: string };
  }[];
  plans?: any[];
}

export interface CreateProjectInput {
  code: string;
  name: string;
  fundingSourceId: string;
  sectorId: string;
  sapIdentificationNo?: string;
  country?: string;
  executingAgency?: string;
  organization?: string;
  fundingType?: string;
  loanGrantNumbers?: string[];
  components?: string[];
  subcomponents?: string[];
  baseCurrency?: string;
  projectStartDate?: string;
  projectEndDate?: string;
}

export interface UpdateProjectInput {
  name?: string;
  status?: "ACTIVE" | "CLOSED" | "SUSPENDED";
  sapIdentificationNo?: string;
  country?: string;
  executingAgency?: string;
  organization?: string;
  fundingType?: string;
  loanGrantNumbers?: string[];
  components?: string[];
  subcomponents?: string[];
  baseCurrency?: string;
  projectStartDate?: string;
  projectEndDate?: string;
}

export async function fetchProjects(): Promise<BackendProject[]> {
  const response = await fetch("/api/projects", {
    method: "GET",
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error((await response.text()) || "Failed to fetch projects");
  }
  return response.json();
}

export async function fetchProjectById(id: string): Promise<BackendProject> {
  const response = await fetch(`/api/projects/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error((await response.text()) || "Failed to fetch project");
  }
  return response.json();
}

export async function createProject(
  data: CreateProjectInput,
): Promise<BackendProject> {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorText = await response.text();
    let msg = "Failed to create project";
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

export async function updateProject(
  id: string,
  data: UpdateProjectInput,
): Promise<BackendProject> {
  const response = await fetch(`/api/projects/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorText = await response.text();
    let msg = "Failed to update project";
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

export async function assignOfficerToProject(
  projectId: string,
  officerId: string,
): Promise<void> {
  const response = await fetch(
    `/api/projects/${encodeURIComponent(projectId)}/officers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ officerId }),
    },
  );
  if (!response.ok) {
    const errorText = await response.text();
    let msg = "Failed to assign officer";
    try {
      const parsed = JSON.parse(errorText);
      msg = parsed.error || parsed.message || msg;
    } catch {
      msg = errorText || msg;
    }
    throw new Error(msg);
  }
}

export async function removeOfficerFromProject(
  projectId: string,
  officerId: string,
): Promise<void> {
  const response = await fetch(
    `/api/projects/${encodeURIComponent(projectId)}/officers/${encodeURIComponent(officerId)}`,
    {
      method: "DELETE",
      headers: { accept: "application/json" },
    },
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to remove officer");
  }
}

export function mapBackendProjectToProjectItem(
  bp: BackendProject,
): ProjectItem {
  const assignedOfficers: ProjectOfficer[] = (bp.members || []).map((m) => ({
    id: m.userId,
    name: m.user?.name || "Assigned Officer",
    email: m.user?.email || "officer@moa.gov.et",
    roleTag: "OFFICER",
  }));

  return {
    id: bp.id,
    code: bp.code,
    name: bp.name,
    sapNumber: bp.sapIdentificationNo || undefined,
    countryOrg: bp.country || "Ethiopia",
    executingAgency: bp.executingAgency || "Ministry of Agriculture",
    region: bp.organization || "FPCU / Federal",
    budgetYear: "2018 EFY",
    fundingSource: bp.fundingSource?.label || "World Bank",
    fundingType: bp.fundingType || "Loan / Grant",
    loanGrantNumbers: bp.loanGrantNumbers || [],
    components: bp.components || [],
    subcomponents: bp.subcomponents || [],
    currency: bp.baseCurrency || "ETB",
    startDate: bp.projectStartDate
      ? new Date(bp.projectStartDate).toISOString().split("T")[0]
      : "2024-01-01",
    endDate: bp.projectEndDate
      ? new Date(bp.projectEndDate).toISOString().split("T")[0]
      : "2029-12-31",
    sector: bp.sector?.label || "Agriculture",
    assignedOfficers,
    description: "Sector project",
    status: bp.status === "ACTIVE" ? "Active" : "Inactive",
    createdAt: bp.createdAt || "2026-01-01",
  };
}

export function mapBackendProjectToOfficerProject(
  bp: BackendProject,
): OfficerProject {
  const assignedOfficers = (bp.members || [])
    .map((m) => m.user?.name || "")
    .filter(Boolean);

  return {
    code: bp.code,
    name: bp.name,
    shortName: bp.code,
    status: bp.status === "ACTIVE" ? "Active" : "Inactive",
    fundingSource: bp.fundingSource?.label || "World Bank",
    fundingType: bp.fundingType || "Loan / Grant",
    executingAgency: bp.executingAgency || "Ministry of Agriculture",
    countryOrganisation: bp.country || "Ethiopia",
    organizationRegion: bp.organization || "FPCU / Federal",
    baseCurrency: (bp.baseCurrency as "ETB" | "USD" | "UA") || "ETB",
    sapIdentificationNumber: bp.sapIdentificationNo || undefined,
    financingNumbers: bp.loanGrantNumbers || [],
    components: bp.components || [],
    subcomponents: bp.subcomponents || [],
    activePlans: bp.plans ? bp.plans.length : 0,
    assignedOfficers: assignedOfficers.length > 0 ? assignedOfficers : ["Assigned Officer"],
    assignmentStart: {
      ethiopian: "01 Meskerem 2016",
      gregorian: bp.projectStartDate
        ? new Date(bp.projectStartDate).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "11 Sep 2023",
    },
    projectPeriod: {
      from: bp.projectStartDate
        ? new Date(bp.projectStartDate).toISOString().split("T")[0]
        : undefined,
      to: bp.projectEndDate
        ? new Date(bp.projectEndDate).toISOString().split("T")[0]
        : undefined,
    },
    plans: [],
  };
}

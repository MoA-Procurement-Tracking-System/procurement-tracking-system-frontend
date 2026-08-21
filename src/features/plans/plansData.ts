export type PlanCategory =
  "Goods" | "Works" | "Non-Consulting Services" | "Consultancy Services";

export type PlanStatus =
  | "Draft"
  | "Submitted to Director"
  | "Returned"
  | "Committee Review"
  | "Finally Approved";

export interface ProcurementPlan {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  planName: string;
  budgetYear: string;
  category: PlanCategory;
  planPeriodFrom: string;
  planPeriodTo: string;
  organizationRegion: string;
  description?: string;
  approvalDate?: string;
  generalNoticeDate?: string;
  status: PlanStatus;
  createdBy: string;
  createdAt: string;
  activitiesCount: number;
}

export const PLAN_CATEGORY_CHOICES: {
  category: PlanCategory;
  description: string;
  examples: string;
}[] = [
  {
    category: "Goods",
    description: "Physical items and supplies",
    examples:
      "Uniform, stationery, toners, vehicles, ICT equipment, laboratory equipment",
  },
  {
    category: "Works",
    description: "Construction/rehabilitation infrastructure",
    examples:
      "Water supply, laboratories, collection centers, workshop/calibration center",
  },
  {
    category: "Non-Consulting Services",
    description: "Services not primarily intellectual/advisory consultancy",
    examples: "Printing, event management, operational services",
  },
  {
    category: "Consultancy Services",
    description: "Firm or individual professional/advisory services",
    examples:
      "Baseline survey, audit, value-chain studies, supervision, training/design consultancy",
  },
];

export const INITIAL_PLANS: ProcurementPlan[] = [
  {
    id: "plan-1",
    projectId: "proj-1",
    projectCode: "BREFONS",
    projectName:
      "Program to Build Resilience for Food Security & Livelihoods (BREFONS)",
    planName: "BREFONS - Goods Procurement Plan - 2018 EFY",
    budgetYear: "2018 EFY (2025/2026)",
    category: "Goods",
    planPeriodFrom: "2025-07-08",
    planPeriodTo: "2026-07-07",
    organizationRegion: "FPCU / Federal",
    description:
      "Procurement plan for vehicles, seed treating machines, and field laboratory equipment under BREFONS.",
    approvalDate: "2025-08-15",
    generalNoticeDate: "2025-07-10",
    status: "Finally Approved",
    createdBy: "Demelash Worku",
    createdAt: "2025-07-12",
    activitiesCount: 8,
  },
  {
    id: "plan-2",
    projectId: "proj-1",
    projectCode: "BREFONS",
    projectName:
      "Program to Build Resilience for Food Security & Livelihoods (BREFONS)",
    planName: "BREFONS - Works Procurement Plan - 2018 EFY",
    budgetYear: "2018 EFY (2025/2026)",
    category: "Works",
    planPeriodFrom: "2025-07-08",
    planPeriodTo: "2026-07-07",
    organizationRegion: "Oromia",
    description:
      "Construction of livestock water points, collection centers, and rehabilitation of irrigation sites.",
    approvalDate: undefined,
    generalNoticeDate: "2025-07-10",
    status: "Submitted to Director",
    createdBy: "Demelash Worku",
    createdAt: "2025-08-01",
    activitiesCount: 4,
  },
  {
    id: "plan-3",
    projectId: "proj-1",
    projectCode: "BREFONS",
    projectName:
      "Program to Build Resilience for Food Security & Livelihoods (BREFONS)",
    planName: "BREFONS - Consultancy Services Plan - 2018 EFY",
    budgetYear: "2018 EFY (2025/2026)",
    category: "Consultancy Services",
    planPeriodFrom: "2025-09-01",
    planPeriodTo: "2026-08-31",
    organizationRegion: "FPCU / Federal",
    description:
      "Baseline survey, annual financial audit, and environmental impact assessment consultancies.",
    approvalDate: undefined,
    generalNoticeDate: "2025-07-10",
    status: "Committee Review",
    createdBy: "Demelash Worku",
    createdAt: "2025-08-10",
    activitiesCount: 3,
  },
  {
    id: "plan-4",
    projectId: "proj-2",
    projectCode: "DRIVE",
    projectName:
      "De-Risking, Inclusion and Value Enhancement in Pastoral Economies Project (DRIVE)",
    planName: "DRIVE - Goods & Equipment Procurement Plan - 2018 EFY",
    budgetYear: "2018 EFY (2025/2026)",
    category: "Goods",
    planPeriodFrom: "2025-07-01",
    planPeriodTo: "2026-06-30",
    organizationRegion: "Somali",
    description:
      "IT systems for index livestock insurance, handheld terminals, and regional communication kits.",
    approvalDate: "2025-07-20",
    generalNoticeDate: "2025-06-15",
    status: "Finally Approved",
    createdBy: "Demelash Worku",
    createdAt: "2025-07-02",
    activitiesCount: 6,
  },
  {
    id: "plan-5",
    projectId: "proj-3",
    projectCode: "CLIMATE-RESTORE",
    projectName: "2018 EFY Climate Action Landscape Restoration Plan",
    planName: "CLIMATE-RESTORE - Non-Consulting Services Plan - 2018 EFY",
    budgetYear: "2018 EFY (2025/2026)",
    category: "Non-Consulting Services",
    planPeriodFrom: "2025-08-01",
    planPeriodTo: "2026-07-31",
    organizationRegion: "Oromia",
    description:
      "Printing of community watershed manuals, video documentation, and workshop organization.",
    approvalDate: undefined,
    generalNoticeDate: undefined,
    status: "Draft",
    createdBy: "Demelash Worku",
    createdAt: "2025-08-14",
    activitiesCount: 2,
  },
];

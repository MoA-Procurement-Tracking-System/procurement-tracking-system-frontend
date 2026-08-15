export interface ProjectOfficer {
  id: string;
  name: string;
  email: string;
  roleTag: string;
}

export interface ProjectItem {
  id: string;
  code: string;
  name: string;
  budgetYear: string;
  fundingSource: string;
  customFundingSource?: string;
  sector: string;
  assignedOfficers: ProjectOfficer[];
  description: string;
  status: "Active" | "Pending Approval" | "Completed" | "Delayed";
  createdAt: string;
}

export const INITIAL_OFFICERS: ProjectOfficer[] = [
  {
    id: "off-1",
    name: "Demelash Worku",
    email: "officer@moa.gov.et",
    roleTag: "OFFICER",
  },
  {
    id: "off-2",
    name: "Abebe Kebede",
    email: "newuser@moa.gov.et",
    roleTag: "OFFICER",
  },
  {
    id: "off-3",
    name: "Dawit Mekonnen",
    email: "dawit@moa.gov.et",
    roleTag: "OFFICER",
  },
  {
    id: "off-4",
    name: "Bethelhem Tadesse",
    email: "bethelhem@moa.gov.et",
    roleTag: "OFFICER",
  },
];

export const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: "proj-1",
    code: "BREFONS-P-Z1-C00-080",
    name: "BREFONS (Program to Build Resilience for Food Security & Livelihoods)",
    budgetYear: "2018 EFY (2025/2026)",
    fundingSource: "African Development Bank (AfDB)",
    sector: "Livestock & Pastoral Development",
    assignedOfficers: [INITIAL_OFFICERS[0], INITIAL_OFFICERS[1]],
    description:
      "Program aimed at building climate resilience, livestock water access, and pastoral livelihoods across horn region.",
    status: "Active",
    createdAt: "2026-08-01",
  },
  {
    id: "proj-2",
    code: "DRIVE-IDA-E0380",
    name: "DRIVE (De-Risking, Inclusion and Value Enhancement in Pastoral Economies)",
    budgetYear: "2018 EFY (2025/2026)",
    fundingSource: "World Bank (IDA)",
    sector: "Livestock & Pastoral Development",
    assignedOfficers: [INITIAL_OFFICERS[0], INITIAL_OFFICERS[2]],
    description:
      "Regional project for pastoral trade, livestock insurance, and market integration.",
    status: "Active",
    createdAt: "2026-08-05",
  },
  {
    id: "proj-3",
    code: "CLIMATE-RESTORE-2018",
    name: "2018 EFY Climate Action Landscape Restoration Plan",
    budgetYear: "2018 EFY (2025/2026)",
    fundingSource: "World Bank / Grant",
    sector: "Natural Resources & Climate Change",
    assignedOfficers: [INITIAL_OFFICERS[0], INITIAL_OFFICERS[3]],
    description:
      "Landscape rehabilitation, afforestation, and sustainable land management.",
    status: "Active",
    createdAt: "2026-08-10",
  },
  {
    id: "proj-4",
    code: "SEED-NURSERY-INFRA",
    name: "Construction of Central Tree Seed Nursery Infrastructure & Verification",
    budgetYear: "2018 EFY (2025/2026)",
    fundingSource: "Government Treasury (መንግሥት)",
    sector: "Natural Resources & Climate Change",
    assignedOfficers: [INITIAL_OFFICERS[0]],
    description:
      "Construction of modern seed processing units and nursery facilities.",
    status: "Delayed",
    createdAt: "2026-08-12",
  },
];

export const SECTOR_OPTIONS = [
  "Livestock & Pastoral Development",
  "Crops & Horticulture Directorate",
  "Natural Resources & Climate Change",
  "Agribusiness & Rural Finance",
  "Agricultural Mechanization & Infrastructure",
];

export const FUNDING_SOURCE_OPTIONS = [
  { label: "African Development Bank (AfDB)", category: "Standard" },
  { label: "World Bank (IDA)", category: "Standard" },
  { label: "Government Treasury (መንግሥት)", category: "Standard" },
  { label: "UNOPS", category: "Standard" },
  { label: "AfDB / Grant", category: "Standard" },
  { label: "World Bank / Grant", category: "Standard" },
  { label: "Other (Specify Custom Funding Source...)", category: "Custom" },
];

export const BUDGET_YEAR_OPTIONS = [
  "2018 EFY (2025/2026)",
  "2017 EFY (2024/2025)",
  "2019 EFY (2026/2027)",
];

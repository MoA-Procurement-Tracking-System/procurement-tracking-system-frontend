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
  sapNumber?: string;
  countryOrg: string;
  executingAgency: string;
  region: string;
  budgetYear: string;
  fundingSource: string;
  customFundingSource?: string;
  fundingType: string;
  loanGrantNumbers: string[];
  components: string[];
  subcomponents: string[];
  currency: string;
  startDate?: string;
  endDate?: string;
  sector: string;
  assignedOfficers: ProjectOfficer[];
  description: string;
  status: "Active" | "Inactive";
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

export const COUNTRY_ORG_OPTIONS = [
  "Ethiopia",
  "IGAD (Intergovernmental Authority on Development)",
  "Regional / Multi-Country",
  "Other (Specify Custom Organisation)",
];

export const EXECUTING_AGENCY_OPTIONS = [
  "Ministry of Agriculture (MoA)",
  "Oromia Irrigation and Pastoralist Development Bureau",
  "Amhara Bureau of Agriculture",
  "Somali Pastoral & Agro-Pastoral Development Bureau",
  "Afar Bureau of Agriculture",
  "Other (Specify Custom Agency)",
];

export const REGION_OPTIONS = [
  "FPCU / Federal",
  "Oromia",
  "Somali",
  "Afar",
  "Southwest Ethiopia",
  "South Ethiopia",
  "Amhara",
  "Tigray",
  "Sidama",
  "Gambella",
  "Benishangul-Gumuz",
  "Dire Dawa",
  "Harari",
];

export const FUNDING_SOURCE_OPTIONS = [
  { label: "African Development Bank (AfDB)", category: "Standard" },
  { label: "World Bank (IDA)", category: "Standard" },
  { label: "Government Treasury (መንግሥት)", category: "Standard" },
  { label: "UNOPS", category: "Standard" },
  {
    label: "IFAD (International Fund for Agricultural Development)",
    category: "Standard",
  },
  { label: "EU Grant / European Union", category: "Standard" },
  { label: "Other (Specify Custom Funding Source...)", category: "Custom" },
];

export const FUNDING_TYPE_OPTIONS = [
  "Treasury",
  "Loan",
  "Grant",
  "Mixed (Loan & Grant)",
];

export const CURRENCY_OPTIONS = [
  "ETB (Ethiopian Birr)",
  "USD (US Dollar)",
  "UA (AfDB Unit of Account)",
  "EUR (Euro)",
];

export const BUDGET_YEAR_OPTIONS = [
  "2018 EFY (2025/2026)",
  "2017 EFY (2024/2025)",
  "2019 EFY (2026/2027)",
];

export const SECTOR_OPTIONS = [
  "Livestock & Pastoral Development",
  "Crops & Horticulture Directorate",
  "Natural Resources & Climate Change",
  "Agribusiness & Rural Finance",
  "Agricultural Mechanization & Infrastructure",
];

export const STATUS_OPTIONS: ("Active" | "Inactive")[] = ["Active", "Inactive"];

export const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: "proj-1",
    code: "BREFONS",
    name: "Program to Build Resilience for Food Security & Livelihoods (BREFONS)",
    sapNumber: "P-Z1-C00-080",
    countryOrg: "Ethiopia",
    executingAgency: "Ministry of Agriculture (MoA)",
    region: "FPCU / Federal",
    budgetYear: "2018 EFY (2025/2026)",
    fundingSource: "African Development Bank (AfDB)",
    fundingType: "Grant",
    loanGrantNumbers: ["2100155041683"],
    components: ["Component 1: Building Resilience & Climate Adaptation"],
    subcomponents: ["1.1 Water Infrastructure", "1.2 Livestock Value Chains"],
    currency: "UA (AfDB Unit of Account)",
    startDate: "2025-07-08",
    endDate: "2030-07-07",
    sector: "Livestock & Pastoral Development",
    assignedOfficers: [INITIAL_OFFICERS[0], INITIAL_OFFICERS[1]],
    description:
      "BREFONS Program header container storing project identity, SAP ID P-Z1-C00-080, and grant allocation.",
    status: "Active",
    createdAt: "2026-08-01",
  },
  {
    id: "proj-2",
    code: "DRIVE",
    name: "De-Risking, Inclusion and Value Enhancement in Pastoral Economies Project (DRIVE)",
    sapNumber: "IDA-E0380",
    countryOrg: "Ethiopia",
    executingAgency: "Ministry of Agriculture (MoA)",
    region: "Somali",
    budgetYear: "2018 EFY (2025/2026)",
    fundingSource: "World Bank (IDA)",
    fundingType: "Credit / Loan",
    loanGrantNumbers: ["IDA-E0380", "IDA-61650"],
    components: [
      "Component 1: De-risking Pastoral Finance",
      "Component 2: Pastoral Market Integration",
    ],
    subcomponents: [
      "2.1 Index-Based Livestock Insurance",
      "2.2 Trade Facilitation",
    ],
    currency: "USD (US Dollar)",
    startDate: "2024-01-15",
    endDate: "2029-01-14",
    sector: "Livestock & Pastoral Development",
    assignedOfficers: [INITIAL_OFFICERS[0], INITIAL_OFFICERS[2]],
    description:
      "Regional project for pastoral trade, livestock insurance, and market integration.",
    status: "Active",
    createdAt: "2026-08-05",
  },
  {
    id: "proj-3",
    code: "CLIMATE-RESTORE",
    name: "2018 EFY Climate Action Landscape Restoration Plan",
    sapNumber: "CR-2018-001",
    countryOrg: "Ethiopia",
    executingAgency: "Ministry of Agriculture (MoA)",
    region: "Oromia",
    budgetYear: "2018 EFY (2025/2026)",
    fundingSource: "World Bank (IDA)",
    fundingType: "Grant",
    loanGrantNumbers: ["WB-GRANT-9902"],
    components: ["Component 1: Sustainable Land Management"],
    subcomponents: ["1.1 Watershed Rehabilitation"],
    currency: "ETB (Ethiopian Birr)",
    startDate: "2025-01-01",
    endDate: "2028-12-31",
    sector: "Natural Resources & Climate Change",
    assignedOfficers: [INITIAL_OFFICERS[0], INITIAL_OFFICERS[3]],
    description:
      "Landscape rehabilitation, afforestation, and sustainable land management.",
    status: "Active",
    createdAt: "2026-08-10",
  },
  {
    id: "proj-4",
    code: "SEED-NURSERY",
    name: "Construction of Central Tree Seed Nursery Infrastructure",
    sapNumber: "GOV-SEED-09",
    countryOrg: "Ethiopia",
    executingAgency: "Ministry of Agriculture (MoA)",
    region: "FPCU / Federal",
    budgetYear: "2018 EFY (2025/2026)",
    fundingSource: "Government Treasury (መንግሥት)",
    fundingType: "Treasury",
    loanGrantNumbers: ["TREASURY-2018"],
    components: ["Component 1: Seed Processing Infrastructure"],
    subcomponents: ["1.1 Facility Construction"],
    currency: "ETB (Ethiopian Birr)",
    startDate: "2024-07-08",
    endDate: "2026-07-07",
    sector: "Natural Resources & Climate Change",
    assignedOfficers: [INITIAL_OFFICERS[0]],
    description:
      "Construction of modern seed processing units and nursery facilities.",
    status: "Inactive",
    createdAt: "2026-08-12",
  },
];

export type ProjectStatus = "Active" | "Inactive";
export type ProcurementPlanStatus = "Approved" | "Draft" | "Returned";

export interface DualCalendarDateValue {
  ethiopian: string;
  gregorian: string;
}

export interface ProcurementPlanSummary {
  activities: number;
  budgetYear: string;
  categories: readonly string[];
  completedActivities: number;
  currency: "ETB" | "USD" | "UA";
  delayedActivities: number;
  description?: string;
  estimatedValue: number;
  generalProcurementNoticeDate?: DualCalendarDateValue;
  inProgressActivities: number;
  name: string;
  organizationRegion?: string;
  planPeriod?: {
    from: DualCalendarDateValue;
    to: DualCalendarDateValue;
  };
  reference: string;
  status: ProcurementPlanStatus;
}

export interface OfficerProject {
  activePlans: number;
  assignedOfficers: readonly string[];
  assignmentStart: {
    ethiopian: string;
    gregorian: string;
  };
  availableOrganizationRegions?: readonly string[];
  baseCurrency: "ETB" | "USD" | "UA";
  code: string;
  components?: readonly string[];
  countryOrganisation: string;
  executingAgency: string;
  financingNumbers?: readonly string[];
  fundingSource: string;
  fundingType: string;
  name: string;
  organizationRegion?: string;
  plans: readonly ProcurementPlanSummary[];
  projectPeriod?: {
    from?: string;
    to?: string;
  };
  sapIdentificationNumber?: string;
  shortName: string;
  status: ProjectStatus;
  subcomponents?: readonly string[];
  supportsGeneralProcurementNotice?: boolean;
}

// UI-only fixtures aligned to the Director's Create Project fields in the
// Data Entry and Excel Mapping Specification. Optional values are omitted when
// they were not captured; the detail UI must not invent replacements.
export const officerProjects: readonly OfficerProject[] = [
  {
    activePlans: 3,
    assignedOfficers: ["Yeabsira Fikre"],
    assignmentStart: {
      ethiopian: "02 Hamle 2016",
      gregorian: "10 Jan 2024",
    },
    availableOrganizationRegions: ["FPCU / Federal"],
    baseCurrency: "USD",
    code: "PRJ-24-001",
    components: ["Livestock Value Chains and Trade Facilitation"],
    countryOrganisation: "Ethiopia",
    executingAgency: "Ministry of Agriculture",
    financingNumbers: ["IDA-E0380", "IDA-61650"],
    fundingSource: "World Bank",
    fundingType: "Loan / Grant",
    name: "DRIVE - De-Risking, Inclusion and Value Enhancement",
    organizationRegion: "FPCU / Federal",
    plans: [
      {
        activities: 12,
        budgetYear: "2016 EFY",
        categories: ["Goods", "Works", "Non-Consulting"],
        completedActivities: 8,
        currency: "ETB",
        delayedActivities: 1,
        estimatedValue: 125_500_000,
        inProgressActivities: 3,
        name: "2016 EFY Annual Procurement Plan",
        reference: "PP-DRIVE-2016-01",
        status: "Approved",
      },
      {
        activities: 4,
        budgetYear: "2016 EFY",
        categories: ["Consultancy"],
        completedActivities: 1,
        currency: "USD",
        delayedActivities: 1,
        estimatedValue: 14_000_000,
        inProgressActivities: 2,
        name: "Q2 Consultancy Requirements",
        reference: "PP-DRIVE-2016-02",
        status: "Draft",
      },
      {
        activities: 7,
        budgetYear: "2017 EFY",
        categories: ["Goods", "Consultancy"],
        completedActivities: 3,
        currency: "ETB",
        delayedActivities: 1,
        estimatedValue: 68_750_000,
        inProgressActivities: 3,
        name: "2017 EFY Procurement Pipeline",
        reference: "PP-DRIVE-2017-01",
        status: "Returned",
      },
    ],
    projectPeriod: {
      from: "01 Jul 2023",
      to: "30 Jun 2028",
    },
    shortName: "DRIVE",
    status: "Active",
    supportsGeneralProcurementNotice: true,
  },
  {
    activePlans: 5,
    assignedOfficers: ["Yeabsira Fikre"],
    assignmentStart: {
      ethiopian: "07 Hamle 2016",
      gregorian: "15 Feb 2024",
    },
    availableOrganizationRegions: [
      "FPCU / Federal",
      "Oromia",
      "Somali",
      "Afar",
      "Southwest Ethiopia",
      "South Ethiopia",
    ],
    baseCurrency: "UA",
    code: "PRJ-24-042",
    countryOrganisation: "Ethiopia",
    executingAgency: "Ministry of Agriculture",
    financingNumbers: ["2100155041683"],
    fundingSource: "AfDB Grant",
    fundingType: "Grant",
    name: "BREFONS - Building Resilience for Food and Nutrition Security",
    organizationRegion: "FPCU and participating regions",
    plans: [
      {
        activities: 9,
        budgetYear: "2016 EFY",
        categories: ["Goods"],
        completedActivities: 5,
        currency: "UA",
        delayedActivities: 1,
        estimatedValue: 64_000_000,
        inProgressActivities: 3,
        name: "Federal Goods Procurement Plan",
        reference: "PP-BREFONS-2016-01",
        status: "Approved",
      },
      {
        activities: 6,
        budgetYear: "2016 EFY",
        categories: ["Works"],
        completedActivities: 3,
        currency: "UA",
        delayedActivities: 1,
        estimatedValue: 180_000_000,
        inProgressActivities: 2,
        name: "Regional Works Procurement Plan",
        reference: "PP-BREFONS-2016-02",
        status: "Approved",
      },
      {
        activities: 5,
        budgetYear: "2016 EFY",
        categories: ["Consultancy"],
        completedActivities: 2,
        currency: "USD",
        delayedActivities: 1,
        estimatedValue: 9_800_000,
        inProgressActivities: 2,
        name: "Consultancy Services Plan",
        reference: "PP-BREFONS-2016-03",
        status: "Draft",
      },
      {
        activities: 8,
        budgetYear: "2017 EFY",
        categories: ["Goods", "Works"],
        completedActivities: 4,
        currency: "UA",
        delayedActivities: 1,
        estimatedValue: 92_000_000,
        inProgressActivities: 3,
        name: "2017 EFY Regional Procurement Plan",
        reference: "PP-BREFONS-2017-01",
        status: "Returned",
      },
      {
        activities: 3,
        budgetYear: "2017 EFY",
        categories: ["Non-Consulting"],
        completedActivities: 1,
        currency: "ETB",
        delayedActivities: 1,
        estimatedValue: 6_500_000,
        inProgressActivities: 1,
        name: "Operational Services Plan",
        reference: "PP-BREFONS-2017-02",
        status: "Draft",
      },
    ],
    projectPeriod: {
      from: "01 Jan 2024",
      to: "31 Dec 2029",
    },
    shortName: "BREFONS",
    status: "Active",
    supportsGeneralProcurementNotice: true,
  },
];

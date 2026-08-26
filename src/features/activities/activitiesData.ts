import type { PlanCategory } from "../plans/plansData";

export type ProcurementMethod =
  | "RFB - International"
  | "RFB - National"
  | "RFQ / Shopping"
  | "Direct Procurement"
  | "UN Agency / UNOPS Direct"
  | "QCBS"
  | "FBS"
  | "LCS"
  | "CQS"
  | "INDV"
  | "Restricted / Limited";

export type MarketApproach =
  | "Open - International"
  | "Open - National"
  | "Limited"
  | "Direct"
  | "Shopping";

export type QualificationApproach =
  "Prequalification" | "Post-qualification" | "Not Applicable";

export type ReviewType = "Prior" | "Post" | "Audit";

export type ContractType = "Lump Sum" | "Time Based";

export type StageStatus =
  "Not Started" | "In Progress" | "Completed" | "Not Applicable";

export interface LotItem {
  id: string;
  lotNumber: string;
  lotDescription: string;
  estimatedAmount: number;
}

export interface ActivityStage {
  id: string;
  stageName: string;
  originalPlannedDate?: string;
  plannedDurationDays?: number;
  revisionNo?: string;
  revisedTargetDate?: string;
  actualDate?: string;
  stageStatus: StageStatus;
  delayDays?: number;
  replanningReason?: string;
  remarks?: string;
  notApplicable?: boolean;
}

export interface ProcurementActivity {
  id: string;
  planId: string;
  planName: string;
  projectCode: string;

  // 4.1 Step 1 - Key Details
  category: PlanCategory; // Inherited from Plan
  method: ProcurementMethod;
  specificMethod?: string;
  marketApproach: MarketApproach;
  qualificationApproach: QualificationApproach;
  domesticPreference: boolean;
  reviewType: ReviewType;
  procurementProcess?: string;
  evaluationOptions?: string;
  highRiskSeaSh?: boolean;
  procurementDocumentType?: string;
  contractType?: ContractType; // Consultancy only
  requiresUnAgency: boolean;
  isInProcess: boolean;

  // 4.2 Step 2 - Related Information
  activityRefNo: string;
  description: string;
  estimatedAmount: number;
  currency: "ETB" | "USD" | "UA";
  fundingSource: string;
  loanGrantNo?: string;
  fundingAllocationPercent: number;
  component?: string;
  subcomponent?: string;
  componentAllocationPercent: number;
  isLotRequired: boolean;
  lots?: LotItem[];
  invitationRefNo?: string;
  pricingBasis?: "Lump Sum" | "Bill of Quantities (BOQ)";
  scopeNotes?: string;
  comments?: string;
  remarks?: string;

  // 4.3 Step 3 - Additional Details
  classificationCode?: string;
  classificationDescription?: string;
  locationRegion?: string;
  latitude?: number;
  longitude?: number;
  additionalRemarks?: string;

  // 4.4 Step 4 - Roadmap
  roadmap: ActivityStage[];

  // Metadata
  status: "Draft" | "Submitted to Director" | "Approved" | "In Execution";
  createdAt: string;
}

// Method Roadmap Generators (6.1 - 6.9)
export function generateRoadmapForMethod(
  category: PlanCategory,
  method: ProcurementMethod,
  fundingSource: string = "World Bank",
): ActivityStage[] {
  let stageNames: string[] = [];
  const isTreasury = fundingSource.toLowerCase().includes("treasury");

  if (isTreasury && category !== "Consultancy Services") {
    // 6.1 MoA Treasury / Local Goods-Works-NonConsulting
    stageNames = [
      "Tender advertisement / letter invitation date",
      "Tender opening date",
      "Bid evaluation report submission date",
      "Bid evaluation report approval date",
      "No-objection / approval date",
      "Tender result notification date",
      "Contract signing date",
      "L/C opening date",
      "Delivery / handover date",
    ];
  } else if (isTreasury && category === "Consultancy Services") {
    // 6.2 MoA Consultancy Treasury
    stageNames = [
      "Expression of Interest advertisement",
      "EOI evaluation",
      "Approval/no-objection on shortlist",
      "Invitation of shortlisted firms/individuals",
      "Proposal/tender opening",
      "Technical evaluation",
      "Approval of technical evaluation report",
      "No-objection",
      "Opening of financial proposals",
      "Combined/final evaluation",
      "Approval of evaluation report",
      "Negotiation",
      "Notification of intention to award",
      "Contract signing",
      "Assignment/work completion",
    ];
  } else if (method === "RFB - International" || method === "RFB - National") {
    // 6.3 RFB Template - STEP
    stageNames = [
      "Draft Pre-qualification Documents",
      "Specific Procurement Notice (prequalification)",
      "Opening / Minutes of Pre-qualification",
      "Pre-qualification Evaluation Report",
      "Draft Bidding Documents",
      "Specific Procurement Notice",
      "Bid Submission / Opening / Minutes",
      "Bid Evaluation Report and Recommendation for Award",
      "Notification of Intention of Award",
      "Signed Contract",
      "Contract Completion",
    ];
  } else if (method === "RFQ / Shopping") {
    // 6.4 RFQ / Shopping Template - STEP
    stageNames = [
      "Draft Request for Quotations",
      "Specific Procurement Notice",
      "Invitation to Supplier / Contractor",
      "Receive Quotations",
      "Comparison of Quotations",
      "Notification of Intention of Award",
      "Signed Contract",
      "Contract Completion",
    ];
  } else if (
    method === "Direct Procurement" ||
    method === "UN Agency / UNOPS Direct"
  ) {
    // 6.5 & 6.6 Direct Procurement / UN Agency - STEP
    stageNames = [
      "Justification for Direct Procurement",
      "Invitation to Supplier / Contractor / UN Agency",
      "Draft Contract",
      "Notification of Intention of Award",
      "Signed Contract",
      "Contract Completion",
    ];
  } else if (method === "QCBS" || method === "FBS" || method === "LCS") {
    // 6.7 QCBS / FBS / LCS Template - STEP
    stageNames = [
      "Terms of Reference",
      "Expression of Interest",
      "Evaluation of EOI & Short List of Consultants",
      "Short List and Draft Request for Proposals",
      "Opening of Technical Proposals / Minutes",
      "Evaluation of Technical Proposals",
      "Opening of Financial Proposals / Minutes",
      "Combined Evaluation Report and Draft Contract",
      "Notification of Intention of Award",
      "Signed Contract",
      "Contract Completion",
    ];
  } else if (method === "CQS") {
    // 6.8 CQS Template - STEP
    stageNames = [
      "Terms of Reference",
      "Expression of Interest",
      "Evaluation of EOI & Short List of Consultants",
      "Draft Negotiated Contract",
      "Notification of Intention of Award",
      "Signed Contract",
      "Contract Completion",
    ];
  } else if (method === "INDV") {
    // 6.9 Individual Consultant Template - STEP
    stageNames = [
      "Terms of Reference",
      "Expression of Interest",
      "Evaluation of EOI & Selection of Individual",
      "Draft Negotiated Contract",
      "Notification of Intention of Award",
      "Signed Contract",
      "Contract Completion",
    ];
  } else {
    stageNames = [
      "Procurement Notice / Invitation",
      "Bid Submission & Opening",
      "Evaluation & Recommendation",
      "Signed Contract",
      "Contract Completion",
    ];
  }

  return stageNames.map((name, idx) => ({
    id: `stage-${idx + 1}`,
    stageName: name,
    stageStatus: idx === 0 ? "In Progress" : "Not Started",
  }));
}

// Initial Mock Procurement Activities with complete 4-step data
export const INITIAL_ACTIVITIES: ProcurementActivity[] = [
  {
    id: "act-101",
    planId: "plan-1",
    planName: "BREFONS - Goods Procurement Plan - 2018 EFY",
    projectCode: "BREFONS",

    // Step 1 - Key Details
    category: "Goods",
    method: "RFB - National",
    specificMethod: "National Competitive Bidding (NCB)",
    marketApproach: "Open - National",
    qualificationApproach: "Post-qualification",
    domesticPreference: true,
    reviewType: "Prior",
    procurementProcess: "Single Stage One Envelope",
    evaluationOptions: "Lowest Evaluated Responsive Bid",
    highRiskSeaSh: false,
    procurementDocumentType: "Request for Bids SPD (Goods) - 1 envelope",
    requiresUnAgency: false,
    isInProcess: false,

    // Step 2 - Related Info
    activityRefNo: "ET-MoA-000001-GO-RFB",
    description:
      "Supply and delivery of 120 Units of Solar Powered Irrigation Pumps for Smallholder Farmers",
    estimatedAmount: 48000000,
    currency: "ETB",
    fundingSource: "African Development Bank (AfDB)",
    loanGrantNo: "P-Z1-C00-080",
    fundingAllocationPercent: 100,
    component: "Component 1: Climate Resilient Water Infrastructure",
    subcomponent: "1.2 Small-scale Irrigation Systems",
    componentAllocationPercent: 100,
    isLotRequired: true,
    lots: [
      {
        id: "lot-1",
        lotNumber: "Lot 1",
        lotDescription: "60 Solar Pumps for Oromia Region",
        estimatedAmount: 24000000,
      },
      {
        id: "lot-2",
        lotNumber: "Lot 2",
        lotDescription: "60 Solar Pumps for Somali & Afar Regions",
        estimatedAmount: 24000000,
      },
    ],
    invitationRefNo: "MoA/BREFONS/NCB/G/01/2018",
    scopeNotes:
      "Solar pumps ranging from 5kW to 15kW capacity complete with solar panel arrays.",
    comments: "High priority item for dry season irrigation.",

    // Step 3 - Additional Details
    classificationCode: "42100000",
    classificationDescription: "Agricultural & Irrigation Machinery",
    locationRegion: "FPCU / Federal & Regional Units",
    latitude: 9.0192,
    longitude: 38.7525,

    // Step 4 - Roadmap
    roadmap: generateRoadmapForMethod(
      "Goods",
      "RFB - National",
      "African Development Bank (AfDB)",
    ).map((st, i) => {
      if (i === 0)
        return {
          ...st,
          originalPlannedDate: "2025-08-15",
          plannedDurationDays: 30,
          revisedTargetDate: "2025-08-15",
          actualDate: "2025-08-15",
          stageStatus: "Completed",
          remarks: "SPN published in Herald newspaper",
        };
      if (i === 1)
        return {
          ...st,
          originalPlannedDate: "2025-09-25",
          plannedDurationDays: 45,
          revisedTargetDate: "2025-09-25",
          stageStatus: "In Progress",
        };
      if (i === 2)
        return {
          ...st,
          originalPlannedDate: "2025-10-20",
          plannedDurationDays: 15,
          revisedTargetDate: "2025-10-20",
        };
      return st;
    }),

    status: "In Execution",
    createdAt: "2025-07-15",
  },
  {
    id: "act-102",
    planId: "plan-1",
    planName: "BREFONS - Goods Procurement Plan - 2018 EFY",
    projectCode: "BREFONS",

    // Step 1
    category: "Goods",
    method: "RFQ / Shopping",
    marketApproach: "Shopping",
    qualificationApproach: "Not Applicable",
    domesticPreference: false,
    reviewType: "Post",
    requiresUnAgency: false,
    isInProcess: false,

    // Step 2
    activityRefNo: "ET-MoA-000002-GO-RFQ",
    description:
      "Procurement of Field Inspection Laptops and GPS Handheld Tracking Devices",
    estimatedAmount: 2500000,
    currency: "ETB",
    fundingSource: "African Development Bank (AfDB)",
    loanGrantNo: "P-Z1-C00-080",
    fundingAllocationPercent: 100,
    component: "Component 3: Institutional Capacity Building",
    subcomponent: "3.1 IT Infrastructure",
    componentAllocationPercent: 100,
    isLotRequired: false,
    comments: "Required for field extension officers.",

    // Step 3
    classificationCode: "43210000",
    classificationDescription: "Computer Equipment & Field Accessories",
    locationRegion: "FPCU / Federal",

    // Step 4
    roadmap: generateRoadmapForMethod(
      "Goods",
      "RFQ / Shopping",
      "African Development Bank (AfDB)",
    ),

    status: "Submitted to Director",
    createdAt: "2025-07-20",
  },
  {
    id: "act-103",
    planId: "plan-4",
    planName: "DRIVE - Consultancy Services Plan - 2018 EFY",
    projectCode: "DRIVE",

    // Step 1
    category: "Consultancy Services",
    method: "QCBS",
    marketApproach: "Open - International",
    qualificationApproach: "Not Applicable",
    domesticPreference: false,
    reviewType: "Prior",
    contractType: "Lump Sum",
    requiresUnAgency: false,
    isInProcess: false,

    // Step 2
    activityRefNo: "ET-MoA-000001-CS-QCBS",
    description:
      "Consultancy Services for Feasibility Study and Detailed Engineering Design of Regional Pastoral Water Infrastructure",
    estimatedAmount: 450000,
    currency: "USD",
    fundingSource: "World Bank (IDA)",
    loanGrantNo: "IDA-69200",
    fundingAllocationPercent: 100,
    component: "Component 2: De-risking Livestock Value Chains",
    componentAllocationPercent: 100,
    isLotRequired: false,
    scopeNotes:
      "International firm selection under World Bank Procurement Regulations.",

    // Step 3
    locationRegion: "Somali & Afar",

    // Step 4
    roadmap: generateRoadmapForMethod(
      "Consultancy Services",
      "QCBS",
      "World Bank (IDA)",
    ),

    status: "Submitted to Director",
    createdAt: "2025-08-01",
  },
  {
    id: "act-201",
    planId: "plan-2",
    planName: "BREFONS - Works Procurement Plan - 2018 EFY",
    projectCode: "BREFONS",

    // Step 1 - Key Details
    category: "Works",
    method: "RFB - National",
    specificMethod: "National Competitive Bidding (NCB)",
    marketApproach: "Open - National",
    qualificationApproach: "Post-qualification",
    domesticPreference: true,
    reviewType: "Prior",
    procurementProcess: "Single Stage One Envelope",
    evaluationOptions: "Lowest Evaluated Responsive Bid",
    highRiskSeaSh: false,
    procurementDocumentType: "Request for Bids SPD (Works) - 1 envelope",
    requiresUnAgency: false,
    isInProcess: false,

    // Step 2 - Related Info
    activityRefNo: "ET-MoA-000003-CW-RFB",
    description:
      "Construction of 4 Livestock Water Ponds and Solar Deep Well Systems in Borana Zone",
    estimatedAmount: 92000000,
    currency: "ETB",
    fundingSource: "African Development Bank (AfDB)",
    loanGrantNo: "P-Z1-C00-080",
    fundingAllocationPercent: 100,
    component: "Component 1: Climate Resilient Infrastructure",
    subcomponent: "1.1 Water Harvesting Systems",
    componentAllocationPercent: 100,
    isLotRequired: true,
    lots: [
      {
        id: "lot-201-1",
        lotNumber: "Lot 1",
        lotDescription: "2 Water Ponds in Yabelo Woreda",
        estimatedAmount: 46000000,
      },
      {
        id: "lot-201-2",
        lotNumber: "Lot 2",
        lotDescription: "2 Water Ponds in Dire Woreda",
        estimatedAmount: 46000000,
      },
    ],
    invitationRefNo: "MoA/BREFONS/NCB/W/02/2018",
    scopeNotes:
      "Excavation, geomembrane lining, solar pump installation, and cattle drinking troughs.",
    comments: "Critical water infrastructure for drought resilience.",

    // Step 3 - Additional Details
    classificationCode: "72140000",
    classificationDescription:
      "Heavy Construction & Civil Engineering Services",
    locationRegion: "Oromia",

    // Step 4 - Roadmap
    roadmap: generateRoadmapForMethod(
      "Works",
      "RFB - National",
      "African Development Bank (AfDB)",
    ).map((st, i) => {
      if (i === 0)
        return {
          ...st,
          originalPlannedDate: "2025-08-01",
          plannedDurationDays: 30,
          revisedTargetDate: "2025-08-01",
          actualDate: "2025-08-01",
          stageStatus: "Completed",
          remarks: "SPN published in Ethiopian Herald",
        };
      if (i === 1)
        return {
          ...st,
          originalPlannedDate: "2025-09-10",
          plannedDurationDays: 40,
          revisedTargetDate: "2025-09-10",
          stageStatus: "In Progress",
        };
      return st;
    }),

    status: "Submitted to Director",
    createdAt: "2025-08-01",
  },
  {
    id: "act-301",
    planId: "plan-3",
    planName: "BREFONS - Consultancy Services Plan - 2018 EFY",
    projectCode: "BREFONS",

    // Step 1 - Key Details
    category: "Consultancy Services",
    method: "QCBS",
    specificMethod: "Quality and Cost Based Selection (QCBS)",
    marketApproach: "Open - International",
    qualificationApproach: "Not Applicable",
    domesticPreference: false,
    reviewType: "Prior",
    contractType: "Lump Sum",
    requiresUnAgency: false,
    isInProcess: false,

    // Step 2 - Related Info
    activityRefNo: "ET-MoA-000004-CS-QCBS",
    description:
      "Consultancy Services for Environmental & Social Baseline Survey and Impact Assessment under BREFONS",
    estimatedAmount: 18500000,
    currency: "ETB",
    fundingSource: "African Development Bank (AfDB)",
    loanGrantNo: "P-Z1-C00-080",
    fundingAllocationPercent: 100,
    component: "Component 3: Institutional Strengthening",
    subcomponent: "3.2 Environmental Safeguards",
    componentAllocationPercent: 100,
    isLotRequired: false,
    invitationRefNo: "MoA/BREFONS/QCBS/CS/01/2018",
    scopeNotes:
      "Comprehensive ESIAS survey across Afar, Oromia, and Somali project target areas.",
    comments: "Required for World Bank & AfDB safeguard compliance.",

    // Step 3 - Additional Details
    classificationCode: "80100000",
    classificationDescription: "Management & Business Consulting Services",
    locationRegion: "FPCU / Federal",

    // Step 4 - Roadmap
    roadmap: generateRoadmapForMethod(
      "Consultancy Services",
      "QCBS",
      "African Development Bank (AfDB)",
    ).map((st, i) => {
      if (i === 0)
        return {
          ...st,
          originalPlannedDate: "2025-08-10",
          plannedDurationDays: 30,
          revisedTargetDate: "2025-08-10",
          stageStatus: "In Progress",
        };
      return st;
    }),

    status: "Submitted to Director",
    createdAt: "2025-08-10",
  },
  // ── Activities for Officer Plan: DRIVE - 2017 EFY Procurement Pipeline ──
  {
    id: "act-drive-2017-01",
    planId: "officer-DRIVE-PP-DRIVE-2017-01",
    planName: "2017 EFY Procurement Pipeline",
    projectCode: "DRIVE",

    category: "Goods",
    method: "RFB - International",
    specificMethod: "International Competitive Bidding (ICB)",
    marketApproach: "Open - International",
    qualificationApproach: "Prequalification",
    domesticPreference: false,
    reviewType: "Prior",
    procurementProcess: "Single Stage Two Envelope",
    evaluationOptions: "Lowest Evaluated Responsive Bid",
    highRiskSeaSh: false,
    procurementDocumentType: "Request for Bids SPD (Goods) - 2 envelope",
    requiresUnAgency: false,
    isInProcess: false,

    activityRefNo: "ET-MoA-000005-GO-ICB",
    description:
      "Procurement of Index-Based Livestock Insurance (IBLI) ICT Platform Hardware and Software Licenses",
    estimatedAmount: 35000000,
    currency: "ETB",
    fundingSource: "World Bank (IDA)",
    loanGrantNo: "IDA-69200",
    fundingAllocationPercent: 100,
    component: "Component 1: De-risking Pastoral Livelihoods",
    subcomponent: "1.3 IBLI Technology Platform",
    componentAllocationPercent: 100,
    isLotRequired: false,
    invitationRefNo: "MoA/DRIVE/ICB/G/01/2017",
    scopeNotes:
      "Server hardware, cloud licenses, mobile app development kits, and integration middleware.",
    comments: "Critical for IBLI Phase 2 rollout in Somali and Afar.",

    classificationCode: "43230000",
    classificationDescription: "Software & IT Infrastructure",
    locationRegion: "Somali",

    roadmap: generateRoadmapForMethod(
      "Goods",
      "RFB - International",
      "World Bank (IDA)",
    ).map((st, i) => {
      if (i === 0)
        return {
          ...st,
          originalPlannedDate: "2025-09-01",
          plannedDurationDays: 30,
          revisedTargetDate: "2025-09-01",
          stageStatus: "In Progress",
        };
      return st;
    }),

    status: "Submitted to Director",
    createdAt: "2025-08-20",
  },
  {
    id: "act-drive-2017-02",
    planId: "officer-DRIVE-PP-DRIVE-2017-01",
    planName: "2017 EFY Procurement Pipeline",
    projectCode: "DRIVE",

    category: "Goods",
    method: "RFQ / Shopping",
    marketApproach: "Shopping",
    qualificationApproach: "Not Applicable",
    domesticPreference: true,
    reviewType: "Post",
    requiresUnAgency: false,
    isInProcess: false,

    activityRefNo: "ET-MoA-000006-GO-RFQ",
    description:
      "Supply of 80 GPS-Enabled Livestock Movement Trackers and Solar Charging Stations",
    estimatedAmount: 4800000,
    currency: "ETB",
    fundingSource: "World Bank (IDA)",
    loanGrantNo: "IDA-69200",
    fundingAllocationPercent: 100,
    component: "Component 2: Value Chain Enhancement",
    subcomponent: "2.1 Market Information Systems",
    componentAllocationPercent: 100,
    isLotRequired: false,
    comments: "For community-based livestock market intelligence.",

    classificationCode: "43211500",
    classificationDescription: "Tracking & Navigation Devices",
    locationRegion: "Afar",

    roadmap: generateRoadmapForMethod(
      "Goods",
      "RFQ / Shopping",
      "World Bank (IDA)",
    ),

    status: "Submitted to Director",
    createdAt: "2025-08-22",
  },
  {
    id: "act-drive-2017-03",
    planId: "officer-DRIVE-PP-DRIVE-2017-01",
    planName: "2017 EFY Procurement Pipeline",
    projectCode: "DRIVE",

    category: "Goods",
    method: "RFB - National",
    specificMethod: "National Competitive Bidding (NCB)",
    marketApproach: "Open - National",
    qualificationApproach: "Post-qualification",
    domesticPreference: true,
    reviewType: "Prior",
    requiresUnAgency: false,
    isInProcess: false,

    activityRefNo: "ET-MoA-000007-GO-NCB",
    description:
      "Procurement of Veterinary Cold Chain Equipment and Mobile Diagnostic Laboratory Kits",
    estimatedAmount: 28000000,
    currency: "ETB",
    fundingSource: "World Bank (IDA)",
    loanGrantNo: "IDA-69200",
    fundingAllocationPercent: 100,
    component: "Component 3: Animal Health Services",
    subcomponent: "3.1 Cold Chain Strengthening",
    componentAllocationPercent: 100,
    isLotRequired: true,
    lots: [
      {
        id: "lot-d17-1",
        lotNumber: "Lot 1",
        lotDescription: "Cold chain refrigerators and freezers",
        estimatedAmount: 16000000,
      },
      {
        id: "lot-d17-2",
        lotNumber: "Lot 2",
        lotDescription: "Mobile diagnostic lab kits",
        estimatedAmount: 12000000,
      },
    ],
    invitationRefNo: "MoA/DRIVE/NCB/G/02/2017",
    scopeNotes: "Solar-powered cold chain units suitable for pastoral areas.",

    classificationCode: "41100000",
    classificationDescription: "Laboratory & Scientific Equipment",
    locationRegion: "Somali",

    roadmap: generateRoadmapForMethod(
      "Goods",
      "RFB - National",
      "World Bank (IDA)",
    ).map((st, i) => {
      if (i === 0)
        return {
          ...st,
          originalPlannedDate: "2025-08-15",
          plannedDurationDays: 30,
          revisedTargetDate: "2025-08-15",
          actualDate: "2025-08-15",
          stageStatus: "Completed",
          remarks: "SPN published in national newspaper",
        };
      if (i === 1)
        return {
          ...st,
          originalPlannedDate: "2025-10-01",
          plannedDurationDays: 45,
          revisedTargetDate: "2025-10-01",
          stageStatus: "In Progress",
        };
      return st;
    }),

    status: "Submitted to Director",
    createdAt: "2025-08-15",
  },
  // ── Activities for Officer Plan: BREFONS - 2017 EFY Regional Procurement Plan ──
  {
    id: "act-brefons-2017-01",
    planId: "officer-PRJ-24-042-PP-BREFONS-2017-01",
    planName: "2017 EFY Regional Procurement Plan",
    projectCode: "PRJ-24-042",

    category: "Works",
    method: "RFB - National",
    specificMethod: "National Competitive Bidding (NCB)",
    marketApproach: "Open - National",
    qualificationApproach: "Post-qualification",
    domesticPreference: true,
    reviewType: "Prior",
    procurementProcess: "Single Stage One Envelope",
    evaluationOptions: "Lowest Evaluated Responsive Bid",
    highRiskSeaSh: false,
    procurementDocumentType: "Request for Bids SPD (Works) - 1 envelope",
    requiresUnAgency: false,
    isInProcess: false,

    activityRefNo: "ET-MoA-000008-CW-NCB",
    description:
      "Construction of 3 Seed Processing & Treating Facilities in Oromia and Southwest Ethiopia",
    estimatedAmount: 45000000,
    currency: "ETB",
    fundingSource: "African Development Bank (AfDB)",
    loanGrantNo: "2100155041683",
    fundingAllocationPercent: 100,
    component: "Component 2: Agricultural Productivity Enhancement",
    subcomponent: "2.2 Seed System Development",
    componentAllocationPercent: 100,
    isLotRequired: true,
    lots: [
      {
        id: "lot-b17-1",
        lotNumber: "Lot 1",
        lotDescription: "2 Facilities in Oromia Region",
        estimatedAmount: 30000000,
      },
      {
        id: "lot-b17-2",
        lotNumber: "Lot 2",
        lotDescription: "1 Facility in Southwest Ethiopia",
        estimatedAmount: 15000000,
      },
    ],
    invitationRefNo: "MoA/BREFONS/NCB/W/03/2017",
    scopeNotes:
      "Steel-frame structures with seed cleaning, treating, and packaging lines.",
    comments: "Critical infrastructure for improved seed distribution network.",

    classificationCode: "72140000",
    classificationDescription:
      "Heavy Construction & Civil Engineering Services",
    locationRegion: "Oromia",

    roadmap: generateRoadmapForMethod(
      "Works",
      "RFB - National",
      "African Development Bank (AfDB)",
    ).map((st, i) => {
      if (i === 0)
        return {
          ...st,
          originalPlannedDate: "2025-08-20",
          plannedDurationDays: 30,
          revisedTargetDate: "2025-08-20",
          actualDate: "2025-08-20",
          stageStatus: "Completed",
          remarks: "SPN published in Ethiopian Herald",
        };
      if (i === 1)
        return {
          ...st,
          originalPlannedDate: "2025-09-25",
          plannedDurationDays: 40,
          revisedTargetDate: "2025-09-25",
          stageStatus: "In Progress",
        };
      return st;
    }),

    status: "Submitted to Director",
    createdAt: "2025-08-20",
  },
  {
    id: "act-brefons-2017-02",
    planId: "officer-PRJ-24-042-PP-BREFONS-2017-01",
    planName: "2017 EFY Regional Procurement Plan",
    projectCode: "PRJ-24-042",

    category: "Works",
    method: "RFQ / Shopping",
    marketApproach: "Shopping",
    qualificationApproach: "Not Applicable",
    domesticPreference: true,
    reviewType: "Post",
    requiresUnAgency: false,
    isInProcess: false,

    activityRefNo: "ET-MoA-000009-CW-RFQ",
    description:
      "Rehabilitation of 6 Rural Feeder Roads Connecting Agricultural Collection Centers in South Ethiopia",
    estimatedAmount: 12000000,
    currency: "ETB",
    fundingSource: "African Development Bank (AfDB)",
    loanGrantNo: "2100155041683",
    fundingAllocationPercent: 100,
    component: "Component 1: Market Access Infrastructure",
    subcomponent: "1.2 Rural Roads Rehabilitation",
    componentAllocationPercent: 100,
    isLotRequired: false,
    invitationRefNo: "MoA/BREFONS/RFQ/W/01/2017",
    scopeNotes:
      "Gravel surfacing, drainage structures, and culvert installation.",

    classificationCode: "72141000",
    classificationDescription: "Road Construction & Rehabilitation",
    locationRegion: "South Ethiopia",

    roadmap: generateRoadmapForMethod(
      "Works",
      "RFQ / Shopping",
      "African Development Bank (AfDB)",
    ),

    status: "Submitted to Director",
    createdAt: "2025-08-22",
  },
  {
    id: "act-brefons-2017-03",
    planId: "officer-PRJ-24-042-PP-BREFONS-2017-01",
    planName: "2017 EFY Regional Procurement Plan",
    projectCode: "PRJ-24-042",

    category: "Works",
    method: "Direct Procurement",
    specificMethod: "Direct Contracting",
    marketApproach: "Direct",
    qualificationApproach: "Not Applicable",
    domesticPreference: false,
    reviewType: "Prior",
    requiresUnAgency: false,
    isInProcess: true,

    activityRefNo: "ET-MoA-000010-CW-DC",
    description:
      "Emergency Repair of Flood-Damaged Irrigation Canal in Afar Region",
    estimatedAmount: 8500000,
    currency: "ETB",
    fundingSource: "African Development Bank (AfDB)",
    loanGrantNo: "2100155041683",
    fundingAllocationPercent: 100,
    component: "Component 1: Climate Resilient Infrastructure",
    subcomponent: "1.1 Irrigation Rehabilitation",
    componentAllocationPercent: 100,
    isLotRequired: false,
    scopeNotes:
      "Urgent canal repair following flash flood damage in July 2025.",
    comments: "Direct selection justified by emergency nature of the work.",

    classificationCode: "72140000",
    classificationDescription: "Civil Engineering Emergency Works",
    locationRegion: "Afar",

    roadmap: generateRoadmapForMethod(
      "Works",
      "Direct Procurement",
      "African Development Bank (AfDB)",
    ).map((st, i) => {
      if (i === 0)
        return {
          ...st,
          originalPlannedDate: "2025-08-05",
          plannedDurationDays: 14,
          revisedTargetDate: "2025-08-05",
          actualDate: "2025-08-05",
          stageStatus: "Completed",
          remarks: "Justification approved by AfDB",
        };
      if (i === 1)
        return {
          ...st,
          originalPlannedDate: "2025-08-20",
          plannedDurationDays: 21,
          revisedTargetDate: "2025-08-20",
          actualDate: "2025-08-20",
          stageStatus: "Completed",
        };
      if (i === 2)
        return {
          ...st,
          originalPlannedDate: "2025-09-15",
          plannedDurationDays: 30,
          revisedTargetDate: "2025-09-15",
          stageStatus: "In Progress",
        };
      return st;
    }),

    status: "Submitted to Director",
    createdAt: "2025-08-05",
  },
];

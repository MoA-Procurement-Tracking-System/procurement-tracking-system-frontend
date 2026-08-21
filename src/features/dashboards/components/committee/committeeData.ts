export type PriorityLevel = "URGENT" | "HIGH" | "NORMAL";

export type CommitteeVoteStatus = "Approved" | "Rejected" | "Pending";

export interface CommitteeMemberVote {
  id: string;
  name: string;
  roleTitle: string;
  isCurrentUser?: boolean;
  voteStatus: CommitteeVoteStatus;
  comment?: string;
  votedAt?: string;
}

export interface DemoCommitteeMember {
  id: string;
  name: string;
  roleTitle: string;
  department: string;
}

export const DEMO_COMMITTEE_MEMBERS: DemoCommitteeMember[] = [
  {
    id: "m-1",
    name: "W/ro Gennet Zewde",
    roleTitle: "Finance & Procurement Lead",
    department: "Finance & Procurement Directorate",
  },
  {
    id: "m-2",
    name: "Ato Solomon Tadesse",
    roleTitle: "Management Committee Chair",
    department: "Executive Management",
  },
  {
    id: "m-3",
    name: "Dr. Berhanu Hailu",
    roleTitle: "Director General (Technical)",
    department: "Technical Operations",
  },
  {
    id: "m-4",
    name: "Ato Yared Worku",
    roleTitle: "Legal & Compliance Officer",
    department: "Legal Affairs Directorate",
  },
  {
    id: "m-5",
    name: "Ato Dawit Alemu",
    roleTitle: "Monitoring & Evaluation Specialist",
    department: "M&E Directorate",
  },
];

export interface PlanActivityItem {
  id: string;
  activityCode: string;
  description: string;
  category: string;
  unit: string;
  quantity: number;
  estimatedCostETB: number;
  procurementMethod: string;
  targetDate: string;
}

export interface CommitteePlan {
  id: string;
  planNumber: string;
  planName: string;
  projectCode: string;
  projectName: string;
  priority: PriorityLevel;
  category: string;
  budgetYear: string;
  totalBudgetETB: number;
  officerName: string;
  submittedByDirectorAt: string;
  directorName: string;
  status: "Committee Review" | "Finally Approved" | "Rejected";
  activitiesCount: number;
  activities: PlanActivityItem[];
  memberVotes: CommitteeMemberVote[];
}

export interface PlanArrivalAlert {
  id: string;
  planId: string;
  planNumber: string;
  planName: string;
  projectCode: string;
  priority: PriorityLevel;
  arrivedAt: string;
  deadline: string;
  message: string;
}

export const INITIAL_COMMITTEE_PLANS: CommitteePlan[] = [
  {
    id: "cp-101",
    planNumber: "MoA/BREFONS/2018/CP-01",
    planName: "2018 EFY BREFONS Hydro-Meteorological & Seed Station Goods Plan",
    projectCode: "BREFONS",
    projectName:
      "Program to Build Resilience for Food Security & Livelihoods (BREFONS)",
    priority: "URGENT",
    category: "Goods",
    budgetYear: "2018 EFY",
    totalBudgetETB: 48500000,
    officerName: "Demelash Worku (Senior Procurement Officer)",
    submittedByDirectorAt: "2026-08-18 09:30 AM",
    directorName: "Dr. Kebede Tesfaye (Director General)",
    status: "Committee Review",
    activitiesCount: 4,
    activities: [
      {
        id: "act-1",
        activityCode: "BREF-GD-01",
        description: "Supply of automatic weather monitoring stations",
        category: "Goods",
        unit: "Set",
        quantity: 12,
        estimatedCostETB: 18000000,
        procurementMethod: "Open International Competitive Bidding (ICB)",
        targetDate: "2026-11-15",
      },
      {
        id: "act-2",
        activityCode: "BREF-GD-02",
        description: "Mobile seed cleaner & seed treating equipment",
        category: "Goods",
        unit: "Unit",
        quantity: 8,
        estimatedCostETB: 15500000,
        procurementMethod: "National Competitive Bidding (NCB)",
        targetDate: "2026-12-01",
      },
      {
        id: "act-3",
        activityCode: "BREF-GD-03",
        description: "Solar powered deep-well pump assemblies",
        category: "Goods",
        unit: "Set",
        quantity: 20,
        estimatedCostETB: 11000000,
        procurementMethod: "NCB",
        targetDate: "2026-10-30",
      },
      {
        id: "act-4",
        activityCode: "BREF-GD-04",
        description: "Field tablet computers for data collection",
        category: "Goods",
        unit: "Pcs",
        quantity: 50,
        estimatedCostETB: 4000000,
        procurementMethod: "Request for Quotations (RFQ)",
        targetDate: "2026-09-25",
      },
    ],
    memberVotes: [
      {
        id: "m-1",
        name: "W/ro Gennet Zewde",
        roleTitle: "Finance & Procurement Lead",
        isCurrentUser: true,
        voteStatus: "Pending",
      },
      {
        id: "m-2",
        name: "Ato Solomon Tadesse",
        roleTitle: "Management Committee Chair",
        voteStatus: "Approved",
        comment:
          "High priority climate resilience equipment. Technical specs verified.",
        votedAt: "2026-08-18 02:15 PM",
      },
      {
        id: "m-3",
        name: "Dr. Berhanu Hailu",
        roleTitle: "Director General (Technical)",
        voteStatus: "Approved",
        comment:
          "Aligned with 2018 EFY drought mitigation targets. Budget verified.",
        votedAt: "2026-08-18 03:40 PM",
      },
      {
        id: "m-4",
        name: "Ato Yared Worku",
        roleTitle: "Legal & Compliance Officer",
        voteStatus: "Approved",
        comment: "Standard AfDB tender documents compliant.",
        votedAt: "2026-08-19 10:10 AM",
      },
      {
        id: "m-5",
        name: "Ato Dawit Alemu",
        roleTitle: "Monitoring & Evaluation Specialist",
        voteStatus: "Pending",
      },
    ],
  },
  {
    id: "cp-102",
    planNumber: "MoA/DRIVE/2018/CP-02",
    planName: "2018 EFY DRIVE Pastoral Insurance & Market Tech Plan",
    projectCode: "DRIVE",
    projectName:
      "De-Risking, Inclusion and Value Enhancement in Pastoral Economies (DRIVE)",
    priority: "HIGH",
    category: "Goods & Consultancy",
    budgetYear: "2018 EFY",
    totalBudgetETB: 32000000,
    officerName: "W/ro Tigist Haile (Procurement Specialist)",
    submittedByDirectorAt: "2026-08-17 11:00 AM",
    directorName: "Dr. Kebede Tesfaye (Director General)",
    status: "Committee Review",
    activitiesCount: 3,
    activities: [
      {
        id: "act-5",
        activityCode: "DRIVE-CS-01",
        description: "Index livestock insurance digital software platform",
        category: "Consultancy Services",
        unit: "System",
        quantity: 1,
        estimatedCostETB: 14000000,
        procurementMethod: "Quality and Cost-Based Selection (QCBS)",
        targetDate: "2026-11-30",
      },
      {
        id: "act-6",
        activityCode: "DRIVE-GD-02",
        description: "Handheld biometric livestock scanner terminals",
        category: "Goods",
        unit: "Pcs",
        quantity: 150,
        estimatedCostETB: 12000000,
        procurementMethod: "NCB",
        targetDate: "2026-10-15",
      },
      {
        id: "act-7",
        activityCode: "DRIVE-NC-03",
        description: "Pastoralist user training and sensitization events",
        category: "Non-Consulting Services",
        unit: "Workshop",
        quantity: 12,
        estimatedCostETB: 6000000,
        procurementMethod: "RFQ",
        targetDate: "2026-09-30",
      },
    ],
    memberVotes: [
      {
        id: "m-1",
        name: "W/ro Gennet Zewde",
        roleTitle: "Finance & Procurement Lead",
        isCurrentUser: true,
        voteStatus: "Approved",
        comment:
          "Budget source World Bank IDA grant verified. Cost allocation clear.",
        votedAt: "2026-08-17 04:30 PM",
      },
      {
        id: "m-2",
        name: "Ato Solomon Tadesse",
        roleTitle: "Management Committee Chair",
        voteStatus: "Approved",
        comment: "Endorsed for regional deployment.",
        votedAt: "2026-08-17 02:00 PM",
      },
      {
        id: "m-3",
        name: "Dr. Berhanu Hailu",
        roleTitle: "Director General (Technical)",
        voteStatus: "Approved",
        comment: "Biometric specs meet pastoral registry criteria.",
        votedAt: "2026-08-17 03:15 PM",
      },
      {
        id: "m-4",
        name: "Ato Yared Worku",
        roleTitle: "Legal & Compliance Officer",
        voteStatus: "Approved",
        comment: "World Bank legal clearance attached.",
        votedAt: "2026-08-18 09:00 AM",
      },
      {
        id: "m-5",
        name: "Ato Dawit Alemu",
        roleTitle: "Monitoring & Evaluation Specialist",
        voteStatus: "Approved",
        comment: "M&E indicators clear and measurable.",
        votedAt: "2026-08-18 11:20 AM",
      },
    ],
  },
  {
    id: "cp-103",
    planNumber: "MoA/FSRP/2018/CP-03",
    planName: "2018 EFY FSRP Grain Silos & Storage Infrastructure Plan",
    projectCode: "FSRP",
    projectName: "Food Systems Resilience Program (FSRP)",
    priority: "URGENT",
    category: "Works",
    budgetYear: "2018 EFY",
    totalBudgetETB: 75000000,
    officerName: "Ato Taddese Alemayehu (Procurement Officer)",
    submittedByDirectorAt: "2026-08-19 08:15 AM",
    directorName: "Ato Demeke Mekonnen (Director)",
    status: "Committee Review",
    activitiesCount: 2,
    activities: [
      {
        id: "act-8",
        activityCode: "FSRP-WK-01",
        description: "Construction of 5 regional steel grain storage silos",
        category: "Works",
        unit: "Site",
        quantity: 5,
        estimatedCostETB: 60000000,
        procurementMethod: "ICB",
        targetDate: "2027-04-30",
      },
      {
        id: "act-9",
        activityCode: "FSRP-CS-02",
        description: "Construction supervision & engineering consultancy",
        category: "Consultancy Services",
        unit: "Contract",
        quantity: 1,
        estimatedCostETB: 15000000,
        procurementMethod: "QCBS",
        targetDate: "2026-10-31",
      },
    ],
    memberVotes: [
      {
        id: "m-1",
        name: "W/ro Gennet Zewde",
        roleTitle: "Finance & Procurement Lead",
        isCurrentUser: true,
        voteStatus: "Pending",
      },
      {
        id: "m-2",
        name: "Ato Solomon Tadesse",
        roleTitle: "Management Committee Chair",
        voteStatus: "Approved",
        comment: "Critical storage capacity for post-harvest loss prevention.",
        votedAt: "2026-08-19 11:00 AM",
      },
      {
        id: "m-3",
        name: "Dr. Berhanu Hailu",
        roleTitle: "Director General (Technical)",
        voteStatus: "Pending",
      },
      {
        id: "m-4",
        name: "Ato Yared Worku",
        roleTitle: "Legal & Compliance Officer",
        voteStatus: "Pending",
      },
      {
        id: "m-5",
        name: "Ato Dawit Alemu",
        roleTitle: "Monitoring & Evaluation Specialist",
        voteStatus: "Pending",
      },
    ],
  },
  {
    id: "cp-104",
    planNumber: "MoA/MECH/2018/CP-04",
    planName: "2018 EFY Mechanization Machinery Import Package Plan",
    projectCode: "FSRP",
    projectName: "Food Systems Resilience Program (FSRP)",
    priority: "NORMAL",
    category: "Goods",
    budgetYear: "2018 EFY",
    totalBudgetETB: 55000000,
    officerName: "Demelash Worku (Senior Procurement Officer)",
    submittedByDirectorAt: "2026-08-15 02:00 PM",
    directorName: "Ato Demeke Mekonnen (Director)",
    status: "Rejected",
    activitiesCount: 2,
    activities: [
      {
        id: "act-10",
        activityCode: "MECH-GD-01",
        description: "Heavy duty wheeled tractors (120 HP)",
        category: "Goods",
        unit: "Unit",
        quantity: 15,
        estimatedCostETB: 40000000,
        procurementMethod: "ICB",
        targetDate: "2026-12-15",
      },
      {
        id: "act-11",
        activityCode: "MECH-GD-02",
        description: "Combine harvester attachments & spare kits",
        category: "Goods",
        unit: "Set",
        quantity: 5,
        estimatedCostETB: 15000000,
        procurementMethod: "NCB",
        targetDate: "2026-11-20",
      },
    ],
    memberVotes: [
      {
        id: "m-1",
        name: "W/ro Gennet Zewde",
        roleTitle: "Finance & Procurement Lead",
        isCurrentUser: true,
        voteStatus: "Rejected",
        comment:
          "Unit price estimates exceed standard ministry price threshold by 35%. Requires cost justification.",
        votedAt: "2026-08-16 10:30 AM",
      },
      {
        id: "m-2",
        name: "Ato Solomon Tadesse",
        roleTitle: "Management Committee Chair",
        voteStatus: "Rejected",
        comment: "After-sales maintenance guarantee missing from tender spec.",
        votedAt: "2026-08-16 11:15 AM",
      },
      {
        id: "m-3",
        name: "Dr. Berhanu Hailu",
        roleTitle: "Director General (Technical)",
        voteStatus: "Rejected",
        comment:
          "Tractor horsepower specifications do not match regional soil requirements.",
        votedAt: "2026-08-16 02:00 PM",
      },
      {
        id: "m-4",
        name: "Ato Yared Worku",
        roleTitle: "Legal & Compliance Officer",
        voteStatus: "Approved",
        comment: "Legal format acceptable.",
        votedAt: "2026-08-16 03:10 PM",
      },
      {
        id: "m-5",
        name: "Ato Dawit Alemu",
        roleTitle: "Monitoring & Evaluation Specialist",
        voteStatus: "Rejected",
        comment:
          "Implementation timeline unrealistic given international shipping constraints.",
        votedAt: "2026-08-16 04:45 PM",
      },
    ],
  },
  {
    id: "cp-105",
    planNumber: "MoA/CALM/2018/CP-05",
    planName: "2018 EFY CALM Watershed Landscape Management Plan",
    projectCode: "CALM",
    projectName: "Climate Action through Landscape Management (CALM)",
    priority: "HIGH",
    category: "Works & Goods",
    budgetYear: "2018 EFY",
    totalBudgetETB: 42000000,
    officerName: "W/ro Tigist Haile (Procurement Specialist)",
    submittedByDirectorAt: "2026-08-14 10:00 AM",
    directorName: "Dr. Kebede Tesfaye (Director General)",
    status: "Finally Approved",
    activitiesCount: 3,
    activities: [
      {
        id: "act-12",
        activityCode: "CALM-WK-01",
        description: "Terracing & micro-basin watershed structures",
        category: "Works",
        unit: "Hectare",
        quantity: 2500,
        estimatedCostETB: 22000000,
        procurementMethod: "Community Procurement",
        targetDate: "2026-11-01",
      },
      {
        id: "act-13",
        activityCode: "CALM-GD-02",
        description: "Tree nursery tools, polythene bags and seeds",
        category: "Goods",
        unit: "Lot",
        quantity: 10,
        estimatedCostETB: 12000000,
        procurementMethod: "NCB",
        targetDate: "2026-09-15",
      },
      {
        id: "act-14",
        activityCode: "CALM-CS-03",
        description: "GIS watershed mapping & satellite monitoring survey",
        category: "Consultancy Services",
        unit: "Contract",
        quantity: 1,
        estimatedCostETB: 8000000,
        procurementMethod:
          "Selection Based on Consultants' Qualifications (CQS)",
        targetDate: "2026-10-10",
      },
    ],
    memberVotes: [
      {
        id: "m-1",
        name: "W/ro Gennet Zewde",
        roleTitle: "Finance & Procurement Lead",
        isCurrentUser: true,
        voteStatus: "Approved",
        comment: "Treasury co-financing match confirmed. Plan fully endorsed.",
        votedAt: "2026-08-15 09:15 AM",
      },
      {
        id: "m-2",
        name: "Ato Solomon Tadesse",
        roleTitle: "Management Committee Chair",
        voteStatus: "Approved",
        comment: "Unanimous approval for climate landscape activities.",
        votedAt: "2026-08-14 03:00 PM",
      },
      {
        id: "m-3",
        name: "Dr. Berhanu Hailu",
        roleTitle: "Director General (Technical)",
        voteStatus: "Approved",
        comment: "Technical environmental rating verified.",
        votedAt: "2026-08-14 04:30 PM",
      },
      {
        id: "m-4",
        name: "Ato Yared Worku",
        roleTitle: "Legal & Compliance Officer",
        voteStatus: "Approved",
        comment: "Community procurement manual compliant.",
        votedAt: "2026-08-15 08:30 AM",
      },
      {
        id: "m-5",
        name: "Ato Dawit Alemu",
        roleTitle: "Monitoring & Evaluation Specialist",
        voteStatus: "Approved",
        comment: "Terracing spatial targets aligned with ministry GTP3.",
        votedAt: "2026-08-15 09:00 AM",
      },
    ],
  },
];

export const INITIAL_PLAN_ALERTS: PlanArrivalAlert[] = [
  {
    id: "alt-1",
    planId: "cp-101",
    planNumber: "MoA/BREFONS/2018/CP-01",
    planName: "2018 EFY BREFONS Hydro-Meteorological & Seed Station Goods Plan",
    projectCode: "BREFONS",
    priority: "URGENT",
    arrivedAt: "2026-08-18 09:30 AM",
    deadline: "2026-08-22 (48h remaining)",
    message:
      "URGENT ARRIVAL: Sent by Director General Dr. Kebede. Prepared by Demelash Worku.",
  },
  {
    id: "alt-2",
    planId: "cp-103",
    planNumber: "MoA/FSRP/2018/CP-03",
    planName: "2018 EFY FSRP Grain Silos & Storage Infrastructure Plan",
    projectCode: "FSRP",
    priority: "URGENT",
    arrivedAt: "2026-08-19 08:15 AM",
    deadline: "2026-08-24 (72h remaining)",
    message:
      "URGENT ARRIVAL: Forwarded by Director Ato Demeke. Prepared by Ato Taddese Alemayehu.",
  },
  {
    id: "alt-3",
    planId: "cp-102",
    planNumber: "MoA/DRIVE/2018/CP-02",
    planName: "2018 EFY DRIVE Pastoral Insurance & Market Tech Plan",
    projectCode: "DRIVE",
    priority: "HIGH",
    arrivedAt: "2026-08-17 11:00 AM",
    deadline: "2026-08-25",
    message: "Arrived plan from Director. Prepared by W/ro Tigist Haile.",
  },
];

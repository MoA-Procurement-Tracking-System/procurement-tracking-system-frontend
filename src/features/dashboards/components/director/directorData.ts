export interface DirectorPlan {
  id: string;
  title: string;
  directorate: string;
  submittedBy: string;
  submissionDate: string;
  status: "Awaiting Review" | "Approved" | "Returned for Revision" | "Rejected";
  totalActivitiesCount: number;
  estimatedBudgetETB: number;
  description: string;
  activities: {
    id: string;
    activityName: string;
    estimatedCostETB: number;
    procurementMethod: string;
    plannedStartDate: string;
    plannedEndDate: string;
    status: string;
  }[];
}

export interface CriticalDelay {
  id: string;
  activityTitle: string;
  fullTitle: string;
  directorate: string;
  delayDetail: string;
  stageName: string;
  daysOverdue: number;
  status: "Delayed" | "Expedited" | "Resolved";
  assignedOfficer: string;
  plannedCompletionDate: string;
  currentBottleneck: string;
}

export const INITIAL_DIRECTOR_PLANS: DirectorPlan[] = [
  {
    id: "plan-2018-01",
    title: "2018 EFY Climate Action Landscape Restoration Plan",
    directorate: "Natural Resources & Climate Change",
    submittedBy: "Demelash Worku",
    submissionDate: "2026-08-10",
    status: "Awaiting Review",
    totalActivitiesCount: 4,
    estimatedBudgetETB: 18500000,
    description:
      "Multi-regional landscape restoration, tree nursery infrastructure establishment, and soil erosion control equipment procurement for EFY 2018.",
    activities: [
      {
        id: "act-101",
        activityName:
          "Construction of Central Tree Seed Nursery Infrastructure & Verification",
        estimatedCostETB: 8200000,
        procurementMethod: "National Competitive Bidding (NCB)",
        plannedStartDate: "2026-06-01",
        plannedEndDate: "2026-07-20",
        status: "Bid Evaluation Overdue",
      },
      {
        id: "act-102",
        activityName:
          "Procurement of Watershed Terracing Heavy Equipment & Hand Tools",
        estimatedCostETB: 5400000,
        procurementMethod: "National Competitive Bidding (NCB)",
        plannedStartDate: "2026-08-01",
        plannedEndDate: "2026-09-30",
        status: "Pending Plan Approval",
      },
      {
        id: "act-103",
        activityName:
          "GIS Mapping Software & Drones for Forest Canopy Surveillance",
        estimatedCostETB: 4900000,
        procurementMethod: "International Competitive Bidding (ICB)",
        plannedStartDate: "2026-08-15",
        plannedEndDate: "2026-11-15",
        status: "Pending Plan Approval",
      },
    ],
  },
  {
    id: "plan-2018-02",
    title: "2018 EFY Pastoral Fodder Reserve & Feed Storage Plan",
    directorate: "Livestock & Pastoral Development",
    submittedBy: "Abebe Kebede",
    submissionDate: "2026-08-12",
    status: "Awaiting Review",
    totalActivitiesCount: 3,
    estimatedBudgetETB: 24000000,
    description:
      "Emergency drought mitigation procurement including heavy-duty hay balers, silage storage facilities, and veterinary drug distribution.",
    activities: [
      {
        id: "act-201",
        activityName:
          "Supply of Heavy Duty Hay Balers & Silage Storage Machinery for Lowland Cooperatives",
        estimatedCostETB: 14500000,
        procurementMethod: "International Competitive Bidding (ICB)",
        plannedStartDate: "2026-07-10",
        plannedEndDate: "2026-08-05",
        status: "Advertisement Floating Stage Delayed",
      },
      {
        id: "act-202",
        activityName:
          "Veterinary Antibiotics & Vaccine Storage Cold Chain Containers",
        estimatedCostETB: 9500000,
        procurementMethod: "National Competitive Bidding (NCB)",
        plannedStartDate: "2026-08-20",
        plannedEndDate: "2026-10-30",
        status: "Pending Plan Approval",
      },
    ],
  },
];

export const INITIAL_CRITICAL_DELAYS: CriticalDelay[] = [
  {
    id: "delay-01",
    activityTitle:
      "Construction of Central Tree Seed Nursery Infrastructure & Ver...",
    fullTitle:
      "Construction of Central Tree Seed Nursery Infrastructure & Verification Facilities",
    directorate: "Natural Resources & Climate Change",
    delayDetail: "Overdue by 28 days on Bid Evaluation stage",
    stageName: "Bid Evaluation & Technical Scoring",
    daysOverdue: 28,
    status: "Delayed",
    assignedOfficer: "Demelash Worku",
    plannedCompletionDate: "2026-07-20",
    currentBottleneck:
      "Technical evaluation committee quorum missing signatures for 2 tenderers.",
  },
  {
    id: "delay-02",
    activityTitle:
      "Supply of Heavy Duty Hay Balers & Silage Storage Machinery f...",
    fullTitle:
      "Supply of Heavy Duty Hay Balers & Silage Storage Machinery for Lowland Cooperatives",
    directorate: "Livestock & Pastoral Development",
    delayDetail: "Delayed advertisement floating stage",
    stageName: "Tender Document & Advertisement Publication",
    daysOverdue: 14,
    status: "Delayed",
    assignedOfficer: "Abebe Kebede",
    plannedCompletionDate: "2026-08-05",
    currentBottleneck:
      "Spec clarification requested by international bidders pending translation.",
  },
];

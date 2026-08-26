import {
  activityReferenceFor,
  procurementMethodOptions,
  roadmapForMethod,
  type ProcurementMethodKey,
} from "./procurementActivityConfig";
import type {
  OfficerProject,
  ProcurementCategory,
  ProcurementPlanSummary,
} from "./officerProjects";
import type {
  ProcurementActivityFormValues,
  ProcurementActivityRoadmapStage,
  ProcurementActivitySummary,
} from "./officerActivityDrafts";
import {
  formatEthiopianDate,
  gregorianToEthiopian,
} from "../utils/ethiopianCalendar";

type ActivityStatus = ProcurementActivitySummary["status"];

interface ActivityTemplate {
  amount: number;
  description: string;
  methodCode: "CQS" | "LCS" | "QCBS" | "RFB" | "RFQ";
}

const activityTemplates: Record<
  ProcurementCategory,
  readonly ActivityTemplate[]
> = {
  "Consultancy Services": [
    {
      amount: 3_200_000,
      description: "Consultancy for Soil Quality & Health Assessment",
      methodCode: "QCBS",
    },
    {
      amount: 2_850_000,
      description: "Feasibility Study for Livestock Market Linkage Hubs",
      methodCode: "CQS",
    },
    {
      amount: 1_950_000,
      description: "Environmental and Social Impact Compliance Audit",
      methodCode: "LCS",
    },
    {
      amount: 2_400_000,
      description: "Design of Regional Digital Agriculture & M&E Framework",
      methodCode: "QCBS",
    },
    {
      amount: 1_650_000,
      description: "Capacity Building & Training for Extension Officers",
      methodCode: "CQS",
    },
    {
      amount: 1_200_000,
      description: "Independent Financial and Procurement Audit Services",
      methodCode: "LCS",
    },
  ],
  Goods: [
    {
      amount: 45_000_000,
      description: "Procurement of Veterinary Vaccines for Zone 3",
      methodCode: "RFB",
    },
    {
      amount: 85_000_000,
      description: "Supply of Agricultural Tractors and Attachments",
      methodCode: "RFB",
    },
    {
      amount: 6_400_000,
      description: "Supply of Livestock Monitoring Equipment",
      methodCode: "RFQ",
    },
    {
      amount: 22_300_000,
      description: "Supply of Certified Improved Forage Seeds",
      methodCode: "RFB",
    },
    {
      amount: 15_800_000,
      description: "Procurement of Cold Chain Refrigeration Equipment",
      methodCode: "RFB",
    },
    {
      amount: 8_200_000,
      description: "Supply of Veterinary Laboratory Reagents & Kits",
      methodCode: "RFQ",
    },
    {
      amount: 31_500_000,
      description: "Procurement of Mobile Animal Clinic Vehicles",
      methodCode: "RFB",
    },
    {
      amount: 12_600_000,
      description: "Supply of Post-Harvest Crop Processing Equipment",
      methodCode: "RFQ",
    },
    {
      amount: 18_400_000,
      description: "Procurement of Solar Water Pumping Units",
      methodCode: "RFB",
    },
    {
      amount: 9_750_000,
      description: "Supply of Animal Tagging and Traceability Hardware",
      methodCode: "RFQ",
    },
    {
      amount: 28_000_000,
      description: "Procurement of Commercial Feed Milling Machinery",
      methodCode: "RFB",
    },
    {
      amount: 14_200_000,
      description: "Supply of Agro-Meteorological Sensor Stations",
      methodCode: "RFQ",
    },
  ],
  "Non-Consulting Services": [
    {
      amount: 4_600_000,
      description: "Fleet Maintenance and Technical Support Services",
      methodCode: "RFB",
    },
    {
      amount: 2_400_000,
      description: "Security Services for Regional Project Warehouses",
      methodCode: "RFB",
    },
    {
      amount: 1_850_000,
      description: "Transport, Haulage and Logistics Support Services",
      methodCode: "RFQ",
    },
    {
      amount: 3_100_000,
      description: "Satellite Remote Sensing & GIS Mapping Services",
      methodCode: "RFB",
    },
    {
      amount: 1_500_000,
      description: "Public Awareness & Radio Broadcasting Campaigns",
      methodCode: "RFQ",
    },
  ],
  Works: [
    {
      amount: 120_500_000,
      description: "Construction of Irrigation Canal Extension",
      methodCode: "RFB",
    },
    {
      amount: 18_750_000,
      description: "Construction of Regional Crop Storage Facilities",
      methodCode: "RFB",
    },
    {
      amount: 38_900_000,
      description: "Rehabilitation of Community Water Points",
      methodCode: "RFB",
    },
    {
      amount: 54_200_000,
      description: "Construction of Regional Veterinary Laboratory",
      methodCode: "RFB",
    },
    {
      amount: 42_000_000,
      description: "Construction of Livestock Market Hub Facilities",
      methodCode: "RFB",
    },
    {
      amount: 65_000_000,
      description: "Rehabilitation of Rural Access Roads for Feed Transport",
      methodCode: "RFB",
    },
    {
      amount: 29_300_000,
      description: "Construction of Animal Quarantine Holding Pens",
      methodCode: "RFB",
    },
    {
      amount: 16_800_000,
      description: "Drilling and Equipping of Deep Groundwater Wells",
      methodCode: "RFB",
    },
  ],
};

const methodKeyByCode: Record<
  ActivityTemplate["methodCode"],
  ProcurementMethodKey
> = {
  CQS: "cqs",
  LCS: "lcs",
  QCBS: "qcbs",
  RFB: "rfb-international",
  RFQ: "rfq-shopping",
};

export function getPlanActivities(
  project: OfficerProject,
  plan: ProcurementPlanSummary,
  savedActivities: readonly ProcurementActivitySummary[] = [],
) {
  const generated = createFixturePlanActivities(project, plan);
  const normalizedSaved = savedActivities
    .filter((savedActivity) => !savedActivity.reference.startsWith("MOA/"))
    .map((savedActivity) => ({
      ...savedActivity,
      category: plan.category,
    }));
  const savedByReference = new Map(
    normalizedSaved.map((savedActivity) => [
      savedActivity.reference,
      savedActivity,
    ]),
  );
  const generatedReferences = new Set(
    generated.map((activity) => activity.reference),
  );

  return [
    ...generated.map(
      (activity) => savedByReference.get(activity.reference) ?? activity,
    ),
    ...Array.from(savedByReference.values()).filter(
      (savedActivity) => !generatedReferences.has(savedActivity.reference),
    ),
  ];
}

export function createFixturePlanActivities(
  project: OfficerProject,
  plan: ProcurementPlanSummary,
): ProcurementActivitySummary[] {
  const remaining: Record<ActivityStatus, number> = {
    Completed: plan.completedActivities,
    Delayed: plan.delayedActivities,
    "In Progress": plan.inProgressActivities,
    "Not Started": 0,
  };
  const preferredStatuses: ActivityStatus[] = [
    "In Progress",
    "Delayed",
    "Completed",
    "In Progress",
  ];
  const statuses: ActivityStatus[] = [];
  const templates = activityTemplates[plan.category];

  for (const preferred of preferredStatuses) {
    if (statuses.length >= plan.activities) break;
    if (remaining[preferred] > 0) {
      statuses.push(preferred);
      remaining[preferred] -= 1;
    }
  }

  for (const status of ["Completed", "In Progress", "Delayed"] as const) {
    while (remaining[status] > 0 && statuses.length < plan.activities) {
      statuses.push(status);
      remaining[status] -= 1;
    }
  }

  return Array.from({ length: plan.activities }, (_, index) => {
    const template = templates[index % templates.length];
    const methodKey = methodKeyByCode[template.methodCode];
    const method = procurementMethodOptions.find(
      (option) => option.key === methodKey,
    )!;
    const status = statuses[index] ?? "In Progress";
    const roadmap = fixtureRoadmap(methodKey, status, index);
    const currentStage = fixtureCurrentStage(roadmap, status, index);

    return {
      category: plan.category,
      currentStage,
      description: template.description,
      details: {
        componentAllocations: (project.components ?? []).map(
          (component, componentIndex) => ({
            id: component,
            percent: componentIndex === 0 ? "100" : "0",
            selected: componentIndex === 0,
          }),
        ),
        financingAllocations: (project.financingNumbers ?? []).map(
          (financingNumber, financingIndex) => ({
            id: financingNumber,
            percent: financingIndex === 0 ? "100" : "0",
            selected: financingIndex === 0,
          }),
        ),
        form: fixtureForm(
          project,
          plan,
          template.description,
          template.amount,
          methodKey,
        ),
        lots: [],
        roadmap,
      },
      estimatedAmount: template.amount,
      method: method.label,
      reference: activityReferenceFor(
        project,
        plan,
        plan.category,
        methodKey,
        index,
      ),
      status,
    };
  });
}

function fixtureForm(
  project: OfficerProject,
  plan: ProcurementPlanSummary,
  activityDescription: string,
  estimatedAmount: number,
  method: ProcurementMethodKey,
): ProcurementActivityFormValues {
  const methodLabel =
    procurementMethodOptions.find((option) => option.key === method)?.label ??
    method;

  return {
    activityDescription,
    classificationCode:
      plan.category === "Works"
        ? "72141100"
        : plan.category === "Consultancy Services"
          ? "80101500"
          : plan.category === "Non-Consulting Services"
            ? "78101800"
            : "23181500",
    comments: "Approved procurement activity baseline.",
    contractType: plan.category === "Works" ? "Lump Sum" : "Time Based",
    currency: plan.currency || project.baseCurrency,
    domesticPreference: "No",
    estimatedAmount: String(estimatedAmount),
    evaluationOptionCode: "Most Advantageous Bid",
    fundingSource: project.fundingSource,
    highRiskCode: "No",
    inProcess: false,
    invitationReference: "",
    latitude: "",
    location: plan.organizationRegion || project.organizationRegion || "",
    longitude: "",
    lotRequired: false,
    marketApproach: "Open International",
    method,
    oversightClassification: "Substantial",
    pricingBasis: plan.category === "Works" ? "Fixed Price" : "Not Applicable",
    procurementDocumentType:
      plan.category === "Consultancy Services"
        ? "Request for Proposals"
        : "Request for Bids",
    procurementProcess: "Single Stage - One Envelope",
    qualificationApproach: "Postqualification",
    requiresUnAgency: false,
    reviewType: "Prior Review",
    scopeNotes: `Approved scope for ${activityDescription}.`,
    specificMethod: methodLabel,
    subcomponent: project.components?.[0] ?? "Not recorded",
  };
}

function fixtureRoadmap(
  method: ProcurementMethodKey,
  status: ActivityStatus,
  index: number,
): ProcurementActivityRoadmapStage[] {
  const startDate =
    status === "Completed"
      ? "2025-01-06"
      : status === "Delayed"
        ? "2026-01-05"
        : index % 4 === 0
          ? "2026-06-15"
          : "2026-08-03";

  return roadmapForMethod(method).map((stage, stageIndex) => {
    const gregorianDate = addDays(startDate, stageIndex * 14);
    const ethiopian = gregorianToEthiopian(gregorianDate);

    return {
      allowNotApplicable: Boolean(stage.allowNotApplicable),
      days: String(stageIndex * 14),
      ethiopianDate: ethiopian ? formatEthiopianDate(ethiopian) : "",
      gregorianDate,
      name: stage.name,
      notApplicable: Boolean(stage.allowNotApplicable),
      remarks: "",
    };
  });
}

function fixtureCurrentStage(
  roadmap: readonly ProcurementActivityRoadmapStage[],
  status: ActivityStatus,
  index: number,
) {
  const applicable = roadmap.filter((stage) => !stage.notApplicable);
  if (status === "Completed") {
    return applicable.at(-1)?.name ?? "Contract Completion";
  }

  if (status === "Delayed") {
    const delayStage = applicable.find((stage) =>
      stage.name.toLowerCase().includes("evaluation"),
    );
    return (
      delayStage?.name ??
      applicable[Math.max(0, Math.floor(applicable.length * 0.5))]?.name ??
      "In Progress"
    );
  }

  if (index % 3 === 0) {
    const signedContractStage = applicable.find(
      (stage) => stage.name === "Signed Contract",
    );
    return signedContractStage?.name ?? "Signed Contract";
  }

  const midStageIndex = Math.max(
    1,
    Math.min(applicable.length - 2, Math.floor(applicable.length * 0.4)),
  );
  return applicable[midStageIndex]?.name ?? "In Progress";
}

function addDays(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

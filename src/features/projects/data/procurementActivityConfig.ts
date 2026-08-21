import type { OfficerProject, ProcurementPlanSummary } from "./officerProjects";

export type ProcurementActivityCategory =
  "Goods" | "Works" | "Non-Consulting Services" | "Consultancy Services";

export type ProcurementMethodKey =
  | "rfb-international"
  | "rfb-national"
  | "rfq-shopping"
  | "direct"
  | "un-agency"
  | "qcbs"
  | "fbs"
  | "lcs"
  | "cqs"
  | "indv";

export interface ProcurementMethodOption {
  appliesTo: readonly ProcurementActivityCategory[];
  key: ProcurementMethodKey;
  label: string;
  roadmap:
    "rfb" | "rfq" | "direct" | "un" | "consulting" | "cqs" | "individual";
}

export interface RoadmapStageTemplate {
  allowNotApplicable?: boolean;
  name: string;
}

const nonConsultingCategories: readonly ProcurementActivityCategory[] = [
  "Goods",
  "Works",
  "Non-Consulting Services",
];

export const procurementMethodOptions: readonly ProcurementMethodOption[] = [
  {
    appliesTo: nonConsultingCategories,
    key: "rfb-international",
    label: "RFB - International",
    roadmap: "rfb",
  },
  {
    appliesTo: nonConsultingCategories,
    key: "rfb-national",
    label: "RFB - National",
    roadmap: "rfb",
  },
  {
    appliesTo: nonConsultingCategories,
    key: "rfq-shopping",
    label: "RFQ / Shopping",
    roadmap: "rfq",
  },
  {
    appliesTo: [
      "Goods",
      "Works",
      "Non-Consulting Services",
      "Consultancy Services",
    ],
    key: "direct",
    label: "Direct Procurement / Direct Selection",
    roadmap: "direct",
  },
  {
    appliesTo: [
      "Goods",
      "Works",
      "Non-Consulting Services",
      "Consultancy Services",
    ],
    key: "un-agency",
    label: "UN Agency / UNOPS Direct",
    roadmap: "un",
  },
  {
    appliesTo: ["Consultancy Services"],
    key: "qcbs",
    label: "QCBS",
    roadmap: "consulting",
  },
  {
    appliesTo: ["Consultancy Services"],
    key: "fbs",
    label: "FBS",
    roadmap: "consulting",
  },
  {
    appliesTo: ["Consultancy Services"],
    key: "lcs",
    label: "LCS",
    roadmap: "consulting",
  },
  {
    appliesTo: ["Consultancy Services"],
    key: "cqs",
    label: "CQS",
    roadmap: "cqs",
  },
  {
    appliesTo: ["Consultancy Services"],
    key: "indv",
    label: "Individual Consultant (INDV)",
    roadmap: "individual",
  },
];

const roadmapTemplates: Record<
  ProcurementMethodOption["roadmap"],
  readonly RoadmapStageTemplate[]
> = {
  rfb: [
    { name: "Draft Pre-qualification Documents", allowNotApplicable: true },
    {
      name: "Specific Procurement Notice (prequalification)",
      allowNotApplicable: true,
    },
    {
      name: "Amendments to Pre-qualification Documents",
      allowNotApplicable: true,
    },
    {
      name: "Opening / Minutes of Pre-qualification",
      allowNotApplicable: true,
    },
    {
      name: "Pre-qualification Evaluation Report",
      allowNotApplicable: true,
    },
    { name: "Draft Bidding Documents" },
    { name: "Specific Procurement Notice" },
    { name: "Invitation to Providers" },
    { name: "Amendments to Bidding Documents", allowNotApplicable: true },
    { name: "Bid Submission / Opening / Minutes" },
    { name: "Bid Evaluation Report and Recommendation for Award" },
    { name: "Notification of Intention of Award" },
    { name: "Signed Contract" },
    { name: "Contract Amendments", allowNotApplicable: true },
    { name: "Contract Completion" },
    { name: "Contract Termination", allowNotApplicable: true },
  ],
  rfq: [
    { name: "Draft Request for Quotations" },
    { name: "Specific Procurement Notice", allowNotApplicable: true },
    { name: "Invitation to Supplier / Contractor" },
    {
      name: "Amendments to Request for Quotations",
      allowNotApplicable: true,
    },
    { name: "Receive Quotations" },
    { name: "Comparison of Quotations" },
    { name: "Notification of Intention of Award" },
    { name: "Signed Contract" },
    { name: "Contract Amendments", allowNotApplicable: true },
    { name: "Contract Completion" },
    { name: "Contract Termination", allowNotApplicable: true },
  ],
  direct: [
    { name: "Justification for Direct Procurement" },
    { name: "Invitation to Supplier / Contractor" },
    { name: "Draft Contract" },
    { name: "Notification of Intention of Award", allowNotApplicable: true },
    { name: "Signed Contract" },
    { name: "Contract Amendments", allowNotApplicable: true },
    { name: "Contract Completion" },
    { name: "Contract Termination", allowNotApplicable: true },
  ],
  un: [
    { name: "Justification for Direct Procurement" },
    { name: "Invitation / Request to UN Agency or Supplier" },
    { name: "Draft Contract" },
    { name: "Notification of Intention of Award", allowNotApplicable: true },
    { name: "Signed Contract" },
    { name: "Contract Amendments", allowNotApplicable: true },
    { name: "Contract Completion" },
    { name: "Contract Termination", allowNotApplicable: true },
  ],
  consulting: [
    { name: "Terms of Reference" },
    { name: "Expression of Interest" },
    {
      name: "Evaluation of Expression of Interest and Short List of Consultants",
    },
    { name: "Short List and Draft Request for Proposals" },
    { name: "Request for Proposals as Issued" },
    { name: "Amendments to Request for Proposals", allowNotApplicable: true },
    { name: "Opening of Technical Proposals / Minutes" },
    { name: "Evaluation of Technical Proposals" },
    { name: "Opening of Financial Proposals / Minutes" },
    { name: "Combined Evaluation Report and Draft Negotiated Contract" },
    { name: "Notification of Intention of Award" },
    { name: "Signed Contract" },
    { name: "Contract Amendments", allowNotApplicable: true },
    { name: "Contract Completion" },
    { name: "Contract Termination", allowNotApplicable: true },
  ],
  cqs: [
    { name: "Terms of Reference" },
    { name: "Expression of Interest" },
    {
      name: "Evaluation of Expression of Interest and Short List of Consultants",
    },
    { name: "Short List and Draft Request for Proposals" },
    { name: "Draft Negotiated Contract" },
    { name: "Notification of Intention of Award" },
    { name: "Signed Contract" },
    { name: "Contract Amendments", allowNotApplicable: true },
    { name: "Contract Completion" },
    { name: "Contract Termination", allowNotApplicable: true },
  ],
  individual: [
    { name: "Terms of Reference" },
    { name: "Expression of Interest", allowNotApplicable: true },
    {
      name: "Evaluation of Expression of Interest and Short List of Consultants",
      allowNotApplicable: true,
    },
    {
      name: "Justification for Direct Selection",
      allowNotApplicable: true,
    },
    { name: "Invitation to Identified / Selected Consultant" },
    { name: "Draft Negotiated Contract" },
    { name: "Notification of Intention of Award" },
    { name: "Signed Contract" },
    { name: "Contract Amendments", allowNotApplicable: true },
    { name: "Contract Completion" },
    { name: "Contract Termination", allowNotApplicable: true },
  ],
};

export function normalizeActivityCategory(
  category: string | undefined,
): ProcurementActivityCategory {
  if (category === "Works") return "Works";
  if (category === "Consultancy" || category === "Consultancy Services") {
    return "Consultancy Services";
  }
  if (category === "Non-Consulting" || category === "Non-Consulting Services") {
    return "Non-Consulting Services";
  }
  return "Goods";
}

export function methodsForCategory(category: ProcurementActivityCategory) {
  return procurementMethodOptions.filter((method) =>
    method.appliesTo.includes(category),
  );
}

export function roadmapForMethod(methodKey: string) {
  const method = procurementMethodOptions.find(
    (option) => option.key === methodKey,
  );
  return method ? roadmapTemplates[method.roadmap] : [];
}

export function activityReferenceFor(
  project: OfficerProject,
  plan: ProcurementPlanSummary,
  category: ProcurementActivityCategory,
  methodKey: string,
  existingActivityCount = plan.activities,
) {
  const agencySegment = project.executingAgency
    .trim()
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((word) =>
      ["and", "of", "the"].includes(word.toLowerCase())
        ? word[0].toLowerCase()
        : word[0].toUpperCase(),
    )
    .join("");
  const categorySegment = {
    "Consultancy Services": "CS",
    Goods: "GO",
    "Non-Consulting Services": "NCS",
    Works: "CW",
  }[category];
  const methodSegment =
    {
      cqs: "CQS",
      direct: "DIR",
      fbs: "FBS",
      indv: "INDV",
      lcs: "LCS",
      qcbs: "QCBS",
      "rfb-international": "RFB",
      "rfb-national": "RFB",
      "rfq-shopping": "RFQ",
      "un-agency": "UN",
    }[methodKey as ProcurementMethodKey] ?? "TBD";
  const uniqueNumber = String(existingActivityCount + 1).padStart(6, "0");

  return [
    "ET",
    agencySegment || "Agency",
    uniqueNumber,
    categorySegment,
    methodSegment,
  ].join("-");
}

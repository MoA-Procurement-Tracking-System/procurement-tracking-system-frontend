export interface ReportFilterOptions {
  efy: string;
  fromDate: string;
  toDate: string;
  project: string;
  category: string;
  fundingSource: string;
  procurementMethod: string;
  reviewType: string;
  currency: string;
}

export interface AnnualPlanReportRow {
  id: string;
  projectCode: string;
  planName: string;
  refNo: string;
  description: string;
  category: string;
  method: string;
  estimatedAmount: number;
  currency: string;
  fundingSource: string;
  region: string;
  officer: string;
  status: string;
}

export interface PlanVsActualReportRow {
  id: string;
  refNo: string;
  description: string;
  method: string;
  plannedAdvertisingDate: string;
  actualAdvertisingDate: string;
  plannedOpeningDate: string;
  actualOpeningDate: string;
  plannedAwardDate: string;
  actualAwardDate: string;
  plannedSignatureDate: string;
  actualSignatureDate: string;
  status: string;
}

export interface StepReportRow {
  id: string;
  refNo: string;
  description: string;
  category: string;
  method: string;
  marketApproach: string;
  reviewType: string;
  processStatus: string;
  activityStatus: string;
  estimatedAmount: number;
  signedContractAmount: number;
}

export interface DelayedProcurementRow {
  id: string;
  refNo: string;
  description: string;
  method: string;
  currentOverdueStage: string;
  effectiveTargetDate: string;
  actualOrCurrentDate: string;
  delayDays: number;
  replanningReason: string;
  officer: string;
}

export interface MonthlySummaryRow {
  id: string;
  monthYear: string;
  category: string;
  method: string;
  fundingType: "Treasury" | "Loan" | "Grant";
  packageCount: number;
  totalAmountETB: number;
}

export interface ContractPaymentReportRow {
  id: string;
  contractNo: string;
  refNo: string;
  supplierName: string;
  region: string;
  originalContractAmount: number;
  vatAmount: number;
  finalContractAmount: number;
  totalPaidAmount: number;
  remainingBalance: number;
  contractStatus: string;
}

export interface DetailedProcurementRow {
  id: string;
  refNo: string;
  description: string;
  category: string;
  method: string;
  winnerSupplier: string;
  awardedAmount: number;
  currency: string;
  fundingSource: string;
  completionDate: string;
  status: string;
}

export interface ProjectOfficerSummaryRow {
  id: string;
  projectCode: string;
  officerName: string;
  totalPlans: number;
  totalActivities: number;
  totalBudgetETB: number;
  approvedCount: number;
  delayedCount: number;
}

// MOCK REPORT DATASETS
export const MOCK_ANNUAL_PLAN_REPORT: AnnualPlanReportRow[] = [
  {
    id: "ap-1",
    projectCode: "BREFONS",
    planName: "2018 EFY BREFONS Works Procurement Plan",
    refNo: "ET-MOA-2018-CW-RFB-001",
    description: "Construction of Livestock Water Points & Collection Centers",
    category: "Works",
    method: "RFB - National",
    estimatedAmount: 48000000,
    currency: "ETB",
    fundingSource: "AfDB Loan",
    region: "Oromia",
    officer: "Taddese Worku",
    status: "Approved",
  },
  {
    id: "ap-2",
    projectCode: "DRIVE",
    planName: "2018 EFY DRIVE Goods Procurement Plan",
    refNo: "ET-MOA-2018-GO-RFQ-002",
    description: "Supply of Veterinary Cold Chain Storage Containers",
    category: "Goods",
    method: "RFQ / Shopping",
    estimatedAmount: 18500000,
    currency: "ETB",
    fundingSource: "World Bank Grant",
    region: "Somali",
    officer: "Amina Hussein",
    status: "Approved",
  },
  {
    id: "ap-3",
    projectCode: "FSRP",
    planName: "2018 EFY FSRP Consultancy Services Plan",
    refNo: "ET-MOA-2018-CS-QCBS-003",
    description: "Baseline Survey for Food Systems Climate Resilience",
    category: "Consultancy Services",
    method: "QCBS",
    estimatedAmount: 12000000,
    currency: "ETB",
    fundingSource: "World Bank Loan",
    region: "Federal",
    officer: "Bekele Megersa",
    status: "Submitted to Director",
  },
  {
    id: "ap-4",
    projectCode: "REGULAR",
    planName: "2018 EFY Government Treasury Regular Goods Plan",
    refNo: "ET-MOA-2018-GO-NCB-004",
    description: "Supply of Pest Control Chemicals and Field Vehicles",
    category: "Goods",
    method: "RFB - National",
    estimatedAmount: 28000000,
    currency: "ETB",
    fundingSource: "Treasury",
    region: "Federal",
    officer: "Taddese Worku",
    status: "Approved",
  },
];

export const MOCK_PLAN_VS_ACTUAL_REPORT: PlanVsActualReportRow[] = [
  {
    id: "pva-1",
    refNo: "ET-MOA-2018-CW-RFB-001",
    description: "Construction of Livestock Water Points & Collection Centers",
    method: "RFB - National",
    plannedAdvertisingDate: "2025-08-15",
    actualAdvertisingDate: "2025-08-20",
    plannedOpeningDate: "2025-09-30",
    actualOpeningDate: "2025-10-05",
    plannedAwardDate: "2025-11-15",
    actualAwardDate: "2025-11-28",
    plannedSignatureDate: "2025-12-10",
    actualSignatureDate: "2025-12-15",
    status: "In Execution",
  },
  {
    id: "pva-2",
    refNo: "ET-MOA-2018-GO-RFQ-002",
    description: "Supply of Veterinary Cold Chain Storage Containers",
    method: "RFQ / Shopping",
    plannedAdvertisingDate: "2025-09-01",
    actualAdvertisingDate: "2025-09-01",
    plannedOpeningDate: "2025-09-20",
    actualOpeningDate: "2025-09-22",
    plannedAwardDate: "2025-10-10",
    actualAwardDate: "2025-10-12",
    plannedSignatureDate: "2025-10-25",
    actualSignatureDate: "2025-10-28",
    status: "Signed",
  },
];

export const MOCK_STEP_REPORT: StepReportRow[] = [
  {
    id: "step-1",
    refNo: "ET-MOA-2018-CW-RFB-001",
    description: "Construction of Livestock Water Points",
    category: "Works",
    method: "RFB - National",
    marketApproach: "Open - National",
    reviewType: "Prior",
    processStatus: "Under Implementation",
    activityStatus: "Cleared",
    estimatedAmount: 48000000,
    signedContractAmount: 46800000,
  },
  {
    id: "step-2",
    refNo: "ET-MOA-2018-GO-RFQ-002",
    description: "Veterinary Cold Chain Storage Containers",
    category: "Goods",
    method: "RFQ / Shopping",
    marketApproach: "Limited",
    reviewType: "Post",
    processStatus: "Signed",
    activityStatus: "Cleared",
    estimatedAmount: 18500000,
    signedContractAmount: 18200000,
  },
];

export const MOCK_DELAYED_PROCUREMENT_REPORT: DelayedProcurementRow[] = [
  {
    id: "del-1",
    refNo: "ET-MOA-2018-CS-QCBS-003",
    description: "Baseline Survey for Food Systems Climate Resilience",
    method: "QCBS",
    currentOverdueStage: "Technical Evaluation Report Approval",
    effectiveTargetDate: "2025-11-01",
    actualOrCurrentDate: "2026-02-18",
    delayDays: 109,
    replanningReason: "Delay in No-Objection clearance from Donor Bank",
    officer: "Bekele Megersa",
  },
  {
    id: "del-2",
    refNo: "ET-MOA-2018-GO-NCB-004",
    description: "Supply of Field Extension Vehicles",
    method: "RFB - National",
    currentOverdueStage: "Bid Evaluation Report Submission",
    effectiveTargetDate: "2026-01-15",
    actualOrCurrentDate: "2026-02-18",
    delayDays: 34,
    replanningReason: "Clarification request submitted by bidders",
    officer: "Taddese Worku",
  },
];

export const MOCK_MONTHLY_SUMMARY_REPORT: MonthlySummaryRow[] = [
  {
    id: "ms-1",
    monthYear: "July 2025 (Hamle 2017)",
    category: "Goods",
    method: "RFB - National",
    fundingType: "Treasury",
    packageCount: 4,
    totalAmountETB: 32000000,
  },
  {
    id: "ms-2",
    monthYear: "August 2025 (Nehase 2017)",
    category: "Works",
    method: "RFB - National",
    fundingType: "Loan",
    packageCount: 6,
    totalAmountETB: 84000000,
  },
  {
    id: "ms-3",
    monthYear: "September 2025 (Meskerem 2018)",
    category: "Consultancy Services",
    method: "QCBS",
    fundingType: "Grant",
    packageCount: 3,
    totalAmountETB: 24000000,
  },
];

export const MOCK_CONTRACT_PAYMENT_REPORT: ContractPaymentReportRow[] = [
  {
    id: "cp-1",
    contractNo: "MoA/BREFONS/2018/C-01",
    refNo: "ET-MOA-2018-CW-RFB-001",
    supplierName: "Sur Construction PLC",
    region: "Oromia",
    originalContractAmount: 46800000,
    vatAmount: 7020000,
    finalContractAmount: 53820000,
    totalPaidAmount: 21500000,
    remainingBalance: 32320000,
    contractStatus: "Active",
  },
  {
    id: "cp-2",
    contractNo: "MoA/DRIVE/2018/C-02",
    refNo: "ET-MOA-2018-GO-RFQ-002",
    supplierName: "MedTech Equipment Ethiopia Ltd",
    region: "Somali",
    originalContractAmount: 18200000,
    vatAmount: 2730000,
    finalContractAmount: 20930000,
    totalPaidAmount: 20930000,
    remainingBalance: 0,
    contractStatus: "Completed",
  },
];

export const MOCK_DETAILED_PROCUREMENT_REPORT: DetailedProcurementRow[] = [
  {
    id: "det-1",
    refNo: "ET-MOA-2018-CW-RFB-001",
    description: "Construction of Livestock Water Points",
    category: "Works",
    method: "RFB - National",
    winnerSupplier: "Sur Construction PLC",
    awardedAmount: 46800000,
    currency: "ETB",
    fundingSource: "AfDB Loan",
    completionDate: "2026-06-30",
    status: "Completed",
  },
  {
    id: "det-2",
    refNo: "ET-MOA-2018-GO-RFQ-002",
    description: "Veterinary Cold Chain Storage Containers",
    category: "Goods",
    method: "RFQ / Shopping",
    winnerSupplier: "MedTech Equipment Ethiopia Ltd",
    awardedAmount: 18200000,
    currency: "ETB",
    fundingSource: "World Bank Grant",
    completionDate: "2025-12-15",
    status: "Completed",
  },
];

export const MOCK_PROJECT_OFFICER_SUMMARY_REPORT: ProjectOfficerSummaryRow[] = [
  {
    id: "po-1",
    projectCode: "BREFONS",
    officerName: "Taddese Worku",
    totalPlans: 3,
    totalActivities: 14,
    totalBudgetETB: 125000000,
    approvedCount: 12,
    delayedCount: 2,
  },
  {
    id: "po-2",
    projectCode: "DRIVE",
    officerName: "Amina Hussein",
    totalPlans: 2,
    totalActivities: 9,
    totalBudgetETB: 78000000,
    approvedCount: 8,
    delayedCount: 1,
  },
  {
    id: "po-3",
    projectCode: "FSRP",
    officerName: "Bekele Megersa",
    totalPlans: 4,
    totalActivities: 18,
    totalBudgetETB: 164000000,
    approvedCount: 15,
    delayedCount: 3,
  },
];

export function exportToExcelCSV(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
) {
  const csvContent = [
    headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","),
    ...rows.map((row) =>
      row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","),
    ),
  ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

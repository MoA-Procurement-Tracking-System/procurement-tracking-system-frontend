export const OFFICER_CONTRACTS_STORAGE_KEY = "moa-pts:officer-contracts:v1";

export type ContractCurrency = "ETB" | "UA" | "USD";
export type ContractStatus =
  | "Active"
  | "Active / Under Implementation"
  | "Completed"
  | "Delayed"
  | "Partially Terminated"
  | "Planned / Prepared"
  | "Signed"
  | "Terminated";

export interface ContractDateValue {
  ethiopian: string;
  gregorian: string;
}

export interface ContractAmendment {
  amount: number;
  id: number;
}

export interface OfficerContractDetails {
  activityReference: string;
  actualCompletionDate?: ContractDateValue;
  amendments: ContractAmendment[];
  amountWithVat: number;
  awardDate?: ContractDateValue;
  netOfVat: number;
  organizationRegion?: string;
  planReference: string;
  projectCode: string;
  remarks?: string;
  startDate?: ContractDateValue;
  subcomponent?: string;
  vatRate?: number;
}

export interface OfficerContract {
  completionDate: ContractDateValue;
  contractNumber: string;
  currency: ContractCurrency;
  currentAmount: number;
  details?: OfficerContractDetails;
  id: string;
  originalAmount: number;
  procurementActivity: string;
  project: string;
  remainingBalance: number;
  signingDate: ContractDateValue;
  status: ContractStatus;
  supplier: string;
  totalPaid: number;
}

// UI-only fixtures. Replace with the Officer-scoped contracts endpoint when
// API integration is brought into scope.
export const officerContracts: readonly OfficerContract[] = [
  {
    completionDate: {
      ethiopian: "06-Tah-2017",
      gregorian: "15-Dec-2024",
    },
    contractNumber: "MOA-CON-2024-001",
    currency: "ETB",
    currentAmount: 45_000_000,
    id: "contract-1",
    originalAmount: 45_000_000,
    procurementActivity:
      "Procurement of 23 Field Vehicles for Regional Extension Offices",
    project: "DRIVE",
    remainingBalance: 30_000_000,
    signingDate: {
      ethiopian: "06-Tir-2016",
      gregorian: "15-Jan-2024",
    },
    status: "Active",
    supplier: "Green Field Engineering PLC",
    totalPaid: 15_000_000,
  },
  {
    completionDate: {
      ethiopian: "21-Hid-2016",
      gregorian: "30-Nov-2023",
    },
    contractNumber: "MOA-CON-2023-089",
    currency: "USD",
    currentAmount: 125_000,
    id: "contract-2",
    originalAmount: 125_000,
    procurementActivity:
      "Consultancy Service for Livestock Value Chain Assessment",
    project: "BREFONS",
    remainingBalance: 0,
    signingDate: {
      ethiopian: "01-Meg-2015",
      gregorian: "10-Mar-2023",
    },
    status: "Completed",
    supplier: "Agri Consult Intl.",
    totalPaid: 125_000,
  },
  {
    completionDate: {
      ethiopian: "27-Tir-2016",
      gregorian: "05-Feb-2024",
    },
    contractNumber: "MOA-CON-2023-102",
    currency: "ETB",
    currentAmount: 92_000_000,
    id: "contract-3",
    originalAmount: 85_500_000,
    procurementActivity:
      "Construction of Regional Veterinary Laboratory in Hawassa",
    project: "DRIVE",
    remainingBalance: 52_000_000,
    signingDate: {
      ethiopian: "28-Gin-2015",
      gregorian: "05-Jun-2023",
    },
    status: "Delayed",
    supplier: "Sunshine Construction",
    totalPaid: 40_000_000,
  },
];

export function addSavedContract(
  contracts: readonly OfficerContract[],
  contract: OfficerContract,
) {
  return [
    ...contracts.filter(
      (existing) =>
        existing.contractNumber.toLowerCase() !==
        contract.contractNumber.toLowerCase(),
    ),
    contract,
  ];
}

export function parseSavedContracts(serialized: string | null) {
  if (!serialized) return [] as OfficerContract[];

  try {
    const parsed: unknown = JSON.parse(serialized);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isOfficerContract);
  } catch {
    return [];
  }
}

function isOfficerContract(value: unknown): value is OfficerContract {
  if (!value || typeof value !== "object") return false;
  const contract = value as Partial<OfficerContract>;
  return (
    typeof contract.id === "string" &&
    typeof contract.contractNumber === "string" &&
    typeof contract.procurementActivity === "string" &&
    typeof contract.project === "string" &&
    typeof contract.supplier === "string" &&
    typeof contract.originalAmount === "number" &&
    typeof contract.currentAmount === "number" &&
    (contract.currency === "ETB" ||
      contract.currency === "USD" ||
      contract.currency === "UA") &&
    typeof contract.totalPaid === "number" &&
    typeof contract.remainingBalance === "number" &&
    isContractDate(contract.signingDate) &&
    isContractDate(contract.completionDate) &&
    isContractStatus(contract.status)
  );
}

function isContractDate(value: unknown): value is ContractDateValue {
  if (!value || typeof value !== "object") return false;
  const date = value as Partial<ContractDateValue>;
  return (
    typeof date.gregorian === "string" && typeof date.ethiopian === "string"
  );
}

function isContractStatus(value: unknown): value is ContractStatus {
  return (
    value === "Active" ||
    value === "Active / Under Implementation" ||
    value === "Completed" ||
    value === "Delayed" ||
    value === "Partially Terminated" ||
    value === "Planned / Prepared" ||
    value === "Signed" ||
    value === "Terminated"
  );
}

import { getPlanActivities } from "../../projects/data/fixtureActivityLifecycle";
import { officerProjects } from "../../projects/data/officerProjects";

export const OFFICER_CONTRACTS_STORAGE_KEY = "moa-pts:officer-contracts:v2";

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

// UI-only records model the same lifecycle as the approved project activity
// baselines. When an activity reaches Signed Contract or Contract Completion,
// it has exactly one matching contract record. API data will replace this
// fixture generator without changing the view contracts.
export const officerContracts: readonly OfficerContract[] =
  officerProjects.flatMap((project) =>
    project.plans
      .filter((plan) => plan.status === "Approved")
      .flatMap((plan) =>
        getPlanActivities(project, plan).flatMap((activity) => {
          const roadmap = activity.details?.roadmap ?? [];
          const signedContract = roadmap.find(
            (stage) => stage.name === "Signed Contract" && !stage.notApplicable,
          );
          const contractCompletion = roadmap.find(
            (stage) =>
              stage.name === "Contract Completion" && !stage.notApplicable,
          );
          const hasReachedContract =
            activity.status === "Completed" ||
            activity.currentStage === "Signed Contract" ||
            activity.currentStage === "Contract Completion";

          if (!hasReachedContract || !signedContract || !contractCompletion) {
            return [];
          }

          const isCompleted = activity.status === "Completed";
          const isDelayed = activity.status === "Delayed";
          const paidAmount = isCompleted
            ? activity.estimatedAmount
            : isDelayed
              ? Math.round(activity.estimatedAmount * 0.35 * 100) / 100
              : Math.round(activity.estimatedAmount * 0.45 * 100) / 100;
          const activitySequence = activity.reference.includes("/")
            ? activity.reference.split("/").at(-1)
            : (activity.reference.split("-")[2] ?? activity.reference);
          const contractSuffix = `${plan.reference.split("-").at(-1)}-${activitySequence}`;
          const dateValue = (stage: (typeof roadmap)[number]) => ({
            ethiopian: stage.ethiopianDate || "",
            gregorian: stage.gregorianDate || "",
          });
          const awardStage = roadmap.find((stage) =>
            stage.name.toLowerCase().includes("notification"),
          );
          const vatRate = 15;

          return [
            {
              completionDate: dateValue(contractCompletion),
              contractNumber: `MOA-CON-${project.code.slice(-3)}-${contractSuffix}`,
              currency: plan.currency,
              currentAmount: activity.estimatedAmount,
              details: {
                ...(isCompleted
                  ? { actualCompletionDate: dateValue(contractCompletion) }
                  : {}),
                amendments: [],
                amountWithVat:
                  Math.round(
                    activity.estimatedAmount * (1 + vatRate / 100) * 100,
                  ) / 100,
                ...(awardStage ? { awardDate: dateValue(awardStage) } : {}),
                netOfVat: activity.estimatedAmount,
                organizationRegion: activity.details?.form.location,
                planReference: plan.reference,
                projectCode: project.code,
                remarks: isCompleted
                  ? "Completed in accordance with the approved roadmap."
                  : isDelayed
                    ? "Contract implementation is delayed against scheduled completion."
                    : "Contract signed; implementation and final completion are underway.",
                startDate: dateValue(signedContract),
                subcomponent: activity.details?.form.subcomponent,
                vatRate,
                activityReference: activity.reference,
              },
              id: `fixture-contract-${project.code}-${plan.reference}-${activity.reference}`,
              originalAmount: activity.estimatedAmount,
              procurementActivity: activity.description,
              project: project.shortName,
              remainingBalance: activity.estimatedAmount - paidAmount,
              signingDate: dateValue(signedContract),
              status: isCompleted
                ? "Completed"
                : isDelayed
                  ? "Delayed"
                  : "Active / Under Implementation",
              supplier: supplierForCategory(plan.category),
              totalPaid: paidAmount,
            },
          ];
        }),
      ),
  );

function supplierForCategory(category: string) {
  if (category === "Works") return "National Construction Enterprise";
  if (category === "Consultancy Services") return "Agriculture Advisory PLC";
  if (category === "Non-Consulting Services") return "Rural Services PLC";
  return "Agricultural Supply Enterprise";
}

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
    return parsed
      .filter(isOfficerContract)
      .filter(
        (contract) => !contract.details?.activityReference?.startsWith("MOA/"),
      );
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

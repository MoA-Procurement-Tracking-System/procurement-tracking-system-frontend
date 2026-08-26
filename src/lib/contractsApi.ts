export interface BackendPayment {
  id: string;
  contractId: string;
  amount: number;
  paymentDate?: string | null;
  referenceNo: string;
  paymentType?: "ADVANCE" | "INTERIM_1" | "INTERIM_2" | "FINAL" | "RETENTION" | string;
  status: "PAID" | "PENDING" | "FAILED";
  createdAt?: string;
}

export interface BackendContract {
  id: string;
  contractNo: string;
  activityId?: string | null;
  activity?: {
    id: string;
    reference: string;
    description: string;
  };
  supplierId?: string | null;
  supplier?: {
    id: string;
    name: string;
    tinNumber?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  totalValue: number;
  vatRate?: number | null;
  contractAmountWithVat?: number | null;
  contractNetOfVat?: number | null;
  paidAmount?: number | null;
  remainingValue?: number | null;
  currency?: string | null;
  region?: string | null;
  sector?: string | null;
  subcomponent?: string | null;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED" | "PENDING" | "DRAFT" | "TERMINATED";
  awardDate?: string | null;
  signatureDate?: string | null;
  startDate?: string | null;
  plannedEndDate?: string | null;
  actualEndDate?: string | null;
  payments?: BackendPayment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateContractInput {
  contractNo: string;
  supplierId?: string;
  activityId?: string;
  totalValue: number;
  currency?: string;
  region?: string;
  sector?: string;
}

export interface RecordPaymentInput {
  amount: number;
  referenceNo: string;
  idempotencyKey: string;
}

import { apiClient } from "./apiClient";

export async function fetchContracts(params?: {
  search?: string;
  status?: string;
}): Promise<BackendContract[]> {
  try {
    const res = await apiClient.get<any>("/contracts", {
      params: {
        search: params?.search,
        status: params?.status,
      },
    });
    return Array.isArray(res) ? res : res.data || [];
  } catch (err) {
    console.error("fetchContracts error:", err);
    return [];
  }
}

export async function fetchContractById(id: string): Promise<BackendContract> {
  const res = await apiClient.get<any>(`/contracts/${encodeURIComponent(id)}`);
  return res.data || res;
}

export async function createContract(
  data: CreateContractInput,
): Promise<BackendContract> {
  const res = await apiClient.post<any>("/contracts", data);
  return res.data || res;
}

export async function updateContract(
  id: string,
  data: Partial<CreateContractInput>,
): Promise<BackendContract> {
  const res = await apiClient.patch<any>(
    `/contracts/${encodeURIComponent(id)}`,
    data,
  );
  return res.data || res;
}

export async function fetchContractPayments(
  contractId: string,
  status?: "PAID" | "PENDING" | "FAILED",
): Promise<BackendPayment[]> {
  try {
    const res = await apiClient.get<any>(
      `/contracts/${encodeURIComponent(contractId)}/payments`,
      {
        params: status ? { "filter[status]": status } : undefined,
      },
    );
    return Array.isArray(res) ? res : res.data || [];
  } catch (err) {
    console.error("fetchContractPayments error:", err);
    return [];
  }
}

export async function recordContractPayment(
  contractId: string,
  data: RecordPaymentInput,
): Promise<BackendPayment> {
  const res = await apiClient.post<any>(
    `/contracts/${encodeURIComponent(contractId)}/payments`,
    data,
  );
  return res.data || res;
}

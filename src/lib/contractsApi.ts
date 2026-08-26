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

export async function fetchContracts(params?: {
  search?: string;
  status?: string;
}): Promise<BackendContract[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.status) query.set("status", params.status);

  const qs = query.toString();
  const response = await fetch(`/api/contracts${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error((await response.text()) || "Failed to fetch contracts");
  }
  return response.json();
}

export async function fetchContractById(id: string): Promise<BackendContract> {
  const response = await fetch(`/api/contracts/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error((await response.text()) || "Failed to fetch contract");
  }
  return response.json();
}

export async function createContract(
  data: CreateContractInput,
): Promise<BackendContract> {
  const response = await fetch("/api/contracts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorText = await response.text();
    let msg = "Failed to create contract";
    try {
      const parsed = JSON.parse(errorText);
      msg = parsed.error || parsed.message || msg;
    } catch {
      msg = errorText || msg;
    }
    throw new Error(msg);
  }
  return response.json();
}

export async function updateContract(
  id: string,
  data: Partial<CreateContractInput>,
): Promise<BackendContract> {
  const response = await fetch(`/api/contracts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update contract");
  }
  return response.json();
}

export async function fetchContractPayments(
  contractId: string,
  status?: "PAID" | "PENDING" | "FAILED",
): Promise<BackendPayment[]> {
  const query = status ? `?filter[status]=${encodeURIComponent(status)}` : "";
  const response = await fetch(
    `/api/contracts/${encodeURIComponent(contractId)}/payments${query}`,
    {
      method: "GET",
      headers: { accept: "application/json" },
      cache: "no-store",
    },
  );
  if (!response.ok) {
    throw new Error((await response.text()) || "Failed to fetch payments");
  }
  return response.json();
}

export async function recordContractPayment(
  contractId: string,
  data: RecordPaymentInput,
): Promise<BackendPayment> {
  const response = await fetch(
    `/api/contracts/${encodeURIComponent(contractId)}/payments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(data),
    },
  );
  if (!response.ok) {
    const errorText = await response.text();
    let msg = "Failed to record payment";
    try {
      const parsed = JSON.parse(errorText);
      msg = parsed.error || parsed.message || msg;
    } catch {
      msg = errorText || msg;
    }
    throw new Error(msg);
  }
  return response.json();
}

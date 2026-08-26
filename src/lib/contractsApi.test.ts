import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  fetchContracts,
  fetchContractById,
  createContract,
  fetchContractPayments,
  recordContractPayment,
  type BackendContract,
  type BackendPayment,
} from "./contractsApi";

describe("contractsApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches contracts list via GET /api/contracts", async () => {
    const mockContracts: BackendContract[] = [
      {
        id: "con-1",
        contractNo: "CON-2026-001",
        totalValue: 500000,
        currency: "ETB",
        status: "ACTIVE",
      },
    ];

    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockContracts), { status: 200 }),
    );

    const result = await fetchContracts({ status: "ACTIVE" });
    expect(result).toEqual(mockContracts);
    expect(fetch).toHaveBeenCalledWith("/api/contracts?status=ACTIVE", expect.any(Object));
  });

  it("creates contract and records payments", async () => {
    const createdContract: BackendContract = {
      id: "con-2",
      contractNo: "CON-2026-002",
      totalValue: 1200000,
      currency: "ETB",
      status: "ACTIVE",
    };

    const payment: BackendPayment = {
      id: "pay-1",
      contractId: "con-2",
      amount: 300000,
      referenceNo: "VOU-001",
      paymentType: "ADVANCE",
      status: "PAID",
    };

    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify(createdContract), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(payment), { status: 200 }));

    const resContract = await createContract({
      contractNo: "CON-2026-002",
      totalValue: 1200000,
    });
    expect(resContract.id).toBe("con-2");

    const resPayment = await recordContractPayment("con-2", {
      amount: 300000,
      referenceNo: "VOU-001",
      idempotencyKey: "idemp-1",
    });
    expect(resPayment.amount).toBe(300000);
  });
});

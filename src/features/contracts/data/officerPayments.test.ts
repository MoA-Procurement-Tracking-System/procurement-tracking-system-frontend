import { describe, expect, it } from "vitest";
import { officerContracts } from "./officerContracts";
import {
  addSavedPayment,
  applyPaymentsToContract,
  parseSavedPayments,
  type OfficerContractPayment,
} from "./officerPayments";

const payment: OfficerContractPayment = {
  amount: 2_000_000,
  contractNumber: officerContracts[0].contractNumber,
  date: { ethiopian: "01-Hamle-2018", gregorian: "2026-07-08" },
  id: "payment-1",
  paymentType: "1st / Interim",
  reference: "PV-2026-001",
  remarks: "Certified interim payment",
};

describe("officer payment storage", () => {
  it("round-trips valid payment transactions", () => {
    expect(parseSavedPayments(JSON.stringify([payment]))).toEqual([payment]);
  });

  it("adds payments as separate transactions", () => {
    const second = {
      ...payment,
      id: "payment-2",
      paymentType: "Final" as const,
    };
    expect(addSavedPayment([payment], second)).toEqual([payment, second]);
  });

  it("calculates total paid and remaining balance", () => {
    const contract = applyPaymentsToContract(officerContracts[0], [payment]);
    expect(contract.totalPaid).toBe(
      officerContracts[0].totalPaid + payment.amount,
    );
    expect(contract.remainingBalance).toBe(
      officerContracts[0].remainingBalance - payment.amount,
    );
  });

  it("ignores malformed or negative payment records", () => {
    expect(parseSavedPayments("not-json")).toEqual([]);
    expect(
      parseSavedPayments(JSON.stringify([{ ...payment, amount: -1 }])),
    ).toEqual([]);
  });
});

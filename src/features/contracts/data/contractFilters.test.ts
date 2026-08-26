import { describe, expect, it } from "vitest";
import {
  contractFiscalYear,
  filterOfficerContracts,
  type OfficerContractFilterValues,
} from "./contractFilters";
import { officerContracts, type OfficerContract } from "./officerContracts";

const defaultFilters: OfficerContractFilterValues = {
  currency: "all",
  fiscalYear: "all",
  organization: "all",
  project: "all",
  searchQuery: "",
  status: "all",
};

describe("officer contract filters", () => {
  it("extracts the fiscal year from display and ISO Gregorian dates", () => {
    expect(contractFiscalYear(officerContracts[0])).toBe("2026");
    expect(
      contractFiscalYear({
        ...officerContracts[0],
        signingDate: { ethiopian: "22-Nehase-2018", gregorian: "2026-08-28" },
      }),
    ).toBe("2026");
  });

  it("searches contract number, activity reference, activity, and supplier", () => {
    const contract: OfficerContract = {
      ...officerContracts[0],
      details: {
        activityReference: "MOA/DRV/G/01",
        amendments: [],
        amountWithVat: 45_000_000,
        netOfVat: 39_130_434.78,
        planReference: "PP-DRIVE-2016-01",
        projectCode: "PRJ-24-001",
      },
    };

    for (const searchQuery of [
      "001-01-01",
      "drv/g/01",
      "veterinary vaccines",
      "agricultural supply",
    ]) {
      expect(
        filterOfficerContracts([contract], {
          ...defaultFilters,
          searchQuery,
        }),
      ).toEqual([contract]);
    }
  });

  it("combines fiscal year, organization, project, currency, and status", () => {
    const contract: OfficerContract = {
      ...officerContracts[0],
      details: {
        activityReference: "MOA/DRV/G/01",
        amendments: [],
        amountWithVat: 45_000_000,
        netOfVat: 39_130_434.78,
        organizationRegion: "FPCU / Federal",
        planReference: "PP-DRIVE-2016-01",
        projectCode: "PRJ-24-001",
      },
    };

    expect(
      filterOfficerContracts([contract, ...officerContracts.slice(1)], {
        ...defaultFilters,
        currency: "ETB",
        fiscalYear: "2026",
        organization: "FPCU / Federal",
        project: "DRIVE",
        status: "Active / Under Implementation",
      }),
    ).toEqual([contract]);
  });
});

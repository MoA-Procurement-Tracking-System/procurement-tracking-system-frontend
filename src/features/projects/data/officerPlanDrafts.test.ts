import { describe, expect, it } from "vitest";
import { officerProjects } from "./officerProjects";
import {
  addSavedPlanRecord,
  createDraftPlan,
  mergeSavedPlans,
  parseSavedPlanRecords,
  type ProcurementPlanDraftInput,
} from "./officerPlanDrafts";

const draftInput: ProcurementPlanDraftInput = {
  budgetYear: "2017",
  category: "Goods",
  generalProcurementNoticeDate: "2026-08-28",
  generalProcurementNoticeDateEthiopian: "22-Nehase-2018",
  organizationRegion: "FPCU / Federal",
  periodFrom: "2026-07-08",
  periodFromEthiopian: "01-Hamle-2018",
  periodTo: "2027-07-07",
  periodToEthiopian: "30-Sene-2019",
  planName: "DRIVE - Goods Procurement Plan - 2017 EFY",
  remarks: "Annual goods plan.",
};

describe("officer plan draft persistence", () => {
  it("creates a Draft summary containing the entered plan data", () => {
    const plan = createDraftPlan(officerProjects[0], draftInput);

    expect(plan.reference).toBe("PP-DRIVE-2017-02");
    expect(plan.status).toBe("Draft");
    expect(plan.categories).toEqual(["Goods"]);
    expect(plan.activities).toBe(0);
    expect(plan.organizationRegion).toBe("FPCU / Federal");
    expect(plan.planPeriod?.from.gregorian).toBe("2026-07-08");
    expect(plan.generalProcurementNoticeDate?.ethiopian).toBe("22-Nehase-2018");
  });

  it("merges a saved plan into its project and updates the plan count", () => {
    const plan = createDraftPlan(officerProjects[0], draftInput);
    const projects = mergeSavedPlans(officerProjects, [
      { plan, projectCode: officerProjects[0].code },
    ]);

    expect(projects[0].plans.at(-1)?.reference).toBe(plan.reference);
    expect(projects[0].activePlans).toBe(officerProjects[0].activePlans + 1);
    expect(projects[1].plans).toHaveLength(officerProjects[1].plans.length);
  });

  it("round-trips valid saved records and ignores duplicate additions", () => {
    const plan = createDraftPlan(officerProjects[0], draftInput);
    const record = { plan, projectCode: officerProjects[0].code };
    const records = addSavedPlanRecord(addSavedPlanRecord([], record), record);

    expect(records).toHaveLength(1);
    expect(parseSavedPlanRecords(JSON.stringify(records))).toEqual(records);
    expect(parseSavedPlanRecords("not-json")).toEqual([]);
  });
});

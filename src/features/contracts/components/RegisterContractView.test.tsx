import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { officerProjects } from "../../projects/data/officerProjects";
import { officerContracts } from "../data/officerContracts";
import {
  buildEligibleActivities,
  RegisterContractView,
} from "./RegisterContractView";

describe("RegisterContractView", () => {
  it("uses only approved, contract-ready procurement activities", () => {
    const activities = buildEligibleActivities(officerProjects, []);

    expect(activities.length).toBeGreaterThan(0);
    expect(activities.every(({ plan }) => plan.status === "Approved")).toBe(
      true,
    );
    expect(
      activities.every(({ activity }) => {
        const stage = activity.currentStage.toLowerCase();
        return (
          activity.status === "Completed" ||
          stage.includes("contract") ||
          stage.includes("site handover") ||
          stage.includes("final report")
        );
      }),
    ).toBe(true);
  });

  it("renders the mapping-specification contract fields without payment entry", () => {
    const markup = renderToStaticMarkup(
      <RegisterContractView
        existingContracts={officerContracts}
        onSave={vi.fn()}
      />,
    );

    expect(markup).toContain("Contract &amp; Procurement Activity");
    expect(markup).toContain("Supplier / Contractor / Consultant");
    expect(markup).toContain("Organization / Region");
    expect(markup).toContain("Original Contract Amount");
    expect(markup).toContain("VAT Rate");
    expect(markup).toContain("Final Contract Amount");
    expect(markup).toContain("Award Date");
    expect(markup).toContain("Signature Date");
    expect(markup).toContain("Actual Completion Date");
    expect(markup).toContain("Contract Status");
    expect(markup).not.toContain("Payment Amount");
    expect(markup).not.toContain("Payment Date");
  });
});

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { officerProjects } from "../data/officerProjects";
import {
  CreateProcurementPlanView,
  suggestedPlanName,
} from "./CreateProcurementPlanView";

describe("CreateProcurementPlanView", () => {
  it("starts with the specification-defined procurement category dropdown", () => {
    const markup = renderToStaticMarkup(
      <CreateProcurementPlanView
        onSavePlan={() => undefined}
        project={officerProjects[0]}
      />,
    );

    expect(markup).toContain("Procurement Category");
    expect(markup).toContain("Select a procurement category");
    expect(markup).toContain("Goods");
    expect(markup).toContain("Works");
    expect(markup).toContain("Non-Consulting Services");
    expect(markup).toContain("Consultancy Services");
  });

  it("builds the editable suggested name from project, category, and fiscal year", () => {
    expect(suggestedPlanName(officerProjects[0], "Goods", "2018")).toBe(
      "DRIVE - Goods Procurement Plan - 2018 EFY",
    );
  });

  it("provides organization choices only from the assigned project scope", () => {
    expect(officerProjects[0].availableOrganizationRegions).toEqual([
      "FPCU / Federal",
    ]);
    expect(officerProjects[1].availableOrganizationRegions).toEqual([
      "FPCU / Federal",
      "Oromia",
      "Somali",
      "Afar",
      "Southwest Ethiopia",
      "South Ethiopia",
    ]);
  });
});

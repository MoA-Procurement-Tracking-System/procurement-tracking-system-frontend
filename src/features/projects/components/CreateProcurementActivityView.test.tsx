import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  activityReferenceFor,
  methodsForCategory,
  roadmapForMethod,
} from "../data/procurementActivityConfig";
import type {
  OfficerProject,
  ProcurementPlanSummary,
} from "../data/officerProjects";
import { CreateProcurementActivityView } from "./CreateProcurementActivityView";

const plan: ProcurementPlanSummary = {
  activities: 1,
  budgetYear: "2016 EFY",
  category: "Goods",
  completedActivities: 0,
  currency: "ETB",
  delayedActivities: 0,
  estimatedValue: 2_500_000,
  inProgressActivities: 0,
  name: "2016 EFY Annual Procurement Plan",
  reference: "PP-DRIVE-2016-01",
  status: "Approved",
};

const project: OfficerProject = {
  activePlans: 1,
  assignedOfficers: ["Yeabsira Fikre"],
  availableOrganizationRegions: ["FPCU / Federal"],
  baseCurrency: "ETB",
  code: "PRJ-24-001",
  countryOrganisation: "Ethiopia",
  executingAgency: "Ministry of Agriculture",
  fundingSource: "World Bank",
  fundingType: "Loan / Grant",
  name: "DRIVE - De-Risking, Inclusion and Value Enhancement",
  organizationRegion: "FPCU / Federal",
  plans: [plan],
  shortName: "DRIVE",
  status: "Active",
};

describe("CreateProcurementActivityView", () => {
  it("starts with the document-defined four-step structure and locked context", () => {
    const markup = renderToStaticMarkup(
      <CreateProcurementActivityView plan={plan} project={project} />,
    );

    expect(markup).toContain("Add Procurement Activity");
    expect(markup).toContain("Key Details");
    expect(markup).toContain("Related Information");
    expect(markup).toContain("Additional Details");
    expect(markup).toContain("Roadmap");
    expect(markup).toContain(plan.name);
    expect(markup).toContain("Inherited from the procurement plan");
    expect(markup).toContain(plan.category);
    expect(markup).not.toContain("legacy multi-category plan");
  });

  it("filters procurement methods by the inherited plan category", () => {
    const goodsMethods = methodsForCategory("Goods").map(
      (method) => method.key,
    );
    const consultancyMethods = methodsForCategory("Consultancy Services").map(
      (method) => method.key,
    );

    expect(goodsMethods).toContain("rfb-international");
    expect(goodsMethods).toContain("rfq-shopping");
    expect(goodsMethods).not.toContain("qcbs");
    expect(consultancyMethods).toContain("qcbs");
    expect(consultancyMethods).toContain("indv");
    expect(consultancyMethods).not.toContain("rfb-national");
  });

  it("generates method-specific roadmap stages and an activity reference", () => {
    const rfbRoadmap = roadmapForMethod("rfb-international");
    const consultancyRoadmap = roadmapForMethod("qcbs");

    expect(rfbRoadmap[0]?.name).toBe("Draft Pre-qualification Documents");
    expect(rfbRoadmap.at(-1)?.name).toBe("Contract Termination");
    expect(consultancyRoadmap).toHaveLength(15);
    expect(
      activityReferenceFor(project, plan, "Works", "rfb-international", 123456),
    ).toBe("ET-MoA-123457-CW-RFB");
  });
});

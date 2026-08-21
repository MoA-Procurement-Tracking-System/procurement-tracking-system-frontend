import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  activityReferenceFor,
  methodsForCategory,
  roadmapForMethod,
} from "../data/procurementActivityConfig";
import { officerProjects } from "../data/officerProjects";
import { CreateProcurementActivityView } from "./CreateProcurementActivityView";

describe("CreateProcurementActivityView", () => {
  const project = officerProjects[0];
  const plan = project.plans[0];

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

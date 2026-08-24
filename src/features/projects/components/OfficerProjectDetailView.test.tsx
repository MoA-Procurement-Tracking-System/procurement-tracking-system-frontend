import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { officerProjects } from "../data/officerProjects";
import { OfficerProjectDetailView } from "./OfficerProjectDetailView";

describe("OfficerProjectDetailView", () => {
  it("shows entered Create Project fields and excludes non-project fields", () => {
    const markup = renderToStaticMarkup(
      <OfficerProjectDetailView project={officerProjects[0]} />,
    );

    expect(markup).toContain("Country / organisation");
    expect(markup).toContain("Executing agency");
    expect(markup).toContain("Organization / region");
    expect(markup).toContain("Assigned officers");
    expect(markup).toContain("Financing no.");
    expect(markup).toContain("Components");
    expect(markup).toContain("Category");
    expect(markup).not.toContain("Categories");
    expect(markup).not.toContain("Objective");
    expect(markup).not.toContain("Total budget");
    expect(markup).not.toContain("Sector");
  });

  it("omits optional project fields that were not entered", () => {
    const project = {
      ...officerProjects[0],
      components: undefined,
      financingNumbers: undefined,
      organizationRegion: undefined,
      projectPeriod: undefined,
      sapIdentificationNumber: undefined,
      subcomponents: undefined,
    };
    const markup = renderToStaticMarkup(
      <OfficerProjectDetailView project={project} />,
    );

    expect(markup).not.toContain("Organization / region");
    expect(markup).not.toContain("Project period");
    expect(markup).not.toContain("SAP / identification no.");
    expect(markup).not.toContain("Financing no.");
    expect(markup).not.toContain("Components");
    expect(markup).not.toContain("Subcomponents");
    expect(markup).not.toContain("Not provided");
  });
});

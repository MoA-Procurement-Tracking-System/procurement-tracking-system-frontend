import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  getPlanActivities,
  OfficerProcurementPlanDetailView,
} from "./OfficerProcurementPlanDetailView";
import { officerProjects } from "../data/officerProjects";

describe("OfficerProcurementPlanDetailView", () => {
  it("renders the selected plan and first activity page without summary cards", () => {
    const project = officerProjects[0];
    const plan = project.plans[0];
    const markup = renderToStaticMarkup(
      <OfficerProcurementPlanDetailView plan={plan} project={project} />,
    );

    expect(markup).toContain("2016 EFY Annual Procurement Plan");
    expect(markup).toContain("Reference:");
    expect(markup).toContain(plan.reference);
    expect(markup).not.toContain("Category:");
    expect(markup).not.toContain("Total Estimated Value");
    expect(markup).not.toContain("Progress Summary");
    expect(markup).not.toContain("Approval");
    expect(markup).not.toContain("Reports");
    expect(markup).toContain("All Categories");
    expect(markup).toContain("All Methods");
    expect(markup).toContain("All Statuses");
    expect(markup).toContain("MOA/DRV/G/01");
    expect(markup).toContain("activity=MOA%2FDRV%2FG%2F01");
    expect(markup).toContain("Showing 1 to 4 of 12 results");
  });

  it("keeps activity status totals consistent for every plan", () => {
    for (const project of officerProjects) {
      for (const plan of project.plans) {
        expect(
          plan.completedActivities +
            plan.delayedActivities +
            plan.inProgressActivities,
        ).toBe(plan.activities);
      }
    }
  });

  it("keeps every generated activity in its plan category", () => {
    for (const project of officerProjects) {
      for (const plan of project.plans) {
        const activities = getPlanActivities(project, plan);
        expect(
          activities.every((activity) => activity.category === plan.category),
        ).toBe(true);
      }
    }
  });

  it("normalizes previously saved activities to their parent plan category", () => {
    const project = officerProjects[0];
    const plan = {
      ...project.plans[0],
      activities: 0,
      completedActivities: 0,
      delayedActivities: 0,
      inProgressActivities: 0,
    };
    const [activity] = getPlanActivities(project, plan, [
      {
        category: "Works",
        currentStage: "Draft",
        description: "Legacy activity",
        estimatedAmount: 1,
        method: "RFB",
        reference: "LEGACY-001",
        status: "Not Started",
      },
    ]);

    expect(activity.category).toBe(plan.category);
  });

  it("shows a browser-saved activity in its plan table", () => {
    const project = officerProjects[0];
    const emptyPlan = {
      ...project.plans[0],
      activities: 0,
      completedActivities: 0,
      delayedActivities: 0,
      estimatedValue: 0,
      inProgressActivities: 0,
    };
    const markup = renderToStaticMarkup(
      <OfficerProcurementPlanDetailView
        plan={emptyPlan}
        project={project}
        savedActivities={[
          {
            category: "Goods",
            currentStage: "Draft Request for Quotations",
            description: "Supply of veterinary cold-chain equipment",
            estimatedAmount: 2_500_000,
            method: "RFQ / Shopping",
            reference: "MOA/DRV/G/01",
            status: "Not Started",
          },
        ]}
      />,
    );

    expect(markup).toContain("1 Activities");
    expect(markup).toContain("2,500,000.00");
    expect(markup).toContain("Supply of veterinary cold-chain equipment");
    expect(markup).toContain("Not Started");
  });
});

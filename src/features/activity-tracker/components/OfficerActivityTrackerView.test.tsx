import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { officerProjects } from "../../projects/data/officerProjects";
import {
  collectTrackableActivities,
  OfficerActivityTrackerView,
} from "./OfficerActivityTrackerView";

describe("OfficerActivityTrackerView", () => {
  it("renders the officer tracking workspace and filters", () => {
    const markup = renderToStaticMarkup(<OfficerActivityTrackerView />);
    expect(markup).toContain("Activity Tracker");
    expect(markup).toContain("Approved-plan activities");
    expect(markup).toContain("Search activity #, description, plan, or stage");
    expect(markup).toContain("Process Status");
    expect(markup).toContain("More Filters");
  });

  it("includes activities from approved plans only", () => {
    const items = collectTrackableActivities(officerProjects, [], []);
    expect(items).toHaveLength(27);
    expect(items.every((item) => item.plan.status === "Approved")).toBe(true);
    expect(items.some((item) => item.plan.status === "Draft")).toBe(false);
  });
});

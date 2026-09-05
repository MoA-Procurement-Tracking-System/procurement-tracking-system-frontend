import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";
import { DirectorDashboard } from "./DirectorDashboard";
import type { AuthUser } from "@/lib/authTypes";

const mockUser: AuthUser = {
  id: "user-dir-1",
  email: "director@moa.gov.et",
  username: "daniel_director",
  displayName: "Ato Daniel Getachew",
  role: "DIRECTOR",
};

describe("DirectorDashboard - Visual Layout & Mockup Compliance", () => {
  it("renders the top filter bar with year, sector, project, and status dropdowns and no search bar", () => {
    const html = renderToStaticMarkup(<DirectorDashboard user={mockUser} />);

    expect(html).not.toContain("Search procurement plan or ID...");
    expect(html).toContain("2017 EFY");
    expect(html).toContain("All Sectors");
    expect(html).toContain("All Projects (0)");
    expect(html).toContain("All Statuses");
  });

  it("renders the 4 KPI summary cards with proper links and values", () => {
    const html = renderToStaticMarkup(<DirectorDashboard user={mockUser} />);

    // Total Projects
    expect(html).toContain("Total Projects");
    expect(html).toContain("Active Portfolios");
    expect(html).toContain("View All");

    // Awaiting Review
    expect(html).toContain("Awaiting Review");
    expect(html).toContain("Pending Decision");
    expect(html).toContain("Review Now");

    // Committee Progress
    expect(html).toContain("Committee Progress");
    expect(html).toContain("In Deliberation");
    expect(html).toContain("Check Votes");

    // Critical Delays
    expect(html).toContain("Critical Delays");
    expect(html).toContain("overdue &gt;7d");
    expect(html).toContain("Action Required");
    expect(html).toContain("Needs Action");
  });

  it("renders the Procurement Financial Capital & Contract Summary banner", () => {
    const html = renderToStaticMarkup(<DirectorDashboard user={mockUser} />);

    expect(html).toContain(
      "Procurement Financial Capital &amp; Contract Summary",
    );
    expect(html).toContain("Executed Disbursed");
    expect(html).toContain("Currency:");
    expect(html).toContain("ETB (Ethiopian Birr)");
    expect(html).toContain("Plan Estimated Value");
    expect(html).toContain("Approved annual allocation");
    expect(html).toContain("Signed Contracts Committed");
    expect(html).toContain("Contract Execution Rate");
    expect(html).toContain("Actual Disbursed / Paid");
    expect(html).toContain("Remaining Uncommitted Balance");
    expect(html).toContain("Available capacity");
    expect(html).toContain("Portfolio Spend Composition");
  });

  it("renders the 9 macro pipeline stages", () => {
    const html = renderToStaticMarkup(<DirectorDashboard user={mockUser} />);

    expect(html).toContain("Procurement Workflow Pipeline (Stage Volume)");
    expect(html).toContain("Across 0 Portfolios");
    expect(html).toContain("1. PLAN");
    expect(html).toContain("2. REVIEW");
    expect(html).toContain("3. COMM");
    expect(html).toContain("4. TENDER");
    expect(html).toContain("5. EVAL");
    expect(html).toContain("6. AWARD");
    expect(html).toContain("7. CONT");
    expect(html).toContain("8. EXEC");
    expect(html).toContain("9. DONE");
    expect(html).toContain("Primary bottleneck:");
    expect(html).toContain("None detected");
  });

  it("renders Procurement Financial Position (Plan vs Actual) and next audit date", () => {
    const html = renderToStaticMarkup(<DirectorDashboard user={mockUser} />);

    expect(html).toContain("Procurement Financial Position");
    expect(html).toContain("Plan vs Actual");
    expect(html).toContain("Estimated (Plan)");
    expect(html).toContain("Contracted");
    expect(html).toContain("Paid (Disbursed)");
    expect(html).toContain("Next Directorate Audit");
    expect(html).toContain("Not scheduled");
  });

  it("renders Plans Awaiting Director Review panel with empty state when no plans exist", () => {
    const html = renderToStaticMarkup(<DirectorDashboard user={mockUser} />);

    expect(html).toContain("Plans Awaiting Director Review (0)");
    expect(html).toContain(
      "Require formal Directorate approval or returned revision",
    );
    expect(html).toContain("No plans matching current filter criteria.");
  });

  it("renders Critical Delays Requiring Immediate Intervention table with empty state", () => {
    const html = renderToStaticMarkup(<DirectorDashboard user={mockUser} />);

    expect(html).toContain(
      "Critical Delays Requiring Immediate Intervention (0)",
    );
    expect(html).toContain("ALERT ACTIVE");
    expect(html).toContain("No critical delays found.");
  });

  it("renders government operational footer", () => {
    const html = renderToStaticMarkup(<DirectorDashboard user={mockUser} />);

    expect(html).toContain("PTS System Operational (v2.4-Gov)");
    expect(html).toContain("Baseline Preservation Lock:");
    expect(html).toContain("Active");
    expect(html).toContain(
      "Ministry of Agriculture • Federal Democratic Republic of Ethiopia • 2017 EFY",
    );
  });

  it("contains overflow-x-hidden and min-w-0 container classes to prevent UI horizontal overflow", () => {
    const html = renderToStaticMarkup(<DirectorDashboard user={mockUser} />);

    expect(html).toContain("overflow-x-hidden");
    expect(html).toContain("min-w-0");
    expect(html).not.toContain("1.8000046");
    expect(html).not.toContain("e+66");
  });
});

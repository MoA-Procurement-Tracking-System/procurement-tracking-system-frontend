import { describe, expect, it } from "vitest";
import type { ProcurementActivitySummary } from "@/features/projects/data/officerActivityDrafts";
import {
  calculateDelayDays,
  createInitialActivityTrackingRecord,
  effectiveTargetDate,
  parseActivityTrackingRecords,
  upsertActivityTrackingRecord,
  type ActivityStageTracking,
} from "./officerActivityTracking";

const activity: ProcurementActivitySummary = {
  category: "Goods",
  currentStage: "Bid Opening",
  description: "Procurement of Veterinary Vaccines",
  estimatedAmount: 45_000_000,
  method: "RFB - National",
  reference: "MOA/DRV/G/01",
  status: "In Progress",
};

describe("officer activity tracking", () => {
  it("creates an execution record without changing planning data", () => {
    const record = createInitialActivityTrackingRecord(
      "PRJ-24-001",
      "PP-DRIVE-2016-01",
      activity,
    );
    expect(record.processStatus).toBe("Under Implementation");
    expect(record.progressPercent).toBe(50);
    expect(record.stages).toEqual([]);
  });

  it("uses the latest revision as the effective target and preserves history", () => {
    const tracking: ActivityStageTracking = {
      remarks: "",
      revisions: [
        {
          createdAt: "2026-08-01T00:00:00.000Z",
          reason: "Evaluation required additional clarification.",
          revisionNumber: 1,
          targetDate: { ethiopian: "25-Nehase-2018", gregorian: "2026-08-31" },
        },
        {
          createdAt: "2026-08-10T00:00:00.000Z",
          reason: "Committee meeting rescheduled.",
          revisionNumber: 2,
          targetDate: {
            ethiopian: "05-Meskerem-2019",
            gregorian: "2026-09-15",
          },
        },
      ],
      stageName: "Evaluation Approval",
      status: "In Progress",
    };
    expect(
      effectiveTargetDate(
        { ethiopian: "01-Nehase-2018", gregorian: "2026-08-07" },
        tracking,
      ).gregorian,
    ).toBe("2026-09-15");
    expect(tracking.revisions).toHaveLength(2);
  });

  it("calculates delay from actual/current date and ignores N/A stages", () => {
    const original = { ethiopian: "01-Nehase-2018", gregorian: "2026-08-07" };
    expect(calculateDelayDays(original, undefined, "2026-08-21")).toBe(14);
    expect(
      calculateDelayDays(
        original,
        {
          actualDate: { ethiopian: "20-Nehase-2018", gregorian: "2026-08-26" },
          remarks: "",
          revisions: [],
          stageName: "Bid Opening",
          status: "Completed",
        },
        "2026-08-21",
      ),
    ).toBe(19);
    expect(
      calculateDelayDays(
        original,
        {
          remarks: "",
          revisions: [],
          stageName: "Optional Approval",
          status: "Not Applicable",
        },
        "2026-08-21",
      ),
    ).toBe(0);
  });

  it("round-trips and replaces records by project, plan, and activity", () => {
    const record = {
      ...createInitialActivityTrackingRecord(
        "PRJ-24-001",
        "PP-DRIVE-2016-01",
        activity,
      ),
      updatedAt: "2026-08-21T00:00:00.000Z",
    };
    expect(parseActivityTrackingRecords(JSON.stringify([record]))).toEqual([
      record,
    ]);
    expect(
      upsertActivityTrackingRecord([record], {
        ...record,
        progressPercent: 75,
      }),
    ).toEqual([{ ...record, progressPercent: 75 }]);
  });
});

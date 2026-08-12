import { ClipboardCheck, FileClock, Gavel, History } from "lucide-react";
import type { AuthUser } from "@/lib/authTypes";
import { getDashboardHeading } from "../../dashboard.config";
import { DashboardOverview } from "../DashboardOverview";

export function CommitteeDashboard({ user }: { user: AuthUser }) {
  const heading = getDashboardHeading("ENDORSING_COMMITTEE");

  return (
    <DashboardOverview
      user={user}
      eyebrow={heading.eyebrow}
      description={heading.description}
      metrics={[
        {
          label: "Plans for review",
          value: "—",
          detail: "Available when committee workflow data is connected.",
          icon: ClipboardCheck,
          tone: "blue",
        },
        {
          label: "Pending decisions",
          value: "—",
          detail: "Available when decision summaries are connected.",
          icon: FileClock,
          tone: "orange",
        },
        {
          label: "Recorded decisions",
          value: "—",
          detail: "Available when decision history is connected.",
          icon: Gavel,
          tone: "violet",
        },
        {
          label: "Recent reviews",
          value: "—",
          detail: "Available when review activity is connected.",
          icon: History,
          tone: "emerald",
        },
      ]}
      workspaceTitle="Committee workspaces"
      workspaceDescription="Open plans awaiting committee review or return to your recorded decisions."
      workspaces={[
        {
          title: "Plans for review",
          description: "Review plans submitted for committee endorsement.",
          href: "/workspace/plan-for-review",
          actionLabel: "Review plans",
          icon: ClipboardCheck,
        },
        {
          title: "My decisions",
          description: "Review the decisions you recorded for submitted plans.",
          href: "/workspace/my-decisions",
          actionLabel: "View decisions",
          icon: Gavel,
        },
      ]}
      focusTitle="Committee priorities"
      focusDescription="Keep endorsement decisions consistent, complete and traceable."
      focusItems={[
        {
          title: "Review supporting evidence",
          description:
            "Confirm that each submission contains the required records.",
        },
        {
          title: "Record a clear decision",
          description:
            "Capture the outcome and any conditions or return reasons.",
        },
        {
          title: "Complete pending reviews",
          description:
            "Address outstanding plans before their decision deadlines.",
        },
      ]}
    />
  );
}

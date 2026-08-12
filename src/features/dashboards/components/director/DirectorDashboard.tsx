import {
  BarChart3,
  ClipboardCheck,
  FolderKanban,
  ListChecks,
} from "lucide-react";
import type { AuthUser } from "@/lib/authTypes";
import { getDashboardHeading } from "../../dashboard.config";
import { DashboardOverview } from "../DashboardOverview";

export function DirectorDashboard({ user }: { user: AuthUser }) {
  const heading = getDashboardHeading("DIRECTOR");

  return (
    <DashboardOverview
      user={user}
      eyebrow={heading.eyebrow}
      description={heading.description}
      metrics={[
        {
          label: "Plans for review",
          value: "—",
          detail: "Available when plan summaries are connected.",
          icon: ClipboardCheck,
          tone: "orange",
        },
        {
          label: "Active projects",
          value: "—",
          detail: "Available when project summaries are connected.",
          icon: FolderKanban,
          tone: "blue",
        },
        {
          label: "Committee progress",
          value: "—",
          detail: "Available when review workflow data is connected.",
          icon: ListChecks,
          tone: "violet",
        },
        {
          label: "Reports available",
          value: "—",
          detail: "Available when reporting endpoints are connected.",
          icon: BarChart3,
          tone: "emerald",
        },
      ]}
      workspaceTitle="Director workspaces"
      workspaceDescription="Review directorate procurement work and monitor progress across its lifecycle."
      workspaces={[
        {
          title: "Plans for review",
          description: "Review procurement plans awaiting director action.",
          href: "/workspace/plan-for-review",
          actionLabel: "Review plans",
          icon: ClipboardCheck,
        },
        {
          title: "Projects",
          description: "Monitor procurement projects across the directorate.",
          href: "/workspace/projects",
          actionLabel: "Open projects",
          icon: FolderKanban,
        },
        {
          title: "Committee progress",
          description: "Follow plans submitted to the Endorsing Committee.",
          href: "/workspace/committee-progress",
          actionLabel: "View progress",
          icon: ListChecks,
        },
        {
          title: "Reports",
          description: "Open procurement summaries and directorate reports.",
          href: "/workspace/reports",
          actionLabel: "Open reports",
          icon: BarChart3,
        },
      ]}
      focusTitle="Director priorities"
      focusDescription="Focus review attention where it keeps procurement decisions moving."
      focusItems={[
        {
          title: "Review submitted plans",
          description:
            "Confirm completeness and provide timely director action.",
        },
        {
          title: "Monitor delayed work",
          description:
            "Identify stalled activities and request corrective follow-up.",
        },
        {
          title: "Follow committee submissions",
          description: "Track plans through the endorsement decision process.",
        },
      ]}
    />
  );
}

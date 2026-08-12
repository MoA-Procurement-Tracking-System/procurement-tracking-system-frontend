import {
  Activity,
  FileSignature,
  FolderKanban,
  ShieldCheck,
} from "lucide-react";
import type { AuthUser } from "@/lib/authTypes";
import { getDashboardHeading } from "../../dashboard.config";
import { DashboardOverview } from "../DashboardOverview";

export function OfficerDashboard({ user }: { user: AuthUser }) {
  const heading = getDashboardHeading("OFFICER");

  return (
    <DashboardOverview
      user={user}
      eyebrow={heading.eyebrow}
      description={heading.description}
      metrics={[
        {
          label: "Assigned projects",
          value: "—",
          detail: "Available when project summaries are connected.",
          icon: FolderKanban,
          tone: "blue",
        },
        {
          label: "Open activities",
          value: "—",
          detail: "Available when activity tracking is connected.",
          icon: Activity,
          tone: "orange",
        },
        {
          label: "Contract actions",
          value: "—",
          detail: "Available when contract summaries are connected.",
          icon: FileSignature,
          tone: "violet",
        },
        {
          label: "Session status",
          value: "Secure",
          detail: "Your authenticated session is active.",
          icon: ShieldCheck,
          tone: "emerald",
        },
      ]}
      workspaceTitle="Officer workspaces"
      workspaceDescription="Open the operational areas available to Procurement Officers."
      workspaces={[
        {
          title: "Projects",
          description:
            "View and follow the procurement projects assigned to you.",
          href: "/workspace/projects",
          actionLabel: "Open projects",
          icon: FolderKanban,
        },
        {
          title: "Activity tracker",
          description:
            "Track activities, milestones and upcoming procurement work.",
          href: "/workspace/activity-tracker",
          actionLabel: "Track activities",
          icon: Activity,
        },
        {
          title: "Contracts",
          description: "Review contract records and current delivery status.",
          href: "/workspace/contracts",
          actionLabel: "Review contracts",
          icon: FileSignature,
        },
      ]}
      focusTitle="Officer priorities"
      focusDescription="Use these checks to keep assigned procurement work complete and current."
      focusItems={[
        {
          title: "Update assigned records",
          description:
            "Keep project and activity information accurate and timely.",
        },
        {
          title: "Follow upcoming milestones",
          description: "Review approaching dates before they become delays.",
        },
        {
          title: "Maintain supporting records",
          description:
            "Ensure contract and activity information remains traceable.",
        },
      ]}
    />
  );
}

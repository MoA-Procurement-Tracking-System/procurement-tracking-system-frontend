import { CircleAlert, History, MailCheck, Users } from "lucide-react";
import type { AuthUser } from "@/lib/authTypes";
import { getDashboardHeading } from "../../dashboard.config";
import { DashboardOverview } from "../DashboardOverview";

export function AdminDashboard({ user }: { user: AuthUser }) {
  const heading = getDashboardHeading("ADMIN");

  return (
    <DashboardOverview
      user={user}
      eyebrow={heading.eyebrow}
      description={heading.description}
      metrics={[
        {
          label: "Authorized users",
          value: "—",
          detail: "Available when user-list summaries are connected.",
          icon: Users,
          tone: "blue",
        },
        {
          label: "Pending invitations",
          value: "—",
          detail: "Available when invitation summaries are connected.",
          icon: MailCheck,
          tone: "orange",
        },
        {
          label: "Security events",
          value: "—",
          detail: "Available when audit summaries are connected.",
          icon: CircleAlert,
          tone: "violet",
        },
        {
          label: "Recent system logs",
          value: "—",
          detail: "Available when system-log summaries are connected.",
          icon: History,
          tone: "emerald",
        },
      ]}
      workspaceTitle="Administration workspaces"
      workspaceDescription="Manage access to the system and review traceable authentication activity."
      workspaces={[
        {
          title: "User management",
          description: "Create authorized users and send account invitations.",
          href: "/admin/users",
          actionLabel: "Manage users",
          icon: Users,
        },
        {
          title: "System logs",
          description: "Review timestamped authentication and system activity.",
          href: "/workspace/system-logs",
          actionLabel: "Review logs",
          icon: History,
        },
      ]}
      focusTitle="Administrator priorities"
      focusDescription="Protect system access and keep account activity reviewable."
      focusItems={[
        {
          title: "Provision users carefully",
          description: "Assign only the role required for each user’s work.",
        },
        {
          title: "Review failed access",
          description:
            "Investigate repeated failed sign-ins and locked accounts.",
        },
        {
          title: "Maintain invitation delivery",
          description:
            "Monitor failed invitations and the approved email service.",
        },
      ]}
    />
  );
}

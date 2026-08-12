"use client";

import { useState } from "react";
import { History, ShieldCheck, UserCheck, Users, UserX } from "lucide-react";
import type { AuthUser } from "@/lib/authTypes";
import { getDashboardHeading } from "../../dashboard.config";
import { DashboardOverview } from "../DashboardOverview";
import { RecentAuditTrailTable, type DemoAuditLog } from "./RecentAuditTrailTable";
import { UserAccessTable, type DemoUser } from "./UserAccessTable";

// Initial Demo Data matching the reference screenshot
const INITIAL_DEMO_USERS: DemoUser[] = [
  {
    id: "1",
    fullName: "Demelash Worku",
    email: "officer@moa.gov.et",
    role: "OFFICER",
    status: "Active",
  },
  {
    id: "2",
    fullName: "Dr. Yared Worku",
    email: "director@moa.gov.et",
    role: "DIRECTOR",
    status: "Active",
  },
  {
    id: "3",
    fullName: "Ato Solomon Tadesse",
    email: "management@moa.gov.et",
    role: "MANAGEMENT",
    status: "Active",
  },
  {
    id: "4",
    fullName: "Tewodros Kassaye",
    email: "admin@moa.gov.et",
    role: "ADMIN",
    status: "Active",
  },
  {
    id: "5",
    fullName: "Abebe Kebede",
    email: "newuser@moa.gov.et",
    role: "OFFICER",
    status: "Active",
  },
  {
    id: "6",
    fullName: "Sara Hailu",
    email: "sara@moa.gov.et",
    role: "DIRECTOR",
    status: "Active",
  },
  {
    id: "7",
    fullName: "Hana Girma",
    email: "hana@moa.gov.et",
    role: "ENDORSEMENT_COMMITTEE",
    status: "Inactive",
  },
  {
    id: "8",
    fullName: "Dawit Mekonnen",
    email: "dawit@moa.gov.et",
    role: "OFFICER",
    status: "Inactive",
  },
];

const INITIAL_DEMO_LOGS: DemoAuditLog[] = [
  {
    id: "log-1",
    timestamp: "8/12/2026, 11:09:01 PM",
    user: "admin",
    role: "ADMIN",
    userAndRole: "admin (ADMIN)",
    action: "LOGIN",
    recordId: "usr-3",
    details: "User admin logged in successfully as ADMIN",
  },
  {
    id: "log-2",
    timestamp: "8/12/2026, 11:09:01 PM",
    user: "admin",
    role: "ADMIN",
    userAndRole: "admin (ADMIN)",
    action: "PASSWORD_CHANGED",
    recordId: "usr-3",
    details: "Account security credentials updated for user admin",
  },
  {
    id: "log-3",
    timestamp: "1/18/2026, 1:00:00 PM",
    user: "director",
    role: "DIRECTOR",
    userAndRole: "director (DIRECTOR)",
    action: "APPROVE_PLAN",
    recordId: "MoA/BREFONS/2018/APP-01",
    details: "Procurement Director approved plan and submitted to Management Committee",
  },
  {
    id: "log-4",
    timestamp: "1/20/2026, 2:00:00 PM",
    user: "management",
    role: "MANAGEMENT",
    userAndRole: "management (MANAGEMENT)",
    action: "COMMITTEE_VOTE",
    recordId: "MoA/BREFONS/2018/APP-01",
    details: "Ato Solomon Tadesse cast APPROVE vote for BREFONS Plan",
  },
];

export function AdminDashboard({ user }: { user: AuthUser }) {
  const heading = getDashboardHeading("ADMIN");

  // State for demo users list & toggle functionality
  const [users, setUsers] = useState<DemoUser[]>(INITIAL_DEMO_USERS);

  const handleToggleStatus = (userId: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" }
          : u
      )
    );
  };

  const totalAccounts = users.length;
  const activeAccess = users.filter((u) => u.status === "Active").length;
  const deactivatedAccounts = users.filter((u) => u.status === "Inactive").length;

  const officersCount = users.filter((u) => u.role === "OFFICER").length;
  const directorsCount = users.filter((u) => u.role === "DIRECTOR").length;
  const adminsCount = users.filter((u) => u.role === "ADMIN").length;

  return (
    <div className="space-y-6">
      <DashboardOverview
        user={user}
        eyebrow={heading.eyebrow}
        description={heading.description}
        metrics={[
          {
            label: "TOTAL SYSTEM ACCOUNTS",
            value: String(totalAccounts),
            detail: "Registered User Profiles",
            icon: Users,
            tone: "blue",
          },
          {
            label: "ACTIVE ACCESS",
            value: String(activeAccess),
            detail: "Permitted To Sign In",
            icon: UserCheck,
            tone: "emerald",
            hasRightAccent: true,
          },
          {
            label: "DEACTIVATED ACCOUNTS",
            value: String(deactivatedAccounts),
            detail: "Access Suspended",
            icon: UserX,
            tone: "rose",
            hasRightAccent: true,
          },
          {
            label: "SYSTEM ROLE BREAKDOWN",
            value: String(totalAccounts),
            detail: `Officers: ${officersCount} | Directors: ${directorsCount} | Admins: ${adminsCount}`,
            icon: ShieldCheck,
            tone: "purple",
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

      {/* User Account Status & Access Controls Table */}
      <UserAccessTable users={users} onToggleStatus={handleToggleStatus} />

      {/* Recent Audit Trail Table */}
      <RecentAuditTrailTable logs={INITIAL_DEMO_LOGS} />
    </div>
  );
}

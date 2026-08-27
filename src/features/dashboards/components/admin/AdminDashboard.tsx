"use client";

import { useState, useEffect, useCallback } from "react";
import {
  History,
  ShieldCheck,
  Sliders,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import type { AuthUser } from "@/lib/authTypes";
import {
  fetchUsers,
  fetchAuditLogs,
  updateUser,
  type ApiUser,
  type AuditLogEntry,
} from "@/lib/adminApi";
import { getDashboardHeading } from "../../dashboard.config";
import { DashboardOverview } from "../DashboardOverview";
import { RecentAuditTrailTable } from "./RecentAuditTrailTable";
import { UserAccessTable } from "./UserAccessTable";

const DEFAULT_ADMIN_USERS: ApiUser[] = [
  {
    id: "u-off-1",
    username: "officer@moa.gov.et",
    displayName: "Abebe Bikila",
    email: "officer@moa.gov.et",
    name: "Abebe Bikila",
    role: "ProcurementOfficer",
    authRole: "OFFICER",
    status: "ACTIVE",
    isActive: true,
    lastLoginAt: "2026-08-26T09:30:00Z",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-08-26T09:30:00Z",
  },
  {
    id: "u-dir-1",
    username: "director@moa.gov.et",
    displayName: "Dr. Aster Kebede",
    email: "director@moa.gov.et",
    name: "Dr. Aster Kebede",
    role: "ProcurementDirector",
    authRole: "DIRECTOR",
    status: "ACTIVE",
    isActive: true,
    lastLoginAt: "2026-08-26T10:15:00Z",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-08-26T10:15:00Z",
  },
  {
    id: "u-com-1",
    username: "genet@moa.gov.et",
    displayName: "Genet Tadesse",
    email: "genet@moa.gov.et",
    name: "Genet Tadesse",
    role: "ManagementTeam",
    authRole: "ENDORSING_COMMITTEE",
    status: "ACTIVE",
    isActive: true,
    lastLoginAt: "2026-08-26T11:00:00Z",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-08-26T11:00:00Z",
  },
  {
    id: "u-adm-1",
    username: "admin@moa.gov.et",
    displayName: "Tewodros Kassahun",
    email: "admin@moa.gov.et",
    name: "Tewodros Kassahun",
    role: "Administrator",
    authRole: "ADMIN",
    status: "ACTIVE",
    isActive: true,
    lastLoginAt: "2026-08-26T12:00:00Z",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-08-26T12:00:00Z",
  },
  {
    id: "u-off-2",
    username: "marta@moa.gov.et",
    displayName: "Marta Tadesse",
    email: "marta@moa.gov.et",
    name: "Marta Tadesse",
    role: "ProcurementOfficer",
    authRole: "OFFICER",
    status: "PENDING_INVITATION",
    isActive: false,
    lastLoginAt: null,
    createdAt: "2026-08-24T00:00:00Z",
    updatedAt: "2026-08-24T00:00:00Z",
  },
];

const DEFAULT_ADMIN_LOGS: AuditLogEntry[] = [
  {
    id: "log-1",
    action: "USER_LOGIN_SUCCESS",
    entityType: "AUTH",
    entityId: "u-off-1",
    userId: "u-off-1",
    user: { id: "u-off-1", name: "Abebe Bikila", email: "officer@moa.gov.et" },
    changes: { status: "Authenticated via web session", ipAddress: "196.189.16.42" },
    createdAt: "2026-08-26T09:30:00Z",
  },
  {
    id: "log-2",
    action: "PLAN_SUBMITTED",
    entityType: "PLAN",
    entityId: "plan-3",
    userId: "u-off-1",
    user: { id: "u-off-1", name: "Abebe Bikila", email: "officer@moa.gov.et" },
    changes: { plan: "BREFONS - Consultancy Services Plan", status: "Submitted to Director", ipAddress: "196.189.16.42" },
    createdAt: "2026-08-26T10:00:00Z",
  },
  {
    id: "log-3",
    action: "PLAN_SENT_TO_COMMITTEE",
    entityType: "PLAN",
    entityId: "plan-3",
    userId: "u-dir-1",
    user: { id: "u-dir-1", name: "Dr. Aster Kebede", email: "director@moa.gov.et" },
    changes: { decision: "Approved and sent to Endorsement Committee", ipAddress: "196.189.16.10" },
    createdAt: "2026-08-26T10:30:00Z",
  },
  {
    id: "log-4",
    action: "USER_INVITED",
    entityType: "USER",
    entityId: "u-com-1",
    userId: "u-adm-1",
    user: { id: "u-adm-1", name: "Tewodros Kassahun", email: "admin@moa.gov.et" },
    changes: { role: "ManagementTeam (Endorsement Committee)", email: "genet@moa.gov.et", ipAddress: "196.189.16.2" },
    createdAt: "2026-08-26T11:00:00Z",
  },
];

export function AdminDashboard({ user }: { user: AuthUser }) {
  const heading = getDashboardHeading("ADMIN");

  const [users, setUsers] = useState<ApiUser[]>([]);
  const [totalUserCount, setTotalUserCount] = useState<number>(0);
  const [isUsersLoading, setIsUsersLoading] = useState(true);

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(true);

  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const usersRes = await fetchUsers({ pageSize: 50 });
      if (usersRes && Array.isArray(usersRes.data)) {
        setUsers(usersRes.data);
        setTotalUserCount(usersRes.meta?.total ?? usersRes.data.length);
      }
    } catch {
      // Keep empty state
    }

    try {
      const logsRes = await fetchAuditLogs({ pageSize: 5 });
      if (logsRes && Array.isArray(logsRes.data)) {
        setLogs(logsRes.data);
      }
    } catch {
      // Keep empty state
    }
  }, []);

  useEffect(() => {
    let active = true;

    fetchUsers({ pageSize: 50 })
      .then((usersRes) => {
        if (active && usersRes && Array.isArray(usersRes.data)) {
          setUsers(usersRes.data);
          setTotalUserCount(usersRes.meta?.total ?? usersRes.data.length);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setIsUsersLoading(false);
      });

    fetchAuditLogs({ pageSize: 5 })
      .then((logsRes) => {
        if (active && logsRes && Array.isArray(logsRes.data)) {
          setLogs(logsRes.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setIsLogsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleToggleStatus = async (targetUser: ApiUser) => {
    setTogglingId(targetUser.id);
    try {
      await updateUser(targetUser.id, { isActive: !targetUser.isActive });
      await loadData();
    } catch {
      // Handle gracefully
    } finally {
      setTogglingId(null);
    }
  };

  const totalAccounts = totalUserCount || users.length;
  const activeAccess = users.filter(
    (u) => u.isActive && u.status !== "PENDING_INVITATION",
  ).length;
  const deactivatedAccounts = users.filter((u) => !u.isActive).length;

  const officersCount = users.filter(
    (u) => u.authRole === "OFFICER" || u.role === "ProcurementOfficer",
  ).length;
  const directorsCount = users.filter(
    (u) => u.authRole === "DIRECTOR" || u.role === "ProcurementDirector",
  ).length;
  const adminsCount = users.filter(
    (u) => u.authRole === "ADMIN" || u.role === "Administrator",
  ).length;

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
            description:
              "Create authorized users and send account invitations.",
            href: "/admin/users",
            actionLabel: "Manage users",
            icon: Users,
          },
          {
            title: "Threshold rules",
            description:
              "Configure donor-based procurement method thresholds and review limits.",
            href: "/workspace/threshold-rules",
            actionLabel: "Configure thresholds",
            icon: Sliders,
          },
          {
            title: "System logs",
            description:
              "Review timestamped authentication and system activity.",
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

      {/* User Account Status & Access Controls Table (Director Theme, 5 items) */}
      <UserAccessTable
        users={users}
        isLoading={isUsersLoading}
        onToggleStatus={handleToggleStatus}
        togglingId={togglingId}
        onRefresh={loadData}
      />

      {/* Recent Audit Trail Table (Director Theme, 5 items) */}
      <RecentAuditTrailTable logs={logs} isLoading={isLogsLoading} />
    </div>
  );
}

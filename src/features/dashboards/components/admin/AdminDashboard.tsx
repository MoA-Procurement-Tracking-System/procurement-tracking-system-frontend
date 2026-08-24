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
      setUsers(usersRes.data);
      setTotalUserCount(usersRes.meta.total);
    } catch {
      // Keep existing state
    }

    try {
      const logsRes = await fetchAuditLogs({ pageSize: 5 });
      setLogs(logsRes.data);
    } catch {
      // Keep existing state
    }
  }, []);

  useEffect(() => {
    let active = true;

    fetchUsers({ pageSize: 50 })
      .then((usersRes) => {
        if (active) {
          setUsers(usersRes.data);
          setTotalUserCount(usersRes.meta.total);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setIsUsersLoading(false);
      });

    fetchAuditLogs({ pageSize: 5 })
      .then((logsRes) => {
        if (active) setLogs(logsRes.data);
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

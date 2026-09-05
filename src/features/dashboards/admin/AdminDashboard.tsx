"use client";

import {
  History,
  ShieldCheck,
  Sliders,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import type { AuthUser } from "@/lib/authTypes";
import { getDashboardHeading } from "../dashboard.config";
import { DashboardOverview } from "../DashboardOverview";
import { RecentAuditTrailTable } from "./RecentAuditTrailTable";
import { UserAccessTable } from "./UserAccessTable";
import { useAdminDashboard } from "./useAdminDashboard";

export function AdminDashboard({ user }: { user: AuthUser }) {
  const heading = getDashboardHeading("ADMIN");
  const {
    users,
    isUsersLoading,
    logs,
    isLogsLoading,
    togglingId,
    handleToggleStatus,
    metrics,
  } = useAdminDashboard(user);

  return (
    <div className="space-y-6">
      <DashboardOverview
        user={user}
        eyebrow={heading.eyebrow}
        description={heading.description}
        metrics={[
          {
            label: "TOTAL SYSTEM ACCOUNTS",
            value: String(metrics.totalAccounts),
            detail: "Registered user profiles",
            icon: Users,
            tone: "blue",
          },
          {
            label: "ACTIVE ACCESS",
            value: String(metrics.activeAccess),
            detail: "Permitted to sign in",
            icon: UserCheck,
            tone: "emerald",
          },
          {
            label: "DEACTIVATED ACCOUNTS",
            value: String(metrics.deactivatedAccounts),
            detail:
              metrics.deactivatedAccounts === 0
                ? "All registered users enabled"
                : `${metrics.deactivatedAccounts} accounts currently restricted`,
            icon: UserX,
            tone: metrics.deactivatedAccounts > 0 ? "rose" : "slate",
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section
          aria-labelledby="user-roles-breakdown-heading"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="user-roles-breakdown-heading"
                className="text-base font-bold text-slate-900"
              >
                Access Role Allocation
              </h2>
              <p className="text-xs text-slate-500">
                Current distribution of user permissions
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-100 pt-6 text-center">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-2xl font-bold text-slate-900">
                {metrics.officersCount}
              </p>
              <p className="text-xs font-semibold text-slate-500">Officers</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-2xl font-bold text-slate-900">
                {metrics.directorsCount}
              </p>
              <p className="text-xs font-semibold text-slate-500">Directors</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-2xl font-bold text-slate-900">
                {metrics.adminsCount}
              </p>
              <p className="text-xs font-semibold text-slate-500">
                Administrators
              </p>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="system-controls-heading"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="system-controls-heading"
                className="text-base font-bold text-slate-900"
              >
                Environment Health
              </h2>
              <p className="text-xs text-slate-500">
                Global runtime &amp; operational checks
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3 border-t border-slate-100 pt-6 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Database Connection</span>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                Connected (Online)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Audit Logging</span>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">System Role Guards</span>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                Strict Enforced
              </span>
            </div>
          </div>
        </section>
      </div>

      <section
        aria-labelledby="user-access-table-heading"
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="user-access-table-heading"
                className="text-base font-bold text-slate-900"
              >
                User Profiles &amp; Access Controls
              </h2>
              <p className="text-xs text-slate-500">
                Toggle access status or view assignment details
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <UserAccessTable
            users={users}
            isLoading={isUsersLoading}
            currentUser={user}
            onToggleStatus={handleToggleStatus}
            togglingId={togglingId}
          />
        </div>
      </section>

      <section
        aria-labelledby="recent-audit-logs-heading"
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h2
              id="recent-audit-logs-heading"
              className="text-base font-bold text-slate-900"
            >
              Recent Audit Trail
            </h2>
            <p className="text-xs text-slate-500">
              Latest system governance and authentication events
            </p>
          </div>
        </div>

        <div className="mt-6">
          <RecentAuditTrailTable logs={logs} isLoading={isLogsLoading} />
        </div>
      </section>
    </div>
  );
}

"use client";

export interface SystemAuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  recordId: string;
  details: string;
}

export const INITIAL_SYSTEM_LOGS: SystemAuditLogItem[] = [
  {
    id: "log-1",
    timestamp: "8/12/2026, 11:09:01 PM",
    user: "admin",
    role: "ADMIN",
    action: "LOGIN",
    recordId: "usr-3",
    details: "User admin logged in successfully as ADMIN",
  },
  {
    id: "log-2",
    timestamp: "8/12/2026, 11:09:01 PM",
    user: "admin",
    role: "ADMIN",
    action: "PASSWORD_CHANGED",
    recordId: "usr-3",
    details: "Account security credentials updated for user admin",
  },
  {
    id: "log-3",
    timestamp: "1/18/2026, 1:00:00 PM",
    user: "director",
    role: "DIRECTOR",
    action: "APPROVE_PLAN",
    recordId: "MoA/BREFONS/2018/APP-01",
    details:
      "Procurement Director approved plan and submitted to Management Committee",
  },
  {
    id: "log-4",
    timestamp: "1/20/2026, 2:00:00 PM",
    user: "management",
    role: "MANAGEMENT",
    action: "COMMITTEE_VOTE",
    recordId: "MoA/BREFONS/2018/APP-01",
    details: "Ato Solomon Tadesse cast APPROVE vote for BREFONS Plan",
  },
];

interface SystemLogsViewProps {
  logs?: SystemAuditLogItem[];
}

export function SystemLogsView({
  logs = INITIAL_SYSTEM_LOGS,
}: SystemLogsViewProps) {
  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"></div>

      {/* Main Card Container */}
      <section className="rounded-2xl border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-xs">
        {/* Card Title & Subtitle */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-[#0f172a] tracking-tight">
            System Audit Log Trail
          </h2>
          <p className="mt-0.5 text-xs text-[#64748b] font-medium">
            Complete history of user logins, role actions, package edits, and
            approvals
          </p>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#f8fafc] text-[#334155] text-xs font-bold">
                <th className="py-3.5 px-4 font-bold">Timestamp</th>
                <th className="py-3.5 px-4 font-bold">User & Role</th>
                <th className="py-3.5 px-4 font-bold">Action</th>
                <th className="py-3.5 px-4 font-bold">Record ID</th>
                <th className="py-3.5 px-4 font-bold">Details / Changes</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {logs.map((log, index) => {
                const isOddRow = index % 2 === 0;

                return (
                  <tr
                    key={log.id}
                    className={`transition-colors duration-150 hover:bg-[#f1f5f9] cursor-default ${
                      isOddRow ? "bg-[#f8fafc]" : "bg-white"
                    }`}
                  >
                    {/* Timestamp */}
                    <td className="py-4 px-4 text-[#94a3b8] font-medium whitespace-nowrap align-middle">
                      {log.timestamp}
                    </td>

                    {/* User & Role */}
                    <td className="py-4 px-4 font-bold text-[#0f172a] align-middle max-w-[140px]">
                      <div>
                        <span>{log.user}</span>{" "}
                        <span className="inline-block">({log.role})</span>
                      </div>
                    </td>

                    {/* Action Badge */}
                    <td className="py-4 px-4 whitespace-nowrap align-middle">
                      <span className="inline-block px-2.5 py-1 bg-[#f1f5f9] text-[#334155] text-[11px] font-bold rounded border border-[#e2e8f0]/60 uppercase tracking-wider">
                        {log.action}
                      </span>
                    </td>

                    {/* Record ID */}
                    <td className="py-4 px-4 font-bold text-[#047857] whitespace-nowrap align-middle">
                      {log.recordId}
                    </td>

                    {/* Details / Changes */}
                    <td className="py-4 px-4 text-[#475569] font-normal leading-relaxed align-middle">
                      {log.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

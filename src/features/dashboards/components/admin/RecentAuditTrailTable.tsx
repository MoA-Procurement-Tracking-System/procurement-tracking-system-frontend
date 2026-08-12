"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface DemoAuditLog {
  id: string;
  timestamp: string;
  user: string;
  role?: string;
  action: string;
  details: string;
  userAndRole?: string;
  recordId?: string;
}

interface RecentAuditTrailTableProps {
  logs: DemoAuditLog[];
}

export function RecentAuditTrailTable({ logs }: RecentAuditTrailTableProps) {
  return (
    <section className="rounded-2xl border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-xs space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4 px-1">
        <div>
          <h2 className="text-lg font-bold text-[#0f172a] tracking-tight">
            System Audit Log Trail
          </h2>
          <p className="text-xs text-[#64748b] font-medium mt-0.5">
            Complete history of user logins, role actions, package edits, and approvals
          </p>
        </div>

        <Link
          href="/workspace/system-logs"
          className="shrink-0 text-xs font-bold text-[#047857] hover:text-[#065f46] flex items-center gap-1 transition-colors"
        >
          Full Audit Logs
          <ArrowRight size={14} className="ml-0.5" />
        </Link>
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
                  <td className="py-4 px-4 text-[#94a3b8] font-medium whitespace-nowrap align-middle">
                    {log.timestamp}
                  </td>
                  <td className="py-4 px-4 font-bold text-[#0f172a] align-middle max-w-[140px]">
                    <div>
                      <span>{log.user}</span>{" "}
                      <span className="inline-block">({log.role || "ADMIN"})</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap align-middle">
                    <span className="inline-block px-2.5 py-1  text-[#334155] text-[11px] font-bold  uppercase tracking-wider">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-[#047857] whitespace-nowrap align-middle">
                    {log.recordId || "—"}
                  </td>
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
  );
}

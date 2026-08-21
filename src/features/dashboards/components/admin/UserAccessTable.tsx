"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface DemoUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
}

interface UserAccessTableProps {
  users: DemoUser[];
  onToggleStatus?: (userId: string) => void;
}

export function UserAccessTable({
  users,
  onToggleStatus,
}: UserAccessTableProps) {
  const renderRoleName = (role: string) => {
    switch (role.toUpperCase()) {
      case "OFFICER":
        return "Officer";
      case "DIRECTOR":
        return "Director";
      case "ENDORSING_COMMITTEE":
      case "MANAGEMENT":
        return "Endorsement Committee";
      case "ADMIN":
        return "Administrator";
      default:
        return role;
    }
  };

  return (
    <section className="rounded-2xl border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-xs space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#0f172a] tracking-tight">
            User Management Table
          </h2>
          <p className="mt-0.5 text-xs text-[#64748b] font-medium">
            Assign PTS roles, issue invitations, toggle suspension, and manage
            user security
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            className="shrink-0 text-xs font-bold text-[#047857] hover:text-[#065f46] flex items-center gap-1 transition-colors ml-2"
          >
            Full Directory
            <ArrowRight size={14} className="ml-0.5" />
          </Link>
        </div>
      </div>

      {/* Uniform Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-[#f8fafc] text-[#334155] text-xs font-bold">
              <th className="py-3.5 px-4 font-bold">User Name & Details</th>
              <th className="py-3.5 px-4 font-bold">Email Address</th>
              <th className="py-3.5 px-4 font-bold">Assigned Role</th>
              <th className="py-3.5 px-4 font-bold">Account Status</th>
              <th className="py-3.5 px-4 font-bold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {users.map((user, index) => {
              const isActive = user.status === "Active";
              const isOddRow = index % 2 === 0;

              return (
                <tr
                  key={user.id}
                  className={`transition-colors duration-150 hover:bg-[#f1f5f9] ${
                    isOddRow ? "bg-[#f8fafc]" : "bg-white"
                  }`}
                >
                  <td className="py-4 px-4 align-middle">
                    <div className="font-bold text-[#0f172a] text-xs">
                      {user.fullName}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-[#475569] font-normal align-middle">
                    {user.email}
                  </td>

                  {/* Assigned Role (Clean text format without background box) */}
                  <td className="py-4 px-4 align-middle font-bold text-[#0f172a]">
                    {renderRoleName(user.role)}
                  </td>

                  {/* Account Status (Clean text format without background box) */}
                  <td className="py-4 px-4 align-middle">
                    <span
                      className={`font-bold text-xs ${
                        isActive ? "text-[#15803d]" : "text-[#e11d48]"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>

                  {/* Actions Column (Enhanced UX Button) */}
                  <td className="py-4 px-4 text-center align-middle whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onToggleStatus?.(user.id)}
                      className={`px-3.5 py-1 text-xs font-bold rounded-full border transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs ${
                        isActive
                          ? "border-rose-200/90 bg-rose-50/90 text-rose-700 hover:bg-rose-100 hover:border-rose-300 hover:text-rose-800"
                          : "border-emerald-200/90 bg-emerald-50/90 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 hover:text-emerald-800"
                      }`}
                    >
                      {isActive ? "Deactivate" : "Activate"}
                    </button>
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

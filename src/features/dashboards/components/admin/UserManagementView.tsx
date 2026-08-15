"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Mail,
  Info,
  Send,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { createInvitedUser } from "@/lib/authApi";
import type { ProvisionableRole } from "@/lib/authTypes";

export interface UserManagementRecord {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: "OFFICER" | "DIRECTOR" | "ENDORSEMENT_COMMITTEE" | "ADMIN";
  status: "Active" | "Inactive";
  lastLogin: string;
}

export const INITIAL_USER_RECORDS: UserManagementRecord[] = [
  {
    id: "1",
    fullName: "Demelash Worku",
    username: "@officer",
    email: "officer@moa.gov.et",
    role: "OFFICER",
    status: "Active",
    lastLogin: "8/2/2026, 5:30:00 PM",
  },
  {
    id: "2",
    fullName: "Dr. Yared Worku",
    username: "@director",
    email: "director@moa.gov.et",
    role: "DIRECTOR",
    status: "Active",
    lastLogin: "8/1/2026, 12:15:00 PM",
  },
  {
    id: "3",
    fullName: "Ato Solomon Tadesse",
    username: "@management",
    email: "management@moa.gov.et",
    role: "ENDORSEMENT_COMMITTEE",
    status: "Active",
    lastLogin: "7/28/2026, 7:20:00 PM",
  },
  {
    id: "4",
    fullName: "Tewodros Kassaye",
    username: "@admin",
    email: "admin@moa.gov.et",
    role: "ADMIN",
    status: "Active",
    lastLogin: "8/12/2026, 11:09:01 PM",
  },
  {
    id: "5",
    fullName: "Abebe Kebede",
    username: "@newuser",
    email: "newuser@moa.gov.et",
    role: "OFFICER",
    status: "Active",
    lastLogin: "7/20/2026, 2:10:00 PM",
  },
  {
    id: "6",
    fullName: "Sara Hailu",
    username: "@sara",
    email: "sara@moa.gov.et",
    role: "DIRECTOR",
    status: "Active",
    lastLogin: "7/15/2026, 10:00:00 AM",
  },
  {
    id: "7",
    fullName: "Hana Girma",
    username: "@hana",
    email: "hana@moa.gov.et",
    role: "ENDORSEMENT_COMMITTEE",
    status: "Inactive",
    lastLogin: "6/30/2026, 4:45:00 PM",
  },
  {
    id: "8",
    fullName: "Dawit Mekonnen",
    username: "@dawit",
    email: "dawit@moa.gov.et",
    role: "OFFICER",
    status: "Inactive",
    lastLogin: "6/12/2026, 9:20:00 AM",
  },
];

interface UserManagementViewProps {
  initialMode?: "list" | "invite";
}

export function UserManagementView({
  initialMode = "list",
}: UserManagementViewProps) {
  const [viewMode, setViewMode] = useState<"list" | "invite">(initialMode);
  const [users, setUsers] =
    useState<UserManagementRecord[]>(INITIAL_USER_RECORDS);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Invite Form State
  const [inviteFullName, setInviteFullName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("OFFICER");
  const [isInviting, setIsInviting] = useState(false);
  const [invitedInfo, setInvitedInfo] = useState<{
    email: string;
    role: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Toggle active/deactive user
  const handleToggleStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === userId) {
          const nextStatus = user.status === "Active" ? "Inactive" : "Active";
          return { ...user, status: nextStatus };
        }
        return user;
      }),
    );
  };

  // Submit invitation
  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteFullName.trim() || !inviteEmail.trim()) return;

    setIsInviting(true);
    setErrorMessage(null);
    setInvitedInfo(null);

    const targetEmail = inviteEmail.trim();
    const targetRole = inviteRole;

    try {
      const result = await createInvitedUser(
        inviteFullName.trim(),
        targetEmail,
        targetRole as ProvisionableRole,
      );

      const newRecord: UserManagementRecord = {
        id: result.user.id || String(Date.now()),
        fullName: result.user.displayName || inviteFullName.trim(),
        username:
          result.user.username ||
          `@${inviteFullName.trim().toLowerCase().replace(/\s+/g, "")}`,
        email: result.user.email || targetEmail,
        role:
          (result.user.role as UserManagementRecord["role"]) ||
          (targetRole as UserManagementRecord["role"]),
        status: "Active",
        lastLogin: "Pending Invitation",
      };

      setUsers((prev) => [
        newRecord,
        ...prev.filter((u) => u.id !== newRecord.id),
      ]);
      setInvitedInfo({ email: targetEmail, role: targetRole });

      // Reset form fields
      setInviteFullName("");
      setInviteEmail("");
      setInviteRole("OFFICER");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to send user invitation.",
      );
    } finally {
      setIsInviting(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole === "ALL" || u.role === selectedRole;

    const matchesStatus =
      selectedStatus === "ALL" || u.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Helper for rendering Role Name (clean text without background box)
  const renderRoleName = (role: UserManagementRecord["role"]) => {
    switch (role) {
      case "OFFICER":
        return "Officer";
      case "DIRECTOR":
        return "Director";
      case "ENDORSEMENT_COMMITTEE":
        return "Endorsement Committee";
      case "ADMIN":
        return "Administrator";
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast / Success Notification matching screenshot */}
      {invitedInfo && (
        <div className="animate-in fade-in slide-in-from-top-2">
          <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-2xl p-5 sm:p-6 text-xs sm:text-sm shadow-xs">
            <h3 className="text-base sm:text-lg font-extrabold text-[#044e3a] mb-1 tracking-tight">
              Invitation Created Successfully
            </h3>
            <p className="text-[#046c50] font-medium leading-relaxed">
              An invitation has been generated for{" "}
              <strong className="font-bold text-[#04382c]">
                {invitedInfo.email}
              </strong>{" "}
              as{" "}
              <strong className="font-bold text-[#04382c]">
                {invitedInfo.role}
              </strong>
              .
            </p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-bold shadow-sm animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={16} className="shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* VIEW MODE 1: INVITE NEW USER FORM */}
      {viewMode === "invite" ? (
        <div className="space-y-6">
          {/* Clean Navigation Line (as seen in screenshot 2) */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 px-0.5">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              User Management
            </button>
            <ChevronRight size={13} className="text-slate-400" />
            <span className="text-[#0f172a] font-bold flex items-center gap-1.5">
              Invite New User
            </span>
          </div>

          {/* Form Card Container */}
          <section className="rounded-2xl border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-xs">
            {/* Form Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-xl font-extrabold text-[#0f172a] tracking-tight flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#04382c] stroke-[2.5]" />
                  Invite New User
                </h1>
                <p className="mt-1 text-xs text-[#64748b] font-medium">
                  Specify user credentials and assigned PTS role to generate an
                  official registration invitation.
                </p>
              </div>
            </div>

            {/* Invite Form */}
            <form
              onSubmit={handleSendInvitation}
              className="space-y-5 max-w-3xl"
            >
              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-[#0f172a] mb-1.5 block">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={inviteFullName}
                  onChange={(e) => setInviteFullName(e.target.value)}
                  placeholder="e.g. Abebe Bikila"
                  className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm text-[#0f172a] w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium transition-all"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="text-xs font-bold text-[#0f172a] mb-1.5 block">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. officer@moa.gov.et"
                  className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm text-[#0f172a] w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium transition-all"
                />
              </div>

              {/* PTS Role Assignment */}
              <div>
                <label className="text-xs font-bold text-[#0f172a] mb-1.5 block">
                  PTS Role Assignment
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm text-[#0f172a] w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium transition-all cursor-pointer"
                >
                  <option value="OFFICER">
                    Officer (Procurement operations / workflow)
                  </option>
                  <option value="DIRECTOR">
                    Director (Directorate Oversight)
                  </option>
                  <option value="ENDORSEMENT_COMMITTEE">
                    Endorsement Committee (Committee Review)
                  </option>
                </select>

                <p className="text-xs text-[#64748b] font-medium mt-2 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[#047857] shrink-0" />
                  Admin roles are excluded from normal invitations. Creation of
                  additional Admins is restricted to specialized Admin actions.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className="px-5 py-2.5 rounded-full border border-[#e2e8f0] bg-white hover:bg-slate-50 text-[#334155] text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="px-6 py-2.5 rounded-full bg-[#04382c] hover:bg-[#032e25] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {isInviting ? "Sending Invitation…" : "Send Invitation"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : (
        /* VIEW MODE 2: USER MANAGEMENT MAIN TABLE */
        <div className="space-y-6">
          {/* Top Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
                  User Management
                </h1>
              </div>
              <p className="mt-1 text-sm text-[#64748b] font-medium">
                Manage system accounts, user permissions, and send user
                invitation links.
              </p>
            </div>
          </div>

          {/* User Management Table Card */}
          <section className="rounded-2xl border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-xs space-y-6">
            {/* Header Row with Single Plus Invite Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#0f172a] tracking-tight">
                  User Management Table
                </h2>
                <p className="mt-0.5 text-xs text-[#64748b] font-medium">
                  Assign PTS roles, issue invitations, toggle suspension, and
                  manage user security
                </p>
              </div>

              <button
                type="button"
                onClick={() => setViewMode("invite")}
                className="shrink-0 bg-[#04382c] hover:bg-[#032e25] text-white text-xs font-bold px-4 py-2.5 rounded-full flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Invite User</span>
              </button>
            </div>

            {/* Controls: Search and Role/Status Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="bg-[#f8fafc] border border-[#e2e8f0] rounded-full pl-9 pr-4 py-2 text-xs text-[#0f172a] placeholder-slate-400 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium transition-all"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3 self-end md:self-auto">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="bg-[#f8fafc] border border-[#e2e8f0] rounded-full px-4 py-2 text-xs font-bold text-[#334155] focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Roles</option>
                  <option value="OFFICER">Officer</option>
                  <option value="DIRECTOR">Director</option>
                  <option value="ENDORSEMENT_COMMITTEE">
                    Endorsement Committee
                  </option>
                  <option value="ADMIN">Administrator</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-[#f8fafc] border border-[#e2e8f0] rounded-full px-4 py-2 text-xs font-bold text-[#334155] focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="bg-[#f8fafc] text-[#334155] text-xs font-bold">
                    <th className="py-3.5 px-4 font-bold">
                      User Name & Details
                    </th>
                    <th className="py-3.5 px-4 font-bold">Email Address</th>
                    <th className="py-3.5 px-4 font-bold">Assigned Role</th>
                    <th className="py-3.5 px-4 font-bold">Account Status</th>
                    <th className="py-3.5 px-4 font-bold">Last Login</th>
                    <th className="py-3.5 px-4 font-bold text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {filteredUsers.map((user, index) => {
                    const isActive = user.status === "Active";
                    const isOddRow = index % 2 === 0;

                    return (
                      <tr
                        key={user.id}
                        className={`transition-colors duration-150 hover:bg-[#f1f5f9] ${
                          isOddRow ? "bg-[#f8fafc]" : "bg-white"
                        }`}
                      >
                        {/* User Name */}
                        <td className="py-4 px-4 align-middle">
                          <div className="font-bold text-[#0f172a] text-xs">
                            {user.fullName}
                          </div>
                        </td>

                        {/* Email Address */}
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

                        {/* Last Login */}
                        <td className="py-4 px-4 text-[#64748b] font-medium align-middle whitespace-nowrap">
                          {user.lastLogin}
                        </td>

                        {/* Actions (Keeps the boxed pill button style as requested) */}
                        <td className="py-4 px-4 text-center align-middle whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(user.id)}
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

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-xs text-slate-500 font-medium"
                      >
                        No user accounts match your search query or filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

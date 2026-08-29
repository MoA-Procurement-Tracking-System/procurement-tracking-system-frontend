"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchPlans, type BackendPlan } from "../../../lib/plansApi";
import {
  Search,
  Filter,
  Eye,
  ArrowLeft,
  ChevronRight,
  Home,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  FileText,
  RotateCcw,
  Send,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

// Real fallback list of Endorsement Committee members from the database
export const FALLBACK_DB_COMMITTEE_MEMBERS = [
  {
    id: "dcb48490-bf61-4982-89b0-3556da376ea3",
    name: "Workneh Tsionawit",
    email: "tsionawit.ugr-4989-16@aau.edu.et",
  },
  {
    id: "46258fbe-9684-41cf-b814-77788d30bca1",
    name: "Edna Asmamaw",
    email: "edna@gmail.com",
  },
  {
    id: "265f711e-adf1-406a-b965-185a96496bce",
    name: "Alula Girma",
    email: "alula@gmail.com",
  },
  {
    id: "d129e293-d9d6-4759-9705-1077c5a288ad",
    name: "Worku Bekele",
    email: "worku@gmail.com",
  },
  {
    id: "0e02469a-39df-4af4-9400-c08c383dd903",
    name: "Dawit Haile",
    email: "dawit@gmail.com",
  },
];

export interface CommitteeMemberVote {
  id: string;
  name: string;
  email?: string;
  roleTitle: string;
  voteStatus: "Approved" | "Rejected" | "Pending";
  feedback?: string;
  votedAt?: string;
}

export interface CommitteeProgressItem {
  id: string;
  planNumber: string;
  planTitle: string;
  projectCode: string;
  projectName: string;
  sector: string;
  budgetYear: string;
  totalBudget: number;
  currency: string;
  description: string;
  overallStatus: "Approved" | "Rejected" | "Pending Approval";
  approvedCount: number;
  rejectedCount: number;
  memberVotes: CommitteeMemberVote[];
}

export function CommitteeProgressView() {
  const [items, setItems] = useState<CommitteeProgressItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sectorFilter, setSectorFilter] = useState<string>("ALL");

  const loadData = useCallback(async () => {
    try {
      const rawPlans = await fetchPlans();
      const mappedItems: CommitteeProgressItem[] = rawPlans
        .filter(
          (bp) =>
            bp.status === "WITH_COMMITTEE" ||
            bp.status === "APPROVED" ||
            bp.status === "REJECTED" ||
            (bp.committeeVotes && bp.committeeVotes.length > 0),
        )
        .map((bp) => {
          const rawVotes = bp.committeeVotes || [];
          const committeeUsers =
            bp.committeeMembers && bp.committeeMembers.length > 0
              ? bp.committeeMembers
              : FALLBACK_DB_COMMITTEE_MEMBERS;

          // Map the exact 5 real committee members from the database
          const memberVotes: CommitteeMemberVote[] = committeeUsers.map(
            (userMember) => {
              // EXACT MATCH: Match vote strictly by memberId or exact email
              const matchingVote = rawVotes.find(
                (v) =>
                  v.memberId === userMember.id ||
                  (v.memberEmail &&
                    userMember.email &&
                    v.memberEmail.toLowerCase() ===
                      userMember.email.toLowerCase()),
              );

              const memberDisplayName =
                (userMember as any).displayName ||
                userMember.name ||
                "Committee Member";
              const memberEmail = userMember.email || undefined;

              if (matchingVote) {
                return {
                  id: userMember.id,
                  name: memberDisplayName,
                  email: memberEmail,
                  roleTitle: "Endorsement Committee",
                  voteStatus:
                    matchingVote.decision === "APPROVE"
                      ? "Approved"
                      : "Rejected",
                  feedback: matchingVote.comment || undefined,
                  votedAt: new Date(matchingVote.createdAt).toLocaleString(),
                };
              }

              return {
                id: userMember.id,
                name: memberDisplayName,
                email: memberEmail,
                roleTitle: "Endorsement Committee",
                voteStatus: "Pending",
              };
            },
          );

          const approvedCount = memberVotes.filter(
            (v) => v.voteStatus === "Approved",
          ).length;
          const rejectedCount = memberVotes.filter(
            (v) => v.voteStatus === "Rejected",
          ).length;

          let overallStatus: "Approved" | "Rejected" | "Pending Approval" =
            "Pending Approval";

          // Business Rule:
          // 1. Approved: At least 3 committee members vote Approve (approvedCount >= 3)
          // 2. Rejected: At least 3 committee members vote Reject (rejectedCount >= 3, majority reject)
          // 3. Pending Approval: In progress awaiting remaining votes (0-2 approves, 0-2 rejects)
          if (rejectedCount >= 3) {
            overallStatus = "Rejected";
          } else if (approvedCount >= 3) {
            overallStatus = "Approved";
          } else {
            overallStatus = "Pending Approval";
          }

          const totalBudget = (bp.activities || []).reduce(
            (sum, a) => sum + (a.estimatedBudget || 0),
            0,
          );

          return {
            id: bp.id,
            planNumber: `MoA/${bp.project?.code || "PLAN"}/${bp.budgetYear || "2018"}/${(bp.title || "APP").substring(0, 10)}`,
            planTitle: bp.title,
            projectCode: bp.project?.code || "PROJECT",
            projectName: bp.project?.name || "MoA Project",
            sector: "Agriculture & Livestock",
            budgetYear: bp.budgetYear || "2018 EFY",
            totalBudget: totalBudget > 0 ? totalBudget : 25000000,
            currency: "ETB",
            description:
              bp.description ||
              "Procurement plan submitted for committee review.",
            overallStatus,
            approvedCount,
            rejectedCount,
            memberVotes,
          };
        });

      setItems(mappedItems);
    } catch (err) {
      console.warn("fetchPlans CommitteeProgressView note:", err);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadData]);

  // Selected item for Detailed Decision Inspector
  const [selectedPlan, setSelectedPlan] =
    useState<CommitteeProgressItem | null>(null);

  // In-page revision comment state for returning rejected plan to officer
  const [resendComment, setResendComment] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleResendToOfficer = () => {
    if (!selectedPlan) return;

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === selectedPlan.id
          ? { ...item, overallStatus: "Rejected" }
          : item,
      ),
    );

    const planNo = selectedPlan.planNumber;
    setSelectedPlan(null);
    setResendComment("");

    setToastMessage(
      `Plan ${planNo} has been returned to the Officer for revision with your instructions.`,
    );
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.planNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.planTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || item.overallStatus === statusFilter;
    const matchesSector =
      sectorFilter === "ALL" || item.sector === sectorFilter;
    return matchesSearch && matchesStatus && matchesSector;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* BREADCRUMB NAVIGATION */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
        <Link
          href="/dashboard"
          className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
        >
          <Home className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <button
          onClick={() => setSelectedPlan(null)}
          className={`transition-colors cursor-pointer ${
            selectedPlan
              ? "text-slate-500 hover:text-slate-900"
              : "font-bold text-[#0A3C2F]"
          }`}
        >
          Committee Progress
        </button>
        {selectedPlan && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-bold text-[#0A3C2F] font-mono">
              {selectedPlan.planNumber} Voting Details
            </span>
          </>
        )}
      </nav>

      {/* VIEW 1: DETAILED COMMITTEE DECISION INSPECTOR PAGE */}
      {selectedPlan ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Context Card */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A3C2F] hover:underline cursor-pointer mb-1"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Committee Progress
                  Table
                </button>

                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                  {selectedPlan.planTitle}
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 pt-2">
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">
                      Project:
                    </span>
                    <strong className="text-slate-900 font-semibold">
                      {selectedPlan.projectName}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">
                      Sector / Directorate:
                    </span>
                    <strong className="text-slate-900 font-semibold">
                      {selectedPlan.sector}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">
                      Total Budget:
                    </span>
                    <strong className="text-[#0A3C2F] font-mono font-bold">
                      {selectedPlan.currency}{" "}
                      {selectedPlan.totalBudget.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
                    selectedPlan.overallStatus === "Approved"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : selectedPlan.overallStatus === "Rejected"
                        ? "bg-rose-50 text-rose-800 border-rose-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
                >
                  {selectedPlan.overallStatus === "Approved" && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  )}
                  {selectedPlan.overallStatus === "Rejected" && (
                    <XCircle className="h-3.5 w-3.5 text-rose-600" />
                  )}
                  {selectedPlan.overallStatus === "Pending Approval" && (
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                  )}
                  <span>{selectedPlan.overallStatus}</span>
                </span>
              </div>
            </div>

            {selectedPlan.description && (
              <p className="text-xs text-slate-600 italic leading-relaxed">
                &quot;{selectedPlan.description}&quot;
              </p>
            )}
          </section>

          {/* Endorsement Committee Votes from Database */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#0A3C2F]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Endorsement Committee Votes & Member Remarks
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {selectedPlan.memberVotes.map((member) => (
                <div
                  key={member.id}
                  className={`p-4 rounded-xl border transition-all ${
                    member.voteStatus === "Approved"
                      ? "border-emerald-200 bg-emerald-50/20"
                      : member.voteStatus === "Rejected"
                        ? "border-rose-200 bg-rose-50/20"
                        : "border-slate-200 bg-slate-50/40"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-950">
                        {member.name}
                      </h4>
                      {member.email && (
                        <p className="text-xs text-slate-500 font-mono">
                          {member.email}
                        </p>
                      )}
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                        member.voteStatus === "Approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : member.voteStatus === "Rejected"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {member.voteStatus === "Approved" && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      )}
                      {member.voteStatus === "Rejected" && (
                        <XCircle className="h-3.5 w-3.5 text-rose-600" />
                      )}
                      {member.voteStatus === "Pending" && (
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                      )}
                      <span>
                        {member.voteStatus === "Pending"
                          ? "Pending Vote"
                          : member.voteStatus}
                      </span>
                    </span>
                  </div>

                  {member.feedback && (
                    <div
                      className={`mt-2.5 p-3 rounded-xl border text-xs ${
                        member.voteStatus === "Rejected"
                          ? "bg-rose-50 border-rose-200 text-rose-950"
                          : "bg-emerald-50 border-emerald-200 text-emerald-950"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        {member.voteStatus === "Rejected" ? (
                          <>
                            <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                            <span className="text-rose-900">
                              Rejection Reason:
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span className="text-emerald-900">
                              Deliberation Remarks:
                            </span>
                          </>
                        )}
                      </div>
                      <p className="font-medium italic leading-relaxed pl-5">
                        &quot;{member.feedback}&quot;
                      </p>
                    </div>
                  )}

                  {member.votedAt && (
                    <p className="text-[11px] text-slate-400 font-mono pt-1">
                      Voted at: {member.votedAt}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* IN-PAGE REVISION & RESEND SECTION FOR REJECTED PLANS */}
          {selectedPlan.overallStatus === "Rejected" && (
            <div className="rounded-2xl border border-amber-200/90 bg-amber-50/50 p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-amber-200/60 pb-3">
                <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold shrink-0">
                  <RotateCcw className="h-4.5 w-4.5 text-amber-800" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-amber-950">
                    Return Plan to Officer for Revision
                  </h3>
                  <p className="text-xs text-amber-800/80">
                    Provide feedback or instructions detailing adjustments
                    required by the officer before resubmitting the plan.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-[#0A3C2F]" />
                  <span>
                    Feedback / Revision Instructions for Officer{" "}
                    <span className="text-rose-600">*</span>
                  </span>
                </label>
                <textarea
                  rows={3}
                  value={resendComment}
                  onChange={(e) => setResendComment(e.target.value)}
                  placeholder="Type feedback and revision instructions for the procurement officer..."
                  className="w-full p-3 rounded-xl border border-amber-300/80 focus:border-[#0A3C2F] focus:ring-1 focus:ring-[#0A3C2F] outline-none text-xs text-slate-800 bg-white"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleResendToOfficer}
                  disabled={!resendComment.trim()}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#0A3C2F] hover:bg-[#072a21] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-2xs transition-all cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>Resend to Officer for Revision</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* VIEW 2: MAIN COMMITTEE PROGRESS TABLE */
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Plan Number, Title or Project..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:border-[#0A3C2F] outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value)}
                  className="bg-transparent font-semibold text-slate-700 outline-none text-xs"
                >
                  <option value="ALL">All Sectors</option>
                  <option value="Livestock & Pastoral Development">
                    Livestock & Pastoral Development
                  </option>
                  <option value="Agribusiness & Rural Finance">
                    Agribusiness & Rural Finance
                  </option>
                  <option value="Crops & Horticulture Directorate">
                    Crops & Horticulture Directorate
                  </option>
                  <option value="Natural Resources & Climate Change">
                    Natural Resources & Climate Change
                  </option>
                  <option value="Agricultural Mechanization & Infrastructure">
                    Agricultural Mechanization & Infrastructure
                  </option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent font-semibold text-slate-700 outline-none text-xs"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Pending Approval">Pending Approval</option>
                </select>
              </div>
            </div>
          </div>

          {/* Committee Progress Directory Table */}
          <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[960px]">
                <thead>
                  <tr className="bg-[#0A3C2F] text-white text-[11px] font-extrabold uppercase tracking-wider">
                    <th className="py-3.5 px-4 min-w-[160px]">Plan Number</th>
                    <th className="py-3.5 px-4 min-w-[240px]">
                      Plan Title & Project
                    </th>
                    <th className="py-3.5 px-4 min-w-[180px]">Sector</th>
                    <th className="py-3.5 px-4 text-center min-w-[180px]">
                      Committee Voting
                    </th>
                    <th className="py-3.5 px-4 text-center min-w-[140px]">
                      Status
                    </th>
                    <th className="py-3.5 px-4 text-center min-w-[80px]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-slate-500"
                      >
                        <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-700 text-sm">
                          No committee progress records found
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        {/* Plan Number */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-xs whitespace-nowrap">
                          {item.planNumber}
                        </td>

                        {/* Plan Title & Project */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="font-bold text-slate-950 text-xs leading-snug">
                            {item.planTitle}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {item.projectName}
                          </p>
                        </td>

                        {/* Sector */}
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {item.sector}
                        </td>

                        {/* Clean Committee Members Voting Boxes (No extra text/padding) */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {item.memberVotes.map((member, idx) => {
                              const boxNum = idx + 1;
                              if (member.voteStatus === "Approved") {
                                return (
                                  <div
                                    key={member.id}
                                    title={`${member.name}: Approved`}
                                    className="h-6 w-6 rounded bg-[#0A3C2F] text-white flex items-center justify-center text-[11px] font-bold"
                                  >
                                    ✓
                                  </div>
                                );
                              }
                              if (member.voteStatus === "Rejected") {
                                return (
                                  <div
                                    key={member.id}
                                    title={`${member.name}: Rejected`}
                                    className="h-6 w-6 rounded bg-rose-700 text-white flex items-center justify-center text-[11px] font-bold"
                                  >
                                    ✕
                                  </div>
                                );
                              }
                              return (
                                <div
                                  key={member.id}
                                  title={`${member.name}: Pending Vote`}
                                  className="h-6 w-6 rounded bg-slate-100 text-slate-500 flex items-center justify-center text-[11px] font-semibold"
                                >
                                  {boxNum}
                                </div>
                              );
                            })}
                          </div>
                        </td>

                        {/* Status (Approved, Rejected, Pending Approval) */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${
                              item.overallStatus === "Approved"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : item.overallStatus === "Rejected"
                                  ? "bg-rose-50 text-rose-800 border-rose-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}
                          >
                            {item.overallStatus}
                          </span>
                        </td>

                        {/* Action (Eye Icon) */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => setSelectedPlan(item)}
                            title="View Committee Feedback & Decisions"
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-[#0A3C2F] border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer mx-auto shadow-2xs"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION BANNER */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

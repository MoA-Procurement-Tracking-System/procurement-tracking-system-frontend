"use client";

import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  Search,
  User,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import type { CommitteePlan } from "./committeeData";

interface CommitteeMyDecisionsTabProps {
  plans: CommitteePlan[];
}

export function CommitteeMyDecisionsTab({
  plans,
}: CommitteeMyDecisionsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");

  // Selected plan for detail inspector modal / view
  const [selectedPlanDetail, setSelectedPlanDetail] =
    useState<CommitteePlan | null>(null);

  // Filter plans
  const filteredPlans = plans.filter((plan) => {
    const myVote = plan.memberVotes.find((v) => v.isCurrentUser);

    const matchesSearch =
      plan.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.officerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.planNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === "ALL"
        ? true
        : filterType === "MY_VOTED"
          ? myVote && myVote.voteStatus !== "Pending"
          : filterType === "APPROVED"
            ? plan.status === "Finally Approved"
            : filterType === "REJECTED"
              ? plan.status === "Rejected"
              : true;

    return matchesSearch && matchesFilter;
  });

  // VIEW 1: DETAILED DECISION INSPECTOR (MY DECISION + OTHER 4 MEMBERS DECISIONS & COMMENTS)
  if (selectedPlanDetail) {
    const myVote = selectedPlanDetail.memberVotes.find((v) => v.isCurrentUser);
    const otherVotes = selectedPlanDetail.memberVotes.filter(
      (v) => !v.isCurrentUser,
    );

    return (
      <div className="space-y-6 animate-in fade-in duration-200 pb-12">
        {/* Navigation Bar */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setSelectedPlanDetail(null)}
            className="text-slate-500 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1 font-bold text-[#0A3C2F]"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Decisions Table
          </button>
        </div>

        {/* Header Summary Card */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-extrabold text-[#0A3C2F] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  {selectedPlanDetail.projectCode}
                </span>
                <span className="font-mono text-xs text-slate-400">
                  {selectedPlanDetail.planNumber}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                {selectedPlanDetail.planName}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                <span className="flex items-center gap-1 font-semibold text-slate-800">
                  <User className="h-3.5 w-3.5 text-emerald-700" /> Prepared by
                  Officer:{" "}
                  <strong className="text-slate-950">
                    {selectedPlanDetail.officerName}
                  </strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-700">
                  <UserCheck className="h-3.5 w-3.5 text-blue-700" /> Forwarded
                  by Director:{" "}
                  <strong className="text-slate-950">
                    {selectedPlanDetail.directorName}
                  </strong>
                </span>
              </div>
            </div>

            <div className="text-right space-y-1">
              <span
                className={`inline-block text-xs font-extrabold px-3 py-1 rounded-full ${
                  selectedPlanDetail.status === "Committee Review"
                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                    : selectedPlanDetail.status === "Finally Approved"
                      ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                      : "bg-rose-100 text-rose-900 border border-rose-300"
                }`}
              >
                Overall: {selectedPlanDetail.status}
              </span>
              <p className="text-xs font-mono font-bold text-[#0A3C2F]">
                Budget: ETB {selectedPlanDetail.totalBudgetETB.toLocaleString()}
              </p>
            </div>
          </div>
        </section>

        {/* 2-Column Inspector: Left My Decision / Right Other 4 Member Decisions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Box: My Decision */}
          <div className="p-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2.5">
              <span className="text-xs font-extrabold text-[#0A3C2F] uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck2 className="h-4 w-4 text-[#0A3C2F]" /> My Decision
              </span>
              <span
                className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md ${
                  myVote?.voteStatus === "Approved"
                    ? "bg-emerald-600 text-white"
                    : myVote?.voteStatus === "Rejected"
                      ? "bg-rose-600 text-white"
                      : "bg-amber-500 text-white"
                }`}
              >
                {myVote?.voteStatus === "Pending"
                  ? "Pending Vote"
                  : myVote?.voteStatus}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-950">{myVote?.name}</p>
              <p className="text-[11px] text-slate-500 font-medium">
                {myVote?.roleTitle}
              </p>
            </div>

            {myVote?.comment ? (
              <div className="space-y-1 bg-white p-3 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                  Comment Sent to Director:
                </span>
                <p className="text-xs text-slate-800 italic leading-relaxed">
                  &quot;{myVote.comment}&quot;
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No comment recorded yet.
              </p>
            )}

            {myVote?.votedAt && (
              <p className="text-[10px] text-slate-500 font-mono pt-1">
                Recorded on: {myVote.votedAt}
              </p>
            )}
          </div>

          {/* Right Box (2 cols): Other 4 Committee Members Decisions & Comments */}
          <div className="md:col-span-2 p-5 rounded-2xl border border-slate-200 bg-slate-50/70 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="h-4 w-4 text-[#0A3C2F]" /> Other 4 Executive
                Committee Members Decisions & Comments
              </span>
              <span className="text-xs font-mono text-slate-500">
                4 Members
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {otherVotes.map((mem) => (
                <div
                  key={mem.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-white space-y-1.5 text-xs shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-950">{mem.name}</span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                        mem.voteStatus === "Approved"
                          ? "text-emerald-700"
                          : mem.voteStatus === "Rejected"
                            ? "text-rose-700"
                            : "text-amber-700"
                      }`}
                    >
                      {mem.voteStatus === "Approved" && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      )}
                      {mem.voteStatus === "Rejected" && (
                        <XCircle className="h-3.5 w-3.5 text-rose-600" />
                      )}
                      {mem.voteStatus === "Pending" && (
                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                      )}
                      <span>{mem.voteStatus}</span>
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 font-medium">
                    {mem.roleTitle}
                  </p>

                  {mem.comment ? (
                    <div className="border-t border-slate-100 pt-1.5 mt-1">
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                        Comment / Feedback:
                      </span>
                      <p className="text-[11px] text-slate-800 italic leading-snug">
                        &quot;{mem.comment}&quot;
                      </p>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic pt-1">
                      No comment recorded.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN VIEW: CLICKABLE DECISIONS TABLE
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search decisions by Project Code, Officer Name or Plan Title..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:border-[#0A3C2F] outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-transparent font-semibold text-slate-700 outline-none text-xs"
          >
            <option value="ALL">All Recorded Plans</option>
            <option value="MY_VOTED">Plans I Have Voted On</option>
            <option value="APPROVED">Finally Approved Plans</option>
            <option value="REJECTED">Rejected Plans</option>
          </select>
        </div>
      </div>

      {/* Clickable Decisions Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[960px]">
            <thead>
              <tr className="bg-[#0A3C2F] text-white text-[11px] font-extrabold uppercase tracking-wider">
                <th className="py-3 px-3 text-center w-10">#</th>
                <th className="py-3 px-3 min-w-[120px]">Project</th>
                <th className="py-3 px-3 min-w-[200px]">Plan Name & Number</th>
                <th className="py-3 px-3 min-w-[160px]">Prepared by Officer</th>
                <th className="py-3 px-3 min-w-[110px]">Category</th>
                <th className="py-3 px-3 text-right min-w-[130px]">
                  Total Budget (ETB)
                </th>
                <th className="py-3 px-3 text-center min-w-[120px]">
                  My Decision
                </th>
                <th className="py-3 px-3 text-center min-w-[120px]">
                  Overall Status
                </th>
                <th className="py-3 px-3 text-center min-w-[120px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700 text-sm">
                      No decision records found matching criteria
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPlans.map((plan, index) => {
                  const myVote = plan.memberVotes.find((v) => v.isCurrentUser);

                  return (
                    <tr
                      key={plan.id}
                      onClick={() => setSelectedPlanDetail(plan)}
                      className="hover:bg-emerald-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-3 font-mono text-slate-400 font-semibold text-center">
                        {index + 1}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-mono font-extrabold text-[#0A3C2F] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs">
                          {plan.projectCode}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <p className="font-bold text-slate-950 text-xs leading-snug group-hover:text-[#0A3C2F] transition-colors">
                          {plan.planName}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {plan.planNumber}
                        </p>
                      </td>

                      <td className="py-3.5 px-3 font-semibold text-slate-900">
                        {plan.officerName}
                      </td>

                      <td className="py-3.5 px-3 font-medium text-slate-700">
                        {plan.category}
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold text-right text-slate-950">
                        {plan.totalBudgetETB.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                            myVote?.voteStatus === "Approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : myVote?.voteStatus === "Rejected"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {myVote?.voteStatus === "Pending"
                            ? "Pending"
                            : myVote?.voteStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`text-xs font-extrabold ${
                            plan.status === "Committee Review"
                              ? "text-amber-800"
                              : plan.status === "Finally Approved"
                                ? "text-emerald-800"
                                : "text-rose-800"
                          }`}
                        >
                          {plan.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlanDetail(plan);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0A3C2F] text-white hover:bg-[#072b22] text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Decisions</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

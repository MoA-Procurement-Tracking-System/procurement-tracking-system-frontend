"use client";

import { useState } from "react";
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
  X,
} from "lucide-react";
import Link from "next/link";

export interface CommitteeMemberVote {
  id: string;
  name: string;
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
  overallStatus: "Approved" | "Pending_Management_Approval" | "Rejected";
  memberVotes: CommitteeMemberVote[];
}

export const INITIAL_COMMITTEE_PROGRESS_DATA: CommitteeProgressItem[] = [
  {
    id: "cp-01",
    planNumber: "MoA/BREFONS/2018/APP-01",
    planTitle: "2018 EFY BREFONS Annual Procurement Plan",
    projectCode: "BREFONS",
    projectName:
      "BREFONS (Program to Build Resilience for Food and Nutrition Security)",
    sector: "Livestock & Pastoral Development",
    budgetYear: "2018 EFY",
    totalBudget: 48000000,
    currency: "ETB",
    description:
      "Procurement plan for agro-meteorological stations, solar water supply systems, irrigation infrastructure, and milking machinery.",
    overallStatus: "Approved",
    memberVotes: [
      {
        id: "m-1",
        name: "Ato Solomon Tadesse",
        roleTitle: "Management Committee Chair",
        voteStatus: "Approved",
        feedback: "Drought resilience priority.",
        votedAt: "1/28/2026, 2:00:00 PM",
      },
      {
        id: "m-2",
        name: "Dr. Berhanu Hailu",
        roleTitle: "Director General (Technical)",
        voteStatus: "Approved",
        feedback: "Technical scope verified.",
        votedAt: "1/28/2026, 2:15:00 PM",
      },
      {
        id: "m-3",
        name: "W/ro Gennet Zewde",
        roleTitle: "Finance & Procurement Lead",
        voteStatus: "Approved",
        feedback: "Budget verified against AfDB grant.",
        votedAt: "1/28/2026, 2:30:00 PM",
      },
      {
        id: "m-4",
        name: "Ato Yared Worku",
        roleTitle: "Legal & Compliance Officer",
        voteStatus: "Pending",
      },
      {
        id: "m-5",
        name: "Ato Dawit Alemu",
        roleTitle: "Monitoring & Evaluation Specialist",
        voteStatus: "Pending",
      },
    ],
  },
  {
    id: "cp-02",
    planNumber: "MoA/DRIVE/2018/APP-02",
    planTitle: "2018 EFY DRIVE Pastoral Economies Procurement Plan",
    projectCode: "DRIVE",
    projectName:
      "DRIVE (De-Risking, Inclusion and Value Enhancement of Pastoral Economies)",
    sector: "Livestock & Pastoral Development",
    budgetYear: "2018 EFY",
    totalBudget: 35000000,
    currency: "ETB",
    description:
      "Supply of livestock insurance technology, veterinary cold chain equipment, and market access infrastructure.",
    overallStatus: "Approved",
    memberVotes: [
      {
        id: "m-1",
        name: "Ato Solomon Tadesse",
        roleTitle: "Management Committee Chair",
        voteStatus: "Approved",
        feedback: "Pastoral inclusion guidelines met.",
        votedAt: "1/27/2026, 11:30:00 AM",
      },
      {
        id: "m-2",
        name: "Dr. Berhanu Hailu",
        roleTitle: "Director General (Technical)",
        voteStatus: "Approved",
        feedback: "Cold chain specifications cleared.",
        votedAt: "1/27/2026, 1:00:00 PM",
      },
      {
        id: "m-3",
        name: "W/ro Gennet Zewde",
        roleTitle: "Finance & Procurement Lead",
        voteStatus: "Pending",
      },
      {
        id: "m-4",
        name: "Ato Yared Worku",
        roleTitle: "Legal & Compliance Officer",
        voteStatus: "Approved",
        feedback: "World Bank legal clearance complete.",
        votedAt: "1/27/2026, 3:20:00 PM",
      },
      {
        id: "m-5",
        name: "Ato Dawit Alemu",
        roleTitle: "Monitoring & Evaluation Specialist",
        voteStatus: "Pending",
      },
    ],
  },
  {
    id: "cp-03",
    planNumber: "MoA/FSRP/2018/APP-03",
    planTitle: "2018 EFY Food Systems Resilience Program Procurement Plan",
    projectCode: "FSRP",
    projectName: "FSRP (Food Systems Resilience Program)",
    sector: "Agribusiness & Rural Finance",
    budgetYear: "2018 EFY",
    totalBudget: 62000000,
    currency: "ETB",
    description:
      "Procurement of climate-smart seed production equipment, grain storage silos, and rural digital advisory platforms.",
    overallStatus: "Pending_Management_Approval",
    memberVotes: [
      {
        id: "m-1",
        name: "Ato Solomon Tadesse",
        roleTitle: "Management Committee Chair",
        voteStatus: "Approved",
        feedback: "Resilience criteria verified.",
        votedAt: "1/29/2026, 9:15:00 AM",
      },
      {
        id: "m-2",
        name: "Dr. Berhanu Hailu",
        roleTitle: "Director General (Technical)",
        voteStatus: "Approved",
        feedback: "Silo capacity models endorsed.",
        votedAt: "1/29/2026, 10:45:00 AM",
      },
      {
        id: "m-3",
        name: "W/ro Gennet Zewde",
        roleTitle: "Finance & Procurement Lead",
        voteStatus: "Pending",
      },
      {
        id: "m-4",
        name: "Ato Yared Worku",
        roleTitle: "Legal & Compliance Officer",
        voteStatus: "Pending",
      },
      {
        id: "m-5",
        name: "Ato Dawit Alemu",
        roleTitle: "Monitoring & Evaluation Specialist",
        voteStatus: "Pending",
      },
    ],
  },
  {
    id: "cp-04",
    planNumber: "MoA/REG/2018/APP-04",
    planTitle: "2018 EFY Ministry Government Treasury Regular Plan",
    projectCode: "REGULAR",
    projectName: "MoA Regular Program (Government Treasury)",
    sector: "Crops & Horticulture Directorate",
    budgetYear: "2018 EFY",
    totalBudget: 28000000,
    currency: "ETB",
    description:
      "Annual treasury allocation for crop protection, pest control chemicals, and regional field extension vehicles.",
    overallStatus: "Approved",
    memberVotes: [
      {
        id: "m-1",
        name: "Ato Solomon Tadesse",
        roleTitle: "Management Committee Chair",
        voteStatus: "Approved",
        feedback: "Treasury ceiling compliance verified.",
        votedAt: "1/25/2026, 4:00:00 PM",
      },
      {
        id: "m-2",
        name: "Dr. Berhanu Hailu",
        roleTitle: "Director General (Technical)",
        voteStatus: "Pending",
      },
      {
        id: "m-3",
        name: "W/ro Gennet Zewde",
        roleTitle: "Finance & Procurement Lead",
        voteStatus: "Approved",
        feedback: "Ministry budget allocation approved.",
        votedAt: "1/25/2026, 4:30:00 PM",
      },
      {
        id: "m-4",
        name: "Ato Yared Worku",
        roleTitle: "Legal & Compliance Officer",
        voteStatus: "Pending",
      },
      {
        id: "m-5",
        name: "Ato Dawit Alemu",
        roleTitle: "Monitoring & Evaluation Specialist",
        voteStatus: "Approved",
        feedback: "Extension target KPIs cleared.",
        votedAt: "1/25/2026, 5:00:00 PM",
      },
    ],
  },
  {
    id: "cp-07",
    planNumber: "MoA/ELRP/2018/APP-07",
    planTitle: "2018 EFY Emergency Desert Locust Surveillance Plan",
    projectCode: "ELRP",
    projectName: "MoA Regular Program (Government Treasury)",
    sector: "Crops & Horticulture Directorate",
    budgetYear: "2018 EFY",
    totalBudget: 15000000,
    currency: "ETB",
    description:
      "Locust control sprayers, protective gear, and airborne survey surveillance equipment.",
    overallStatus: "Pending_Management_Approval",
    memberVotes: [
      {
        id: "m-1",
        name: "Ato Solomon Tadesse",
        roleTitle: "Management Committee Chair",
        voteStatus: "Pending",
      },
      {
        id: "m-2",
        name: "Dr. Berhanu Hailu",
        roleTitle: "Director General (Technical)",
        voteStatus: "Pending",
      },
      {
        id: "m-3",
        name: "W/ro Gennet Zewde",
        roleTitle: "Finance & Procurement Lead",
        voteStatus: "Pending",
      },
      {
        id: "m-4",
        name: "Ato Yared Worku",
        roleTitle: "Legal & Compliance Officer",
        voteStatus: "Pending",
      },
      {
        id: "m-5",
        name: "Ato Dawit Alemu",
        roleTitle: "Monitoring & Evaluation Specialist",
        voteStatus: "Pending",
      },
    ],
  },
  {
    id: "cp-08",
    planNumber: "MoA/MECH/2018/APP-08",
    planTitle: "2018 EFY Agricultural Mechanization Service Center Plan",
    projectCode: "FSRP",
    projectName: "FSRP (Food Systems Resilience Program)",
    sector: "Agricultural Mechanization & Infrastructure",
    budgetYear: "2018 EFY",
    totalBudget: 55000000,
    currency: "ETB",
    description:
      "Tractors, combine harvesters, and maintenance equipment for regional mechanization hubs.",
    overallStatus: "Rejected",
    memberVotes: [
      {
        id: "m-1",
        name: "Ato Solomon Tadesse",
        roleTitle: "Management Committee Chair",
        voteStatus: "Rejected",
        feedback:
          "Unit price estimates exceed World Bank approved ceiling threshold by 35%.",
        votedAt: "7/18/2026, 5:00:00 PM",
      },
      {
        id: "m-2",
        name: "Dr. Berhanu Hailu",
        roleTitle: "Director General (Technical)",
        voteStatus: "Rejected",
        feedback: "Inadequate maintenance training plan provided by vendor.",
        votedAt: "7/18/2026, 5:30:00 PM",
      },
      {
        id: "m-3",
        name: "W/ro Gennet Zewde",
        roleTitle: "Finance & Procurement Lead",
        voteStatus: "Rejected",
        feedback: "Environmental impact clearance certificate missing.",
        votedAt: "7/18/2026, 6:00:00 PM",
      },
      {
        id: "m-4",
        name: "Ato Yared Worku",
        roleTitle: "Legal & Compliance Officer",
        voteStatus: "Pending",
      },
      {
        id: "m-5",
        name: "Ato Dawit Alemu",
        roleTitle: "Monitoring & Evaluation Specialist",
        voteStatus: "Pending",
      },
    ],
  },
];

export function CommitteeProgressView() {
  const [items, setItems] = useState<CommitteeProgressItem[]>(
    INITIAL_COMMITTEE_PROGRESS_DATA,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sectorFilter, setSectorFilter] = useState<string>("ALL");

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
          ? { ...item, overallStatus: "Rejected" as any }
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

  // Filter items (excluding Submitted_To_Director plans from Committee Progress)
  const filteredItems = items.filter((item) => {
    if ((item.overallStatus as string) === "Submitted_To_Director")
      return false;
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

              <span
                className={`text-xs font-extrabold ${
                  selectedPlan.overallStatus === "Approved"
                    ? "text-emerald-700"
                    : selectedPlan.overallStatus ===
                        "Pending_Management_Approval"
                      ? "text-blue-700"
                      : "text-rose-700"
                }`}
              >
                {selectedPlan.overallStatus}
              </span>
            </div>

            {selectedPlan.description && (
              <p className="text-xs text-slate-600 italic leading-relaxed">
                &quot;{selectedPlan.description}&quot;
              </p>
            )}
          </section>

          {/* Feedback & Decisions from 5 Executive Committee Members Container */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Users className="h-5 w-5 text-[#0A3C2F]" />
              <h3 className="text-sm font-bold text-slate-900">
                Feedback & Decisions from 5 Executive Committee Members
              </h3>
            </div>

            <div className="space-y-4">
              {selectedPlan.memberVotes.map((member) => (
                <div
                  key={member.id}
                  className={`border-l-4 pl-4 py-3 space-y-1.5 border-t-0 border-r-0 border-b-0 border-slate-100 transition-all ${
                    member.voteStatus === "Approved"
                      ? "border-l-emerald-600"
                      : member.voteStatus === "Rejected"
                        ? "border-l-rose-600"
                        : "border-l-amber-400"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-950">
                        {member.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {member.roleTitle}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                        member.voteStatus === "Approved"
                          ? "text-emerald-700"
                          : member.voteStatus === "Rejected"
                            ? "text-rose-700"
                            : "text-amber-700"
                      }`}
                    >
                      {member.voteStatus === "Approved" && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      )}
                      {member.voteStatus === "Rejected" && (
                        <XCircle className="h-3.5 w-3.5 text-rose-600" />
                      )}
                      {member.voteStatus === "Pending" && (
                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                      )}
                      <span>
                        {member.voteStatus === "Pending"
                          ? "Pending Vote"
                          : member.voteStatus}
                      </span>
                    </span>
                  </div>

                  {member.feedback && (
                    <div className="pt-2 border-t border-slate-200/60 text-xs">
                      <span className="text-slate-500 font-bold block mb-0.5">
                        Comments / Feedback:
                      </span>
                      <p className="text-slate-800 font-semibold italic">
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
                  <option value="Pending_Management_Approval">
                    Pending_Management_Approval
                  </option>
                  <option value="Rejected">Rejected</option>
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
                    <th className="py-3.5 px-4 text-center min-w-[220px]">
                      Committee Members Voting (5 Boxes)
                    </th>
                    <th className="py-3.5 px-4 text-center min-w-[150px]">
                      Overall Status
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
                    filteredItems.map((item) => {
                      const approvedVotes = item.memberVotes.filter(
                        (v) => v.voteStatus === "Approved",
                      ).length;
                      const rejectedVotes = item.memberVotes.filter(
                        (v) => v.voteStatus === "Rejected",
                      ).length;

                      return (
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

                          {/* Committee Members Voting (5 Boxes) */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center justify-center gap-1.5">
                                {item.memberVotes.map((member, idx) => {
                                  const boxNum = idx + 1;
                                  if (member.voteStatus === "Approved") {
                                    return (
                                      <div
                                        key={member.id}
                                        title={`${member.name}: Approved`}
                                        className="h-7 w-7 rounded-lg bg-[#0A3C2F] text-white flex items-center justify-center text-xs font-bold shadow-2xs"
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
                                        className="h-7 w-7 rounded-lg bg-rose-700 text-white flex items-center justify-center text-xs font-bold shadow-2xs"
                                      >
                                        ✕
                                      </div>
                                    );
                                  }
                                  return (
                                    <div
                                      key={member.id}
                                      title={`${member.name}: Pending Vote`}
                                      className="h-7 w-7 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center text-xs font-bold"
                                    >
                                      {boxNum}
                                    </div>
                                  );
                                })}
                              </div>

                              <span className="text-[11px] font-medium text-slate-500">
                                {approvedVotes} Approved / {rejectedVotes}{" "}
                                Rejected
                              </span>
                            </div>
                          </td>

                          {/* Overall Status */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <span
                              className={`text-xs font-extrabold ${
                                item.overallStatus === "Approved"
                                  ? "text-emerald-700"
                                  : item.overallStatus ===
                                      "Pending_Management_Approval"
                                    ? "text-blue-700"
                                    : "text-rose-700"
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
                      );
                    })
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

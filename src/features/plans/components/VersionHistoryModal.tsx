"use client";

import { useState } from "react";
import {
  History,
  X,
  ArrowRight,
  User,
  Calendar,
  MessageSquare,
  AlertCircle,
  FileCheck2,
  Send,
  RotateCcw,
  PlusCircle,
  Edit3,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  getPlanVersionHistory,
  type PlanVersionRecord,
  type FieldChange,
} from "../data/planRevisions";

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planName?: string;
  projectCode?: string;
  currentStatus?: string;
}

export function VersionHistoryModal({
  isOpen,
  onClose,
  planId,
  planName,
  projectCode,
  currentStatus,
}: VersionHistoryModalProps) {
  const [filterVersion, setFilterVersion] = useState<number | "ALL">("ALL");
  const [expandedRecordIds, setExpandedRecordIds] = useState<Set<string>>(
    new Set(),
  );

  if (!isOpen) return null;

  const history = getPlanVersionHistory(planId);

  // Group by version
  const versionNumbers = Array.from(
    new Set(history.map((h) => h.versionNumber || 1)),
  ).sort((a, b) => b - a);

  const filteredHistory =
    filterVersion === "ALL"
      ? history
      : history.filter((h) => (h.versionNumber || 1) === filterVersion);

  const toggleExpand = (id: string) => {
    setExpandedRecordIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getActionBadge = (action: PlanVersionRecord["action"]) => {
    switch (action) {
      case "INITIAL_DRAFT":
        return {
          icon: <PlusCircle className="h-3.5 w-3.5 text-slate-600" />,
          bg: "bg-slate-100 text-slate-700 border-slate-300",
          label: "Initial Draft Created",
        };
      case "SUBMITTED":
      case "RESUBMITTED":
        return {
          icon: <Send className="h-3.5 w-3.5 text-blue-600" />,
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          label: action === "RESUBMITTED" ? "Plan Resubmitted" : "Plan Submitted",
        };
      case "RETURNED":
        return {
          icon: <RotateCcw className="h-3.5 w-3.5 text-amber-600" />,
          bg: "bg-amber-50 text-amber-800 border-amber-300",
          label: "Returned for Revision",
        };
      case "PLAN_REVISED":
      case "ACTIVITY_REVISED":
        return {
          icon: <Edit3 className="h-3.5 w-3.5 text-emerald-600" />,
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
          label: action === "PLAN_REVISED" ? "Plan Details Revised" : "Activity Revised",
        };
      case "ACTIVITY_ADDED":
        return {
          icon: <PlusCircle className="h-3.5 w-3.5 text-teal-600" />,
          bg: "bg-teal-50 text-teal-800 border-teal-200",
          label: "Activity Added",
        };
      case "APPROVED_DIRECTOR":
      case "SENT_TO_COMMITTEE":
        return {
          icon: <FileCheck2 className="h-3.5 w-3.5 text-indigo-600" />,
          bg: "bg-indigo-50 text-indigo-800 border-indigo-200",
          label: "Director Endorsed",
        };
      case "FINALLY_APPROVED":
        return {
          icon: <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />,
          bg: "bg-emerald-100 text-emerald-900 border-emerald-300",
          label: "Finally Approved",
        };
      default:
        return {
          icon: <History className="h-3.5 w-3.5 text-slate-600" />,
          bg: "bg-slate-100 text-slate-700 border-slate-200",
          label: "Audit Event",
        };
    }
  };

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in"
      role="dialog"
    >
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-[#176c55]/10 via-[#176c55]/5 to-transparent px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#176c55] text-white shadow-sm">
              <History className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Version History &amp; Audit Trail
                </h2>
                <span className="rounded-full bg-[#176c55]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#176c55]">
                  {versionNumbers.length > 0
                    ? `v${Math.max(...versionNumbers)}`
                    : "v1"}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">
                {planName || planId} {projectCode ? `• ${projectCode}` : ""}
              </p>
            </div>
          </div>

          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-6 py-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Filter Version:</span>
            <div className="flex items-center gap-1">
              <button
                className={`rounded-md px-2.5 py-1 font-semibold transition ${
                  filterVersion === "ALL"
                    ? "bg-[#176c55] text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
                onClick={() => setFilterVersion("ALL")}
                type="button"
              >
                All Versions ({history.length})
              </button>
              {versionNumbers.map((vNum) => (
                <button
                  key={vNum}
                  className={`rounded-md px-2.5 py-1 font-semibold transition ${
                    filterVersion === vNum
                      ? "bg-[#176c55] text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                  onClick={() => setFilterVersion(vNum)}
                  type="button"
                >
                  Version {vNum}
                </button>
              ))}
            </div>
          </div>

          {currentStatus && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <span>Current Status:</span>
              <span className="font-bold text-slate-800">{currentStatus}</span>
            </div>
          )}
        </div>

        {/* Body Content / Timeline */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <History className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-800">
                No Revisions Recorded Yet
              </h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500">
                This plan is currently at its baseline version (Version 1). When
                the Director returns the plan or edits are made, revision logs and
                field changes will be displayed here.
              </p>
            </div>
          ) : (
            <div className="relative space-y-6 before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {filteredHistory.map((rec) => {
                const badge = getActionBadge(rec.action);
                const isExpanded =
                  expandedRecordIds.has(rec.id) ||
                  (rec.changes && rec.changes.length > 0);

                return (
                  <div key={rec.id} className="relative pl-10">
                    {/* Timeline Node */}
                    <div className="absolute left-1.5 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white ring-4 ring-slate-100 border border-slate-300">
                      <div className="h-2 w-2 rounded-full bg-[#176c55]" />
                    </div>

                    {/* Card */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4.5 shadow-xs transition hover:border-slate-300">
                      {/* Card Header */}
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-bold ${badge.bg}`}
                          >
                            {badge.icon}
                            {badge.label}
                          </span>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                            Version {rec.versionNumber || 1}
                          </span>
                          {rec.activityReference && (
                            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                              Activity: {rec.activityReference}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            <span className="font-semibold text-slate-700">
                              {rec.changedBy}
                            </span>
                            <span className="text-slate-400">
                              ({rec.changedByRole})
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>
                              {new Date(rec.changedAt).toLocaleString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Reason / Remarks Box */}
                      {rec.reason && (
                        <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-amber-200/80 bg-amber-50/70 p-3 text-xs text-amber-900">
                          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                          <div>
                            <span className="font-bold text-amber-950">
                              {rec.action === "RETURNED"
                                ? "Director Return Feedback:"
                                : "Revision Reason / Comment:"}
                            </span>{" "}
                            <span className="italic font-medium">
                              &ldquo;{rec.reason}&rdquo;
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Field-by-Field Diff Changes */}
                      {rec.changes && rec.changes.length > 0 && (
                        <div className="mt-3.5">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                            <span className="text-xs font-bold text-slate-700">
                              Modified Fields ({rec.changes.length})
                            </span>
                            <button
                              className="text-[11px] font-semibold text-[#176c55] hover:underline"
                              onClick={() => toggleExpand(rec.id)}
                              type="button"
                            >
                              {isExpanded ? "Collapse" : "Expand Changes"}
                            </button>
                          </div>

                          {isExpanded && (
                            <div className="mt-2 space-y-2">
                              {rec.changes.map((ch, idx) => (
                                <div
                                  key={idx}
                                  className="grid grid-cols-1 gap-2 rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 sm:grid-cols-3 sm:items-center text-xs"
                                >
                                  <div className="font-bold text-slate-700">
                                    {ch.fieldName || ch.field}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-slate-600">
                                    <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[11px] font-medium text-rose-700 line-through">
                                      {String(ch.previousValue)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                                    <ArrowRight className="h-3 w-3 text-slate-400" />
                                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700">
                                      {String(ch.newValue)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 text-xs">
          <span className="text-slate-500">
            Audit logs are permanently recorded on status transitions &amp;
            revisions.
          </span>
          <button
            className="rounded-md border border-slate-300 bg-white px-4 py-1.5 font-bold text-slate-700 shadow-2xs hover:bg-slate-100 transition"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

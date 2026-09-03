"use client";

import { type ReportType, REPORT_LIST } from "../types";
import {
  type AnnualPlanReportRow,
  type PlanVsActualReportRow,
  type DelayedProcurementRow,
  type ContractPaymentReportRow,
} from "../reportsData";

export interface ReportTablesProps {
  activeReport: ReportType;
  annualPlanRows: AnnualPlanReportRow[];
  planVsActualRows: PlanVsActualReportRow[];
  delayedProcurementRows: DelayedProcurementRow[];
  contractPaymentRows?: ContractPaymentReportRow[];
}

export function ReportTables({
  activeReport,
  annualPlanRows,
  planVsActualRows,
  delayedProcurementRows,
  contractPaymentRows = [],
}: ReportTablesProps) {
  const currentReportTitle = REPORT_LIST.find(
    (r) => r.id === activeReport,
  )?.label;

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden max-w-full">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-900">
          {currentReportTitle} Output
        </h4>
        <span className="text-xs font-semibold text-slate-500">
          Displaying filtered results
        </span>
      </div>

      <div className="overflow-x-auto w-full max-w-full">
        {/* 1. Annual Procurement Plan Table */}
        {activeReport === "annual-plan" && (
          <table className="w-full text-left border-collapse text-xs min-w-[700px]">
            <thead>
              <tr className="bg-[#0A3C2F] text-white text-[11px] font-extrabold uppercase">
                <th className="py-3 px-3">Project</th>
                <th className="py-3 px-3">Plan Name</th>
                <th className="py-3 px-3">Activity Ref</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Method</th>
                <th className="py-3 px-3 font-mono">Est Amount</th>
                <th className="py-3 px-3">Funding Source</th>
                <th className="py-3 px-3">Officer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {annualPlanRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#0A3C2F]">
                    {row.projectCode}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 max-w-xs wrap-break-word">
                    <p className="wrap-break-word line-clamp-2">
                      {row.planName}
                    </p>
                  </td>
                  <td className="py-2.5 px-3 font-mono">{row.refNo}</td>
                  <td className="py-2.5 px-3 max-w-xs wrap-break-word">
                    <p className="wrap-break-word line-clamp-2">
                      {row.description}
                    </p>
                  </td>
                  <td className="py-2.5 px-3 font-semibold">{row.category}</td>
                  <td className="py-2.5 px-3 font-bold text-[#0A3C2F]">
                    {row.method}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {row.currency} {row.estimatedAmount.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3">{row.fundingSource}</td>
                  <td className="py-2.5 px-3 font-medium">{row.officer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 2. Plan vs Actual Table */}
        {activeReport === "plan-vs-actual" && (
          <table className="w-full text-left border-collapse text-xs min-w-[700px]">
            <thead>
              <tr className="bg-[#0A3C2F] text-white text-[11px] font-extrabold uppercase">
                <th className="py-3 px-3">Activity Ref</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Method</th>
                <th className="py-3 px-3 font-mono">Plan Advert</th>
                <th className="py-3 px-3 font-mono">Actual Advert</th>
                <th className="py-3 px-3 font-mono">Plan Award</th>
                <th className="py-3 px-3 font-mono">Actual Award</th>
                <th className="py-3 px-3 font-mono">Plan Signed</th>
                <th className="py-3 px-3 font-mono">Actual Signed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {planVsActualRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#0A3C2F]">
                    {row.refNo}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 max-w-xs wrap-break-word">
                    <p className="wrap-break-word line-clamp-2">
                      {row.description}
                    </p>
                  </td>
                  <td className="py-2.5 px-3 font-semibold">{row.method}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">
                    {row.plannedAdvertisingDate}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                    {row.actualAdvertisingDate}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">
                    {row.plannedAwardDate}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                    {row.actualAwardDate}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">
                    {row.plannedSignatureDate}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                    {row.actualSignatureDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 3. Delayed Procurement Table */}
        {activeReport === "delayed-procurement" && (
          <table className="w-full text-left border-collapse text-xs min-w-[700px]">
            <thead>
              <tr className="bg-[#0A3C2F] text-white text-[11px] font-extrabold uppercase">
                <th className="py-3 px-3">Activity Ref</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Method</th>
                <th className="py-3 px-3">Current Overdue Stage</th>
                <th className="py-3 px-3 font-mono">Target Date</th>
                <th className="py-3 px-3 font-mono">Delay Days</th>
                <th className="py-3 px-3">Replanning Reason</th>
                <th className="py-3 px-3">Officer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {delayedProcurementRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#0A3C2F]">
                    {row.refNo}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 max-w-xs wrap-break-word">
                    <p className="wrap-break-word line-clamp-2">
                      {row.description}
                    </p>
                  </td>
                  <td className="py-2.5 px-3 font-semibold">{row.method}</td>
                  <td className="py-2.5 px-3 font-semibold text-rose-800">
                    {row.currentOverdueStage}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">
                    {row.effectiveTargetDate}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-extrabold text-rose-700">
                    {row.delayDays} Days
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 italic max-w-xs wrap-break-word">
                    <p className="wrap-break-word line-clamp-2">
                      &quot;{row.replanningReason}&quot;
                    </p>
                  </td>
                  <td className="py-2.5 px-3 font-medium">{row.officer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 4. Contract & Payment Table */}
        {activeReport === "contract-payment" && (
          <table className="w-full text-left border-collapse text-xs min-w-[700px]">
            <thead>
              <tr className="bg-[#0A3C2F] text-white text-[11px] font-extrabold uppercase">
                <th className="py-3 px-3">Contract No</th>
                <th className="py-3 px-3">Activity Ref</th>
                <th className="py-3 px-3">Supplier / Contractor</th>
                <th className="py-3 px-3 font-mono">Original Amount</th>
                <th className="py-3 px-3 font-mono">VAT (15%)</th>
                <th className="py-3 px-3 font-mono">Final Amount</th>
                <th className="py-3 px-3 font-mono">Total Paid</th>
                <th className="py-3 px-3 font-mono">Remaining Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {contractPaymentRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {row.contractNo}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[#0A3C2F]">
                    {row.refNo}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 max-w-xs wrap-break-word">
                    <p className="wrap-break-word line-clamp-2">
                      {row.supplierName}
                    </p>
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    {row.originalContractAmount.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">
                    {row.vatAmount.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {row.finalContractAmount.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-extrabold text-emerald-700">
                    {row.totalPaidAmount.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-extrabold text-slate-950">
                    {row.remainingBalance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 5. General Table Output for other reports */}
        {(activeReport === "procurement-step" ||
          activeReport === "monthly-summary" ||
          activeReport === "detailed-procurement" ||
          activeReport === "project-officer") && (
          <table className="w-full text-left border-collapse text-xs min-w-[700px]">
            <thead>
              <tr className="bg-[#0A3C2F] text-white text-[11px] font-extrabold uppercase">
                <th className="py-3 px-3">Item Ref / Code</th>
                <th className="py-3 px-3">Description / Scope</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Method</th>
                <th className="py-3 px-3 font-mono">Amount (ETB)</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {annualPlanRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#0A3C2F]">
                    {row.refNo}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 max-w-xs wrap-break-word">
                    <p className="wrap-break-word line-clamp-2">
                      {row.description}
                    </p>
                  </td>
                  <td className="py-2.5 px-3 font-semibold">{row.category}</td>
                  <td className="py-2.5 px-3 font-bold text-[#0A3C2F]">
                    {row.method}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {row.currency} {row.estimatedAmount.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-extrabold text-emerald-700">
                    {row.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

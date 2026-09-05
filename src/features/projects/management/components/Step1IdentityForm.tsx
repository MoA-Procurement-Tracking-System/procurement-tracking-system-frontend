"use client";

import { Building2 } from "lucide-react";
import {
  SECTOR_OPTIONS,
  COUNTRY_ORG_OPTIONS,
  EXECUTING_AGENCY_OPTIONS,
  REGION_OPTIONS,
} from "../projectsData";

export interface Step1IdentityFormData {
  code: string;
  name: string;
  sapNumber: string;
  sector: string;
  countryOrg: string;
  customCountryOrg: string;
  executingAgency: string;
  customExecutingAgency: string;
  region: string;
}

interface Step1IdentityFormProps {
  data: Step1IdentityFormData;
  onChange: (fields: Partial<Step1IdentityFormData>) => void;
}

export function Step1IdentityForm({ data, onChange }: Step1IdentityFormProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-[#0A3C2F]" />
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Step 1: Project Identity & Regional Scope
          </h2>
        </div>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          Core Metadata
        </span>
      </div>

      {/* Subsection A: Project Identity */}
      <div className="space-y-4">
        <h3 className="text-xs font-extrabold text-[#0A3C2F] uppercase tracking-wider">
          A. Project Classification
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Project Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">
              Project Code / Acronym *
            </label>
            <input
              type="text"
              value={data.code}
              onChange={(e) => onChange({ code: e.target.value })}
              placeholder="e.g. DRIVE, BREFONS, CALM..."
              className="w-full rounded-xl bg-slate-50/80 border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            />
          </div>

          {/* Project Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">
              Full Official Project Name *
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="e.g. De-risking, Inclusion and Value Enhancement Project..."
              className="w-full rounded-xl bg-slate-50/80 border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* SAP Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">
              Project SAP Identification No. (Optional)
            </label>
            <input
              type="text"
              value={data.sapNumber}
              onChange={(e) => onChange({ sapNumber: e.target.value })}
              placeholder="e.g. P-Z1-C00-080 or IDA-E0380"
              className="w-full rounded-xl bg-slate-50/80 border border-slate-200 px-4 py-2.5 text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Subsection B: Governance & Scope */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-xs font-extrabold text-[#0A3C2F] uppercase tracking-wider">
          B. Governance & Operational Scope
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Country / Organisation */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">
              Country / Organisation Scope *
            </label>
            <select
              value={data.countryOrg}
              onChange={(e) => onChange({ countryOrg: e.target.value })}
              className="w-full rounded-xl bg-slate-50/80 border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer transition-all"
            >
              {COUNTRY_ORG_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {data.countryOrg === "Other (Specify Custom Organisation)" && (
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1 animate-in fade-in mt-2">
                <label className="text-[11px] font-bold text-blue-900 block">
                  Specify Custom Organisation Name *
                </label>
                <input
                  type="text"
                  value={data.customCountryOrg}
                  onChange={(e) =>
                    onChange({ customCountryOrg: e.target.value })
                  }
                  placeholder="e.g. IGAD Secretariat / Regional Authority..."
                  className="w-full rounded-xl bg-white border border-blue-300 px-3 py-1.5 text-xs text-slate-900 font-semibold focus:border-blue-500 outline-none"
                />
              </div>
            )}
          </div>

          {/* Executing Agency */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">
              Executing Agency *
            </label>
            <select
              value={data.executingAgency}
              onChange={(e) => onChange({ executingAgency: e.target.value })}
              className="w-full rounded-xl bg-slate-50/80 border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer transition-all"
            >
              {EXECUTING_AGENCY_OPTIONS.map((ea) => (
                <option key={ea} value={ea}>
                  {ea}
                </option>
              ))}
            </select>

            {data.executingAgency === "Other (Specify Custom Agency)" && (
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1 animate-in fade-in mt-2">
                <label className="text-[11px] font-bold text-blue-900 block">
                  Specify Custom Agency Name *
                </label>
                <input
                  type="text"
                  value={data.customExecutingAgency}
                  onChange={(e) =>
                    onChange({ customExecutingAgency: e.target.value })
                  }
                  placeholder="e.g. Federal Cooperative Agency / Regional Bureau..."
                  className="w-full rounded-xl bg-white border border-blue-300 px-3 py-1.5 text-xs text-slate-900 font-semibold focus:border-blue-500 outline-none"
                />
              </div>
            )}
          </div>

          {/* Organization / Region */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">
              Organization / Region *
            </label>
            <select
              value={data.region}
              onChange={(e) => onChange({ region: e.target.value })}
              className="w-full rounded-xl bg-slate-50/80 border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer transition-all"
            >
              {REGION_OPTIONS.map((rg) => (
                <option key={rg} value={rg}>
                  {rg}
                </option>
              ))}
            </select>
          </div>

          {/* Sector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">
              Sector / Directorate *
            </label>
            <select
              value={data.sector}
              onChange={(e) => onChange({ sector: e.target.value })}
              className="w-full rounded-xl bg-slate-50/80 border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer transition-all"
            >
              {SECTOR_OPTIONS.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

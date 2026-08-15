"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Home,
  ChevronRight,
  Users,
  CheckCircle2,
  AlertCircle,
  Search,
  Check,
} from "lucide-react";
import {
  INITIAL_OFFICERS,
  SECTOR_OPTIONS,
  FUNDING_SOURCE_OPTIONS,
  BUDGET_YEAR_OPTIONS,
  type ProjectItem,
  type ProjectOfficer,
} from "./projectsData";

interface CreateProjectViewProps {
  initialData?: ProjectItem | null;
  onBackClick: () => void;
  onSaveProject: (project: ProjectItem) => void;
}

export function CreateProjectView({
  initialData,
  onBackClick,
  onSaveProject,
}: CreateProjectViewProps) {
  const isEditing = Boolean(initialData);

  // Known funding sources check for pre-filling
  const knownFundingLabels = FUNDING_SOURCE_OPTIONS.map((f) => f.label);
  const isStandardFunding =
    initialData?.fundingSource &&
    knownFundingLabels.includes(initialData.fundingSource);

  // Form State initialized with initialData if editing
  const [code, setCode] = useState(initialData?.code || "");
  const [name, setName] = useState(initialData?.name || "");
  const [budgetYear, setBudgetYear] = useState(
    initialData?.budgetYear || BUDGET_YEAR_OPTIONS[0],
  );
  const [sector, setSector] = useState(
    initialData?.sector || SECTOR_OPTIONS[0],
  );

  const [fundingSource, setFundingSource] = useState(
    isEditing
      ? isStandardFunding
        ? initialData!.fundingSource
        : "Other (Specify Custom Funding Source...)"
      : FUNDING_SOURCE_OPTIONS[0].label,
  );
  const [customFundingSource, setCustomFundingSource] = useState(
    isEditing && !isStandardFunding ? initialData!.fundingSource : "",
  );
  const [description, setDescription] = useState(
    initialData?.description || "",
  );

  // Officer Assignment State pre-populated with assigned officer IDs
  const [selectedOfficerIds, setSelectedOfficerIds] = useState<string[]>(
    initialData?.assignedOfficers.map((o) => o.id) || [],
  );
  const [officerSearchQuery, setOfficerSearchQuery] = useState("");

  // Error validation states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter officers by search
  const filteredOfficers = INITIAL_OFFICERS.filter(
    (off) =>
      off.name.toLowerCase().includes(officerSearchQuery.toLowerCase()) ||
      off.email.toLowerCase().includes(officerSearchQuery.toLowerCase()),
  );

  // Toggle single officer checkbox
  const toggleOfficer = (id: string) => {
    setSelectedOfficerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Select all officers
  const handleSelectAllOfficers = () => {
    setSelectedOfficerIds(INITIAL_OFFICERS.map((o) => o.id));
  };

  // Clear officer selection
  const handleClearOfficers = () => {
    setSelectedOfficerIds([]);
  };

  // Assigned officers list
  const assignedOfficers: ProjectOfficer[] = INITIAL_OFFICERS.filter((o) =>
    selectedOfficerIds.includes(o.id),
  );

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setErrorMessage("Please enter a project reference code.");
      return;
    }
    if (!name.trim()) {
      setErrorMessage("Please enter full project title.");
      return;
    }
    if (selectedOfficerIds.length === 0) {
      setErrorMessage("Please assign at least one procurement officer.");
      return;
    }

    const isCustom =
      fundingSource === "Other (Specify Custom Funding Source...)";
    const finalFunding = isCustom
      ? customFundingSource.trim() || "Custom Funding Source"
      : fundingSource;

    // eslint-disable-next-line react-hooks/purity
    const projectId = initialData?.id ? initialData.id : `proj-${Date.now()}`;

    const updatedProject: ProjectItem = {
      id: projectId,
      code: code.trim(),
      name: name.trim(),
      budgetYear,
      sector,
      fundingSource: finalFunding,
      customFundingSource: isCustom ? customFundingSource.trim() : undefined,
      assignedOfficers,
      description: description.trim() || "Sector project registered.",
      status: initialData?.status || "Active",
      createdAt:
        initialData?.createdAt || new Date().toISOString().split("T")[0],
    };

    onSaveProject(updatedProject);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl mx-auto">
      {/* 1. Breadcrumb Bar */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
        <Link
          href="/dashboard"
          title="Go to Dashboard"
          className="text-slate-500 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1"
        >
          <Home className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <button
          type="button"
          onClick={onBackClick}
          className="text-slate-500 hover:text-slate-900 font-medium cursor-pointer hover:underline"
        >
          Projects Management
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="font-bold text-[#0A3C2F]">
          {isEditing ? "Edit Sector Project" : "Create New Project"}
        </span>
      </nav>

      {/* 2. Top Header Bar Card */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              {isEditing
                ? `Edit Project (${initialData?.code})`
                : "Create New  Project"}
            </h1>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-2xl">
            {isEditing
              ? "Modify sector project details, update assigned procurement officers, or reconfigure donor funding."
              : "Register sector project, assign multiple procurement officers, and configure standard or custom donor funding."}
          </p>
        </div>

        <button
          onClick={onBackClick}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm px-4.5 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <span>Back to Projects List</span>
        </button>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3. Main Registration / Edit Form Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-8 shadow-2xs space-y-6"
      >
        {/* ROW 1: Code & Budget Year */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Project Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">
              Project Code (e.g., BREFONS-P-Z1-C00-080) *
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter project reference code"
              className="w-full rounded-xl bg-slate-50/80 border border-slate-200 px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-mono font-bold"
            />
          </div>

          {/* Budget Year */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">
              Budget Year *
            </label>
            <select
              value={budgetYear}
              onChange={(e) => setBudgetYear(e.target.value)}
              className="w-full rounded-xl bg-slate-50/80 border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer transition-all"
            >
              {BUDGET_YEAR_OPTIONS.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ROW 2: Project Full Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 block">
            Project Name / Full Title *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter full project title"
            className="w-full rounded-xl bg-slate-50/80 border border-slate-200 px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-semibold"
          />
        </div>

        {/* ROW 3: Sector & Funding Source */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Sector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">
              Sector / Directorate *
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full rounded-xl bg-slate-50/80 border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer transition-all"
            >
              {SECTOR_OPTIONS.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          {/* Funding Source / Donor */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">
              Funding Source / Donor *
            </label>
            <select
              value={fundingSource}
              onChange={(e) => setFundingSource(e.target.value)}
              className="w-full rounded-xl bg-slate-50/80 border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer transition-all"
            >
              <optgroup label="Standard Funding Sources">
                {FUNDING_SOURCE_OPTIONS.filter(
                  (f) => f.category === "Standard",
                ).map((f) => (
                  <option key={f.label} value={f.label}>
                    {f.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Custom / Other">
                {FUNDING_SOURCE_OPTIONS.filter(
                  (f) => f.category === "Custom",
                ).map((f) => (
                  <option key={f.label} value={f.label}>
                    🤙 {f.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Conditional Custom Donor Input */}
        {fundingSource === "Other (Specify Custom Funding Source...)" && (
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1.5 animate-in fade-in">
            <label className="text-xs font-bold text-blue-900 block">
              Custom Donor / Funding Source Name *
            </label>
            <input
              type="text"
              value={customFundingSource}
              onChange={(e) => setCustomFundingSource(e.target.value)}
              placeholder="e.g. EU Grant / IFAD / USAID / Bilateral Donor..."
              className="w-full rounded-xl bg-white border border-blue-300 px-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none font-semibold"
            />
          </div>
        )}

        {/* ROW 4: Assign Procurement Officers Box */}
        <div className="rounded-2xl bg-slate-50/60 border border-slate-200/90 p-4.5 sm:p-6 space-y-4">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-700" />
                <h3 className="text-xs font-bold text-slate-900">
                  Assign Procurement Officers (Officers Only — Select One or
                  More) *
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Select one or more procurement officers who will prepare and
                manage procurement plans for this project.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleSelectAllOfficers}
                className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Select All ({INITIAL_OFFICERS.length})
              </button>
              <button
                type="button"
                onClick={handleClearOfficers}
                className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Clear Selection
              </button>
            </div>
          </div>

          {/* Dynamic Status Alert Banner */}
          {selectedOfficerIds.length === 0 ? (
            <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-3 text-xs text-amber-800 flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                <strong>Assigned Officers (0):</strong> No officer selected yet.
                Please check one or more officers below.
              </span>
            </div>
          ) : (
            <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                <strong>
                  Assigned Officers ({selectedOfficerIds.length}):
                </strong>{" "}
                {assignedOfficers.map((o) => o.name).join(", ")}
              </span>
            </div>
          )}

          {/* Officer Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={officerSearchQuery}
              onChange={(e) => setOfficerSearchQuery(e.target.value)}
              placeholder="Search officers by name or email..."
              className="w-full rounded-xl bg-white border border-slate-200 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Officer Checkbox Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredOfficers.map((officer) => {
              const isChecked = selectedOfficerIds.includes(officer.id);
              return (
                <div
                  key={officer.id}
                  onClick={() => toggleOfficer(officer.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                    isChecked
                      ? "bg-white border-emerald-500 shadow-xs ring-1 ring-emerald-500/30"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Custom Checkbox */}
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all shrink-0 ${
                        isChecked
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "bg-slate-50 border-slate-300"
                      }`}
                    >
                      {isChecked && (
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      )}
                    </div>

                    <div>
                      <p className="font-bold text-slate-900 text-xs">
                        {officer.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {officer.email}
                      </p>
                    </div>
                  </div>

                  <span className="bg-slate-100 text-slate-600 font-extrabold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-md">
                    {officer.roleTag}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ROW 5: Description & Objectives */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 block">
            Project Description & Objectives
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Summary of project objectives, expected milestones, and regional coverage..."
            className="w-full rounded-xl bg-slate-50/80 border border-slate-200 p-4 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-y"
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onBackClick}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-[#0A3C2F] hover:bg-[#072b22] text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <Check className="h-4 w-4 stroke-[2.5]" />
            <span>
              {isEditing
                ? "Save Changes & Update Project"
                : "Save & Register Project"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}

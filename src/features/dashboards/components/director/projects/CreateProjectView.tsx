"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Home,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Search,
  Check,
  Plus,
  Trash2,
  Landmark,
  Calendar,
  Layers,
  Building2,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  FileText,
  ArrowRightLeft,
} from "lucide-react";
import {
  gregorianToEthiopian,
  formatEthiopianDate,
} from "../../../../projects/utils/ethiopianCalendar";
import {
  INITIAL_OFFICERS,
  SECTOR_OPTIONS,
  FUNDING_SOURCE_OPTIONS,
  FUNDING_TYPE_OPTIONS,
  COUNTRY_ORG_OPTIONS,
  EXECUTING_AGENCY_OPTIONS,
  REGION_OPTIONS,
  CURRENCY_OPTIONS,
  STATUS_OPTIONS,
  BUDGET_YEAR_OPTIONS,
  type ProjectItem,
  type ProjectOfficer,
} from "./projectsData";

interface CreateProjectViewProps {
  initialData?: ProjectItem | null;
  onBackClick: () => void;
  onSaveProject: (project: ProjectItem) => void;
}

const WIZARD_STEPS = [
  {
    id: 1,
    label: "Identity & Governance",
    shortLabel: "Identity",
    icon: Building2,
  },
  {
    id: 2,
    label: "Financials & Donors",
    shortLabel: "Financials",
    icon: Landmark,
  },
  {
    id: 3,
    label: "Components & Dates",
    shortLabel: "Components",
    icon: Layers,
  },
  {
    id: 4,
    label: "Officers & Summary",
    shortLabel: "Officers",
    icon: UserCheck,
  },
];

export function CreateProjectView({
  initialData,
  onBackClick,
  onSaveProject,
}: CreateProjectViewProps) {
  const isEditing = Boolean(initialData);

  // Active Wizard Step (1 to 4)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // 1. Core Project Identity State
  const [code, setCode] = useState(initialData?.code || "");
  const [name, setName] = useState(initialData?.name || "");
  const [sapNumber, setSapNumber] = useState(initialData?.sapNumber || "");
  const [status, setStatus] = useState<"Active" | "Inactive">(
    initialData?.status || "Active",
  );
  const [budgetYear, setBudgetYear] = useState(
    initialData?.budgetYear || BUDGET_YEAR_OPTIONS[0],
  );
  const [sector, setSector] = useState(
    initialData?.sector || SECTOR_OPTIONS[0],
  );

  // 2. Governance & Regional Scope State with Custom Write-down Support
  const isKnownCountryOrg =
    initialData?.countryOrg &&
    COUNTRY_ORG_OPTIONS.includes(initialData.countryOrg);

  const [countryOrg, setCountryOrg] = useState(
    isEditing
      ? isKnownCountryOrg
        ? initialData!.countryOrg
        : "Other (Specify Custom Organisation)"
      : COUNTRY_ORG_OPTIONS[0],
  );
  const [customCountryOrg, setCustomCountryOrg] = useState(
    isEditing && !isKnownCountryOrg ? initialData!.countryOrg : "",
  );

  const isKnownExecutingAgency =
    initialData?.executingAgency &&
    EXECUTING_AGENCY_OPTIONS.includes(initialData.executingAgency);

  const [executingAgency, setExecutingAgency] = useState(
    isEditing
      ? isKnownExecutingAgency
        ? initialData!.executingAgency
        : "Other (Specify Custom Agency)"
      : EXECUTING_AGENCY_OPTIONS[0],
  );
  const [customExecutingAgency, setCustomExecutingAgency] = useState(
    isEditing && !isKnownExecutingAgency ? initialData!.executingAgency : "",
  );

  const [region, setRegion] = useState(
    initialData?.region || REGION_OPTIONS[0],
  );

  // 3. Financial Configuration State with Custom Donor Support
  const knownFundingLabels = FUNDING_SOURCE_OPTIONS.map((f) => f.label);
  const isStandardFunding =
    initialData?.fundingSource &&
    knownFundingLabels.includes(initialData.fundingSource);

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
  const [fundingType, setFundingType] = useState(
    initialData?.fundingType || FUNDING_TYPE_OPTIONS[0],
  );
  const [currency, setCurrency] = useState(
    initialData?.currency || CURRENCY_OPTIONS[0],
  );

  // Repeatable Loan / Credit / Grant Numbers List
  const [loanGrantNumbers, setLoanGrantNumbers] = useState<string[]>(
    initialData?.loanGrantNumbers && initialData.loanGrantNumbers.length > 0
      ? initialData.loanGrantNumbers
      : [""],
  );

  // 4. Project Components & Subcomponents Repeatable Lists
  const [components, setComponents] = useState<string[]>(
    initialData?.components && initialData.components.length > 0
      ? initialData.components
      : [""],
  );
  const [subcomponents, setSubcomponents] = useState<string[]>(
    initialData?.subcomponents && initialData.subcomponents.length > 0
      ? initialData.subcomponents
      : [""],
  );

  // Dates
  const [startDate, setStartDate] = useState(initialData?.startDate || "");
  const [endDate, setEndDate] = useState(initialData?.endDate || "");

  // Description
  const [description, setDescription] = useState(
    initialData?.description || "",
  );

  // 5. Procurement Officer Assignment State
  const [selectedOfficerIds, setSelectedOfficerIds] = useState<string[]>(
    initialData?.assignedOfficers.map((o) => o.id) || [],
  );
  const [officerSearchQuery, setOfficerSearchQuery] = useState("");

  // Error validation state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handlers for repeatable field lists
  const handleAddLoanNumber = () =>
    setLoanGrantNumbers((prev) => [...prev, ""]);
  const handleRemoveLoanNumber = (index: number) =>
    setLoanGrantNumbers((prev) => prev.filter((_, i) => i !== index));
  const handleLoanNumberChange = (index: number, value: string) => {
    setLoanGrantNumbers((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleAddComponent = () => setComponents((prev) => [...prev, ""]);
  const handleRemoveComponent = (index: number) =>
    setComponents((prev) => prev.filter((_, i) => i !== index));
  const handleComponentChange = (index: number, value: string) => {
    setComponents((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleAddSubcomponent = () => setSubcomponents((prev) => [...prev, ""]);
  const handleRemoveSubcomponent = (index: number) =>
    setSubcomponents((prev) => prev.filter((_, i) => i !== index));
  const handleSubcomponentChange = (index: number, value: string) => {
    setSubcomponents((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  // Officer Selection & Pagination Handlers
  const [officerPageIndex, setOfficerPageIndex] = useState(0);
  const OFFICER_PAGE_SIZE = 4;

  const filteredOfficers = INITIAL_OFFICERS.filter(
    (off) =>
      off.name.toLowerCase().includes(officerSearchQuery.toLowerCase()) ||
      off.email.toLowerCase().includes(officerSearchQuery.toLowerCase()),
  );

  const totalOfficerPages = Math.ceil(
    filteredOfficers.length / OFFICER_PAGE_SIZE,
  );

  const paginatedOfficers = filteredOfficers.slice(
    officerPageIndex * OFFICER_PAGE_SIZE,
    (officerPageIndex + 1) * OFFICER_PAGE_SIZE,
  );

  const toggleOfficer = (id: string) => {
    setSelectedOfficerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAllOfficers = () => {
    setSelectedOfficerIds(INITIAL_OFFICERS.map((o) => o.id));
  };

  const handleClearOfficers = () => {
    setSelectedOfficerIds([]);
  };

  const assignedOfficers: ProjectOfficer[] = INITIAL_OFFICERS.filter((o) =>
    selectedOfficerIds.includes(o.id),
  );

  // Step Validation & Navigation
  const validateCurrentStep = (stepToValidate: number): boolean => {
    setErrorMessage(null);
    if (stepToValidate === 1) {
      if (!code.trim()) {
        setErrorMessage(
          "Please enter a unique Project Short Code (e.g. BREFONS or DRIVE).",
        );
        return false;
      }
      if (!name.trim()) {
        setErrorMessage("Please enter the full Project / Programme Name.");
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateCurrentStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Final Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCurrentStep(1)) return;

    if (selectedOfficerIds.length === 0) {
      setErrorMessage(
        "Please assign at least one procurement officer before submitting.",
      );
      setCurrentStep(4);
      return;
    }

    const finalCountryOrg =
      countryOrg === "Other (Specify Custom Organisation)"
        ? customCountryOrg.trim() || "Custom Organisation"
        : countryOrg;

    const finalExecutingAgency =
      executingAgency === "Other (Specify Custom Agency)"
        ? customExecutingAgency.trim() || "Custom Executing Agency"
        : executingAgency;

    const isCustomDonor =
      fundingSource === "Other (Specify Custom Funding Source...)";
    const finalFunding = isCustomDonor
      ? customFundingSource.trim() || "Custom Funding Source"
      : fundingSource;

    const validLoanNumbers = loanGrantNumbers.filter((l) => l.trim() !== "");
    const validComponents = components.filter((c) => c.trim() !== "");
    const validSubcomponents = subcomponents.filter((s) => s.trim() !== "");

    // eslint-disable-next-line react-hooks/purity
    const projectId = initialData?.id ? initialData.id : `proj-${Date.now()}`;

    const updatedProject: ProjectItem = {
      id: projectId,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      sapNumber: sapNumber.trim() || undefined,
      countryOrg: finalCountryOrg,
      executingAgency: finalExecutingAgency,
      region,
      budgetYear,
      fundingSource: finalFunding,
      customFundingSource: isCustomDonor
        ? customFundingSource.trim()
        : undefined,
      fundingType,
      loanGrantNumbers: validLoanNumbers,
      components: validComponents,
      subcomponents: validSubcomponents,
      currency,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      sector,
      assignedOfficers,
      description: description.trim() || "Project registered.",
      status,
      createdAt:
        initialData?.createdAt || new Date().toISOString().split("T")[0],
    };

    onSaveProject(updatedProject);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto animate-in fade-in duration-200 pb-12">
      {/* 1. Unboxed Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs px-1"
      >
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

      {/* 2. UNIFIED SINGLE CARD CONTAINER */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* HEADER SECTION */}
        <div className="p-5 sm:p-7 border-b border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                {isEditing
                  ? `Edit Sector Project (${initialData?.code})`
                  : "Create Project"}
              </h1>
            </div>
            <p className="mt-1.5 text-xs text-slate-500 max-w-3xl leading-relaxed">
              Highest procurement container. Stored project headers are
              inherited by all plans and activity items.
            </p>
          </div>
        </div>

        {/* STEPPER PROGRESS BAR SECTION */}
        <div className="px-4 py-4 sm:px-8 border-b border-slate-100 bg-white overflow-x-auto">
          <div className="flex items-center justify-between min-w-[540px] max-w-3xl mx-auto">
            {WIZARD_STEPS.map((step, index) => {
              const IconComponent = step.icon;
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;
              const isClickable =
                isEditing || step.id <= currentStep + 1 || isCompleted;
              const isLast = index === WIZARD_STEPS.length - 1;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  {/* Step Node */}
                  <div
                    onClick={() => {
                      if (isClickable) {
                        if (validateCurrentStep(currentStep)) {
                          setCurrentStep(step.id);
                        }
                      }
                    }}
                    className={`flex items-center gap-2 sm:gap-2.5 transition-all select-none ${
                      isClickable
                        ? "cursor-pointer"
                        : "cursor-not-allowed opacity-60"
                    } ${isActive ? "scale-102" : "opacity-85 hover:opacity-100"}`}
                  >
                    {/* Circle Icon Badge */}
                    <div
                      className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-all duration-200 shrink-0 text-xs ${
                        isActive
                          ? "bg-[#0A3C2F] text-white ring-4 ring-emerald-600/20 shadow-2xs"
                          : isCompleted
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-400 border border-slate-200/80"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-4.5 w-4.5 stroke-[3]" />
                      ) : (
                        <IconComponent className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                      )}
                    </div>

                    {/* Label */}
                    <div className="flex flex-col">
                      <span
                        className={`text-xs font-extrabold leading-tight ${
                          isActive
                            ? "text-[#0A3C2F]"
                            : isCompleted
                              ? "text-emerald-900 font-bold"
                              : "text-slate-400"
                        }`}
                      >
                        <span className="hidden sm:inline">{step.label}</span>
                        <span className="sm:hidden">{step.shortLabel}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        Step 0{step.id}
                      </span>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {!isLast && (
                    <div className="flex-1 mx-2 sm:mx-4">
                      <div
                        className={`h-0.5 w-full transition-colors duration-300 rounded-full ${
                          isCompleted || currentStep > step.id
                            ? "bg-emerald-600"
                            : "bg-slate-200"
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ERROR ALERT */}
        {errorMessage && (
          <div className="mx-6 sm:mx-8 mt-5 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-800 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-800 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* FORM BODY SECTION */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 sm:p-8">
            {/* STEP 1: Identity & Governance */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Subsection A: Core Identity */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                    <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                      1. Core Project Identity
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Project Code */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 block">
                        Project Short Code *
                      </label>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="e.g. BREFONS or DRIVE"
                        className="w-full rounded-xl bg-slate-50/80 border border-slate-200 px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none font-mono font-bold uppercase transition-all"
                      />
                      <span className="text-[10px] text-slate-400 block">
                        Unique project short identifier.
                      </span>
                    </div>

                    {/* Project Name */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-800 block">
                        Project / Programme Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full project/programme title..."
                        className="w-full rounded-xl bg-slate-50/80 border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                      />
                    </div>

                    {/* SAP ID */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 block">
                        Project SAP Identification No. (Optional)
                      </label>
                      <input
                        type="text"
                        value={sapNumber}
                        onChange={(e) => setSapNumber(e.target.value)}
                        placeholder="e.g. P-Z1-C00-080 or IDA-E0380"
                        className="w-full rounded-xl bg-slate-50/80 border border-slate-200 px-4 py-2.5 text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                      />
                    </div>

                    {/* Budget Year */}

                    {/* Status */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 block">
                        Project Status *
                      </label>
                      <select
                        value={status}
                        onChange={(e) =>
                          setStatus(e.target.value as "Active" | "Inactive")
                        }
                        className="w-full rounded-xl bg-slate-50/80 border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer transition-all"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st === "Active" ? "Active" : "Inactive (Disabled)"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Subsection B: Governance & Scope */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                    <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                      Governance & Regional Scope
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Country / Org */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 block">
                        Country / Organisation *
                      </label>
                      <select
                        value={countryOrg}
                        onChange={(e) => setCountryOrg(e.target.value)}
                        className="w-full rounded-xl bg-slate-50/80 border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer transition-all"
                      >
                        {COUNTRY_ORG_OPTIONS.map((co) => (
                          <option key={co} value={co}>
                            {co}
                          </option>
                        ))}
                      </select>

                      {/* Custom Country / Organisation Write-down Field */}
                      {countryOrg === "Other (Specify Custom Organisation)" && (
                        <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1 animate-in fade-in mt-2">
                          <label className="text-[11px] font-bold text-blue-900 block">
                            Specify Custom Organisation Name *
                          </label>
                          <input
                            type="text"
                            value={customCountryOrg}
                            onChange={(e) =>
                              setCustomCountryOrg(e.target.value)
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
                        value={executingAgency}
                        onChange={(e) => setExecutingAgency(e.target.value)}
                        className="w-full rounded-xl bg-slate-50/80 border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer transition-all"
                      >
                        {EXECUTING_AGENCY_OPTIONS.map((ea) => (
                          <option key={ea} value={ea}>
                            {ea}
                          </option>
                        ))}
                      </select>

                      {/* Custom Executing Agency Write-down Field */}
                      {executingAgency === "Other (Specify Custom Agency)" && (
                        <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1 animate-in fade-in mt-2">
                          <label className="text-[11px] font-bold text-blue-900 block">
                            Specify Custom Agency Name *
                          </label>
                          <input
                            type="text"
                            value={customExecutingAgency}
                            onChange={(e) =>
                              setCustomExecutingAgency(e.target.value)
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
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
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
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
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
            )}

            {/* STEP 2: Financials & Donors */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <h2 className="text-sm font-extrabold text-slate-950 tracking-tight">
                    Financial Configuration & Donor Allocation
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {/* Donor */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      Funding Source / Donor *
                    </label>
                    <select
                      value={fundingSource}
                      onChange={(e) => setFundingSource(e.target.value)}
                      className="w-full rounded-xl bg-slate-50/80 border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer transition-all"
                    >
                      <optgroup label="Standard Donors">
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

                  {/* Funding Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      Funding Type *
                    </label>
                    <select
                      value={fundingType}
                      onChange={(e) => setFundingType(e.target.value)}
                      className="w-full rounded-xl bg-slate-50/80 border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer transition-all"
                    >
                      {FUNDING_TYPE_OPTIONS.map((ft) => (
                        <option key={ft} value={ft}>
                          {ft}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Currency */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      Base / Reporting Currency *
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full rounded-xl bg-slate-50/80 border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer transition-all"
                    >
                      {CURRENCY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Custom Donor Input */}
                {fundingSource ===
                  "Other (Specify Custom Funding Source...)" && (
                  <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1.5 animate-in fade-in">
                    <label className="text-xs font-bold text-blue-900 block">
                      Specify Custom Funding Source / Donor Name *
                    </label>
                    <input
                      type="text"
                      value={customFundingSource}
                      onChange={(e) => setCustomFundingSource(e.target.value)}
                      placeholder="e.g. Bilateral Grant / KFW / USAID..."
                      className="w-full rounded-xl bg-white border border-blue-300 px-4 py-2.5 text-xs text-slate-900 font-semibold focus:border-blue-500 outline-none"
                    />
                  </div>
                )}

                {/* Repeatable Loan / Credit / Grant Numbers */}
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 block">
                      Loan / Credit / Grant Number(s) (Repeatable)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddLoanNumber}
                      className="text-xs text-emerald-800 hover:text-emerald-900 font-extrabold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Number</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {loanGrantNumbers.map((num, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={num}
                          onChange={(e) =>
                            handleLoanNumberChange(idx, e.target.value)
                          }
                          placeholder={`e.g. ${
                            idx === 0 ? "IDA-E0380" : "2100155041683"
                          }`}
                          className="flex-1 rounded-xl bg-slate-50/80 border border-slate-200 px-4 py-2 text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none"
                        />
                        {loanGrantNumbers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLoanNumber(idx)}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Components & Dates */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                    Components & Timeline Breakdown
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Repeatable Project Components */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 block">
                        Project Components (Repeatable)
                      </label>
                      <button
                        type="button"
                        onClick={handleAddComponent}
                        className="text-xs text-emerald-800 hover:text-emerald-900 font-extrabold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Component</span>
                      </button>
                    </div>
                    <div className="space-y-2">
                      {components.map((comp, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={comp}
                            onChange={(e) =>
                              handleComponentChange(idx, e.target.value)
                            }
                            placeholder="e.g. Component 1: Livestock Value Chains"
                            className="flex-1 rounded-xl bg-slate-50/80 border border-slate-200 px-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none"
                          />
                          {components.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveComponent(idx)}
                              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Repeatable Subcomponents */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 block">
                        Subcomponents (Optional, Repeatable)
                      </label>
                      <button
                        type="button"
                        onClick={handleAddSubcomponent}
                        className="text-xs text-emerald-800 hover:text-emerald-900 font-extrabold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Subcomponent</span>
                      </button>
                    </div>
                    <div className="space-y-2">
                      {subcomponents.map((sub, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={sub}
                            onChange={(e) =>
                              handleSubcomponentChange(idx, e.target.value)
                            }
                            placeholder="e.g. 1.1 Water Infrastructure"
                            className="flex-1 rounded-xl bg-slate-50/80 border border-slate-200 px-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none"
                          />
                          {subcomponents.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSubcomponent(idx)}
                              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Timeline with Dual Calendar (GC ⇄ EC) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                  {/* Start Date Dual Calendar */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 block flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-[#0A3C2F]" />
                      <span>Project Start Date (Optional)</span>
                    </label>
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-extrabold tracking-wider text-slate-500 uppercase px-1">
                        <span>GREGORIAN</span>
                        <span>ETHIOPIAN</span>
                      </div>
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-[#0A3C2F] outline-none"
                        />
                        <ArrowRightLeft className="h-4 w-4 text-slate-400 shrink-0" />
                        <div className="relative">
                          <input
                            type="text"
                            readOnly
                            value={
                              startDate && gregorianToEthiopian(startDate)
                                ? formatEthiopianDate(
                                    gregorianToEthiopian(startDate)!,
                                  )
                                : ""
                            }
                            placeholder="DD-Month-YYYY"
                            className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-xs text-slate-900 font-semibold outline-none pr-8"
                          />
                          <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* End Date Dual Calendar */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 block flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-[#0A3C2F]" />
                      <span>Project End Date (Optional)</span>
                    </label>
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-extrabold tracking-wider text-slate-500 uppercase px-1">
                        <span>GREGORIAN</span>
                        <span>ETHIOPIAN</span>
                      </div>
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-[#0A3C2F] outline-none"
                        />
                        <ArrowRightLeft className="h-4 w-4 text-slate-400 shrink-0" />
                        <div className="relative">
                          <input
                            type="text"
                            readOnly
                            value={
                              endDate && gregorianToEthiopian(endDate)
                                ? formatEthiopianDate(
                                    gregorianToEthiopian(endDate)!,
                                  )
                                : ""
                            }
                            placeholder="DD-Month-YYYY"
                            className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-xs text-slate-900 font-semibold outline-none pr-8"
                          />
                          <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Officers & Summary */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Officers Assignment */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4.5 w-4.5 text-[#0A3C2F]" />
                        <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                          Assign Procurement Officers *
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Select one or more procurement officers responsible for
                        managing procurement plans.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={handleSelectAllOfficers}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Select All ({INITIAL_OFFICERS.length})
                      </button>
                      <button
                        type="button"
                        onClick={handleClearOfficers}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Clear Selection
                      </button>
                    </div>
                  </div>

                  {/* Status Banner */}
                  {selectedOfficerIds.length === 0 ? (
                    <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-3.5 text-xs text-amber-800 flex items-center gap-2 font-medium">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>Assigned Officers (0):</strong> No officer
                        selected yet. Please check one or more officers below.
                      </span>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-3.5 text-xs text-emerald-800 flex items-center gap-2 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>
                        <strong>
                          Assigned Officers ({selectedOfficerIds.length}):
                        </strong>{" "}
                        {assignedOfficers.map((o) => o.name).join(", ")}
                      </span>
                    </div>
                  )}

                  {/* Search Box */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={officerSearchQuery}
                      onChange={(e) => setOfficerSearchQuery(e.target.value)}
                      placeholder="Search officers by name or email..."
                      className="w-full rounded-xl bg-slate-50/80 border border-slate-200 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none"
                    />
                  </div>

                  {/* Officer Selectable Table with Pagination */}
                  <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                            <th className="py-2.5 px-3 text-center w-12">
                              <input
                                type="checkbox"
                                checked={
                                  paginatedOfficers.length > 0 &&
                                  paginatedOfficers.every((o) =>
                                    selectedOfficerIds.includes(o.id),
                                  )
                                }
                                onChange={() => {
                                  const allPaginatedSelected =
                                    paginatedOfficers.every((o) =>
                                      selectedOfficerIds.includes(o.id),
                                    );
                                  if (allPaginatedSelected) {
                                    setSelectedOfficerIds((prev) =>
                                      prev.filter(
                                        (id) =>
                                          !paginatedOfficers.some(
                                            (o) => o.id === id,
                                          ),
                                      ),
                                    );
                                  } else {
                                    const newIds = new Set([
                                      ...selectedOfficerIds,
                                      ...paginatedOfficers.map((o) => o.id),
                                    ]);
                                    setSelectedOfficerIds(Array.from(newIds));
                                  }
                                }}
                                className="h-4 w-4 accent-[#0A3C2F] rounded cursor-pointer"
                              />
                            </th>
                            <th className="py-2.5 px-3">Officer Name</th>
                            <th className="py-2.5 px-3">Email Address</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {paginatedOfficers.length === 0 ? (
                            <tr>
                              <td
                                colSpan={3}
                                className="py-6 text-center text-slate-500"
                              >
                                No matching officers found.
                              </td>
                            </tr>
                          ) : (
                            paginatedOfficers.map((officer) => {
                              const isChecked = selectedOfficerIds.includes(
                                officer.id,
                              );
                              return (
                                <tr
                                  key={officer.id}
                                  onClick={() => toggleOfficer(officer.id)}
                                  className={`cursor-pointer transition-colors ${
                                    isChecked
                                      ? "bg-emerald-50/60 font-semibold"
                                      : "hover:bg-slate-50"
                                  }`}
                                >
                                  <td className="py-2.5 px-3 text-center">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        toggleOfficer(officer.id);
                                      }}
                                      className="h-4 w-4 accent-[#0A3C2F] rounded cursor-pointer"
                                    />
                                  </td>
                                  <td className="py-2.5 px-3 font-bold text-slate-900">
                                    {officer.name}
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                                    {officer.email}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Officer Table Pagination */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
                      <span>
                        Showing{" "}
                        {filteredOfficers.length > 0
                          ? officerPageIndex * OFFICER_PAGE_SIZE + 1
                          : 0}{" "}
                        to{" "}
                        {Math.min(
                          (officerPageIndex + 1) * OFFICER_PAGE_SIZE,
                          filteredOfficers.length,
                        )}{" "}
                        of {filteredOfficers.length} Officers
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={officerPageIndex === 0}
                          onClick={() =>
                            setOfficerPageIndex((p) => Math.max(0, p - 1))
                          }
                          className="h-7 w-7 flex items-center justify-center rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <ChevronLeft className="h-3.5 w-3.5 text-slate-600" />
                        </button>
                        <span className="px-2 font-semibold">
                          {officerPageIndex + 1} / {totalOfficerPages || 1}
                        </span>
                        <button
                          type="button"
                          disabled={officerPageIndex >= totalOfficerPages - 1}
                          onClick={() =>
                            setOfficerPageIndex((p) =>
                              Math.min(totalOfficerPages - 1, p + 1),
                            )
                          }
                          className="h-7 w-7 flex items-center justify-center rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description & Objectives */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                    <FileText className="h-4.5 w-4.5 text-[#0A3C2F]" />
                    <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                      Description & Objectives Summary
                    </h2>
                  </div>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Summary of project objectives, expected milestones, and regional coverage..."
                    className="w-full rounded-xl bg-slate-50/80 border border-slate-200 p-4 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none transition-all resize-y"
                  />
                </div>
              </div>
            )}
          </div>

          {/* FOOTER ACTIONS SECTION */}
          <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between gap-3">
            {/* Back Step / Cancel */}
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold px-4.5 py-2.5 rounded-xl text-xs cursor-pointer transition-colors flex items-center gap-2 shadow-2xs"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Step 0{currentStep - 1}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onBackClick}
                className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold px-4.5 py-2.5 rounded-xl text-xs cursor-pointer transition-colors shadow-2xs"
              >
                Cancel
              </button>
            )}

            {/* Next Step / Save Project Submit */}
            {currentStep < 4 ? (
              <div className="flex items-center gap-2">
                {isEditing && (
                  <button
                    type="submit"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-98"
                  >
                    <Check className="h-4 w-4 stroke-[2.5]" />
                    <span>Save Changes</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-[#0A3C2F] hover:bg-[#072b22] text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-98"
                >
                  <span>
                    Next Step: {WIZARD_STEPS[currentStep]?.label || "Next"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="submit"
                className="bg-[#0A3C2F] hover:bg-[#072b22] text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <Check className="h-4 w-4 stroke-[2.5]" />
                <span>
                  {isEditing
                    ? "Save Changes & Update Project"
                    : "Save & Register Project"}
                </span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

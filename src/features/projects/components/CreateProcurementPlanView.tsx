"use client";

import type {
  OfficerProject,
  ProcurementCategory,
} from "../data/officerProjects";
import type { ProcurementPlanDraftInput } from "../data/officerPlanDrafts";
import {
  daysInEthiopianMonth,
  ETHIOPIAN_MONTHS,
  ethiopianToGregorian,
  ethiopianWeekday,
  formatEthiopianDate,
  gregorianToEthiopian,
  parseEthiopianDate,
  type EthiopianDate,
} from "../utils/ethiopianCalendar";
import {
  ArrowLeft,
  ArrowRight,
  ArrowRightLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Hammer,
  House,
  Info,
  Lightbulb,
  LockKeyhole,
  Save,
  Settings,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";

type SaveAction = "activity" | "draft" | null;

interface PlanFormState {
  budgetYear: string;
  generalProcurementNoticeDate: string;
  generalProcurementNoticeDateEthiopian: string;
  organizationRegion: string;
  periodFrom: string;
  periodFromEthiopian: string;
  periodTo: string;
  periodToEthiopian: string;
  planName: string;
  remarks: string;
}

const compactFieldClasses =
  "h-10 w-full rounded-none border border-slate-400 bg-white px-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#176c55] focus:ring-2 focus:ring-[#176c55]/15";

export const procurementCategories = [
  {
    description: "Physical items, equipment, and commodities.",
    icon: ShoppingCart,
    value: "Goods" as const,
  },
  {
    description:
      "Construction, infrastructure, and civil engineering projects.",
    icon: Hammer,
    value: "Works" as const,
  },
  {
    description:
      "Operational services like maintenance, security, and transport.",
    icon: Settings,
    value: "Non-Consulting Services" as const,
  },
  {
    description:
      "Intellectual and advisory services provided by firms or individuals.",
    icon: Lightbulb,
    value: "Consultancy Services" as const,
  },
];

export function suggestedPlanName(
  project: OfficerProject,
  category: ProcurementCategory,
  budgetYear: string,
) {
  return `${project.shortName} - ${category} Procurement Plan - ${budgetYear} EFY`;
}

export function CreateProcurementPlanView({
  onSavePlan,
  project,
}: {
  onSavePlan: (
    input: ProcurementPlanDraftInput,
    action: Exclude<SaveAction, null>,
  ) => void;
  project: OfficerProject;
}) {
  const [selectedCategory, setSelectedCategory] =
    useState<ProcurementCategory | null>(null);
  const [planNameEdited, setPlanNameEdited] = useState(false);
  const [saveAction, setSaveAction] = useState<SaveAction>(null);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [form, setForm] = useState<PlanFormState>({
    budgetYear: "2017",
    generalProcurementNoticeDate: "",
    generalProcurementNoticeDateEthiopian: "",
    organizationRegion:
      project.availableOrganizationRegions?.[0] ??
      project.organizationRegion ??
      "",
    periodFrom: "",
    periodFromEthiopian: "",
    periodTo: "",
    periodToEthiopian: "",
    planName: "",
    remarks: "",
  });

  const detailHref = `/workspace/projects?project=${encodeURIComponent(
    project.code,
  )}`;
  const dateOrderError = Boolean(
    form.periodFrom && form.periodTo && form.periodTo < form.periodFrom,
  );
  const categoryError = validationAttempted && !selectedCategory;
  const nameError = validationAttempted && !form.planName.trim();
  const periodFromError = validationAttempted && !form.periodFrom;
  const periodToError =
    validationAttempted && (!form.periodTo || dateOrderError);

  function handleCategoryChange(category: ProcurementCategory) {
    setSaveAction(null);
    setSelectedCategory(category);
    if (!planNameEdited) {
      setForm((current) => ({
        ...current,
        planName: suggestedPlanName(project, category, current.budgetYear),
      }));
    }
  }

  function updateField(field: keyof PlanFormState, value: string) {
    setSaveAction(null);
    if (field === "planName") setPlanNameEdited(true);

    setForm((current) => {
      const next = { ...current, [field]: value };

      if (field === "budgetYear" && selectedCategory && !planNameEdited) {
        next.planName = suggestedPlanName(project, selectedCategory, value);
      }

      return next;
    });
  }

  function updateDatePair(
    period: "from" | "notice" | "to",
    gregorianValue: string,
    ethiopianValue: string,
  ) {
    setSaveAction(null);
    setForm((current) => {
      if (period === "from") {
        return {
          ...current,
          periodFrom: gregorianValue,
          periodFromEthiopian: ethiopianValue,
        };
      }

      if (period === "to") {
        return {
          ...current,
          periodTo: gregorianValue,
          periodToEthiopian: ethiopianValue,
        };
      }

      return {
        ...current,
        generalProcurementNoticeDate: gregorianValue,
        generalProcurementNoticeDateEthiopian: ethiopianValue,
      };
    });
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement> | null,
    action: Exclude<SaveAction, null>,
  ) {
    if (event) event.preventDefault();
    setValidationAttempted(true);

    if (
      !selectedCategory ||
      !form.planName.trim() ||
      !form.periodFrom ||
      !form.periodTo ||
      dateOrderError
    ) {
      window.scrollTo({ behavior: "smooth", top: 0 });
      return;
    }

    onSavePlan({ ...form, category: selectedCategory }, action);
    setSaveAction(action);
  }

  const organizationRegions =
    project.availableOrganizationRegions ??
    (project.organizationRegion ? [project.organizationRegion] : []);

  return (
    <div className="w-full pb-8">
      <div className="space-y-4">
        <CreatePlanBreadcrumb detailHref={detailHref} project={project} />

        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Create Procurement Plan
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Configure and register a new procurement plan under{" "}
              <strong className="font-semibold text-slate-700">
                {project.name}
              </strong>
              .
            </p>
          </div>
        </div>

        {saveAction ? (
          <div
            aria-live="polite"
            className="flex items-start gap-2 rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900 shadow-sm"
            role="status"
          >
            <CheckCircle2
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0 text-[#176c55]"
            />
            <span>
              Plan draft saved successfully and added to this project&apos;s
              Procurement Plans.
            </span>
          </div>
        ) : null}
      </div>

      <form
        className="mt-5 space-y-6"
        onSubmit={(event) => handleSubmit(event, "activity")}
      >
        {/* Section 1: Inherited Project Information */}
        <section className="overflow-hidden rounded border border-slate-300 bg-white shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-200 bg-[#f8f8ff] px-5 py-3.5">
            <LockKeyhole
              aria-hidden="true"
              className="h-4 w-4 text-slate-500"
            />
            <h2 className="text-xs font-bold uppercase tracking-[0.06em] text-slate-700">
              Inherited Project Information
            </h2>
            <span className="ml-auto text-[10px] text-slate-400">
              Read-only from project setup
            </span>
          </div>
          <div className="p-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <LockedInput label="Project" value={project.name} />
              <LockedInput label="Project Code" value={project.code} />
              <LockedInput
                label="Country / Organisation"
                value={project.countryOrganisation}
              />
              <LockedInput
                label="Executing Agency"
                value={project.executingAgency}
              />
              <LockedInput
                label="Funding Source"
                value={project.fundingSource}
              />
              <LockedInput label="Funding Type" value={project.fundingType} />
              {project.financingNumbers?.length ? (
                <LockedInput
                  label="Loan / Credit / Grant Number(s)"
                  value={project.financingNumbers.join(", ")}
                />
              ) : null}
              <LockedInput
                label="Base / Reporting Currency"
                value={currencyLabel(project.baseCurrency)}
              />
              <LockedInput
                icon
                label="Responsible Officers"
                value={project.assignedOfficers.join(", ")}
              />
            </div>
          </div>
        </section>

        {/* Section 2: Plan Configuration & Scope */}
        <section className="overflow-hidden rounded border border-slate-300 bg-white shadow-xs">
          <div className="border-b border-slate-200 bg-[#edf5f1] px-5 py-3.5">
            <h2 className="text-xs font-bold uppercase tracking-[0.06em] text-slate-800">
              Plan Identification & Classification
            </h2>
          </div>
          <div className="p-5 space-y-5">
            {/* Category Dropdown */}
            <fieldset className="max-w-2xl">
              <legend
                className={`mb-2 text-xs font-semibold ${
                  categoryError ? "text-red-600" : "text-slate-700"
                }`}
              >
                Procurement Category <span className="text-red-600">*</span>
              </legend>
              <div className="relative">
                <select
                  aria-invalid={categoryError}
                  className={`h-11 w-full appearance-none rounded border px-3 pr-10 text-sm font-medium text-slate-800 outline-none transition focus:ring-2 ${
                    categoryError
                      ? "border-red-500 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-400 bg-white focus:border-[#176c55] focus:ring-[#176c55]/15"
                  }`}
                  onChange={(event) =>
                    handleCategoryChange(
                      event.target.value as ProcurementCategory,
                    )
                  }
                  value={selectedCategory ?? ""}
                >
                  <option disabled value="">
                    Select a procurement category
                  </option>
                  {procurementCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.value}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-500"
                />
              </div>
              {categoryError ? (
                <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-red-600">
                  <Info aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                  Select a procurement category.
                </p>
              ) : selectedCategory ? (
                <p className="mt-1.5 text-[11px] text-[#176c55]">
                  {
                    procurementCategories.find(
                      (c) => c.value === selectedCategory,
                    )?.description
                  }
                </p>
              ) : null}
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <CompactFormField
                  errorMessage={
                    nameError ? "Plan name is required." : undefined
                  }
                  htmlFor="plan-name"
                  label="Plan Name"
                  required
                >
                  <input
                    aria-invalid={nameError}
                    className={`${compactFieldClasses} ${
                      nameError
                        ? "border-red-500 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-100"
                        : ""
                    }`}
                    id="plan-name"
                    onChange={(event) =>
                      updateField("planName", event.target.value)
                    }
                    placeholder="Enter plan name or select a category above"
                    required
                    value={form.planName}
                  />
                </CompactFormField>
              </div>
              <CompactFormField
                htmlFor="budget-year"
                label="Ethiopian Fiscal Year (EFY)"
                required
              >
                <select
                  className={compactFieldClasses}
                  id="budget-year"
                  onChange={(event) =>
                    updateField("budgetYear", event.target.value)
                  }
                  required
                  value={form.budgetYear}
                >
                  <option value="2016">2016</option>
                  <option value="2017">2017</option>
                  <option value="2018">2018</option>
                  <option value="2019">2019</option>
                </select>
              </CompactFormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {organizationRegions.length > 1 ? (
                <CompactFormField
                  htmlFor="organization-region"
                  label="Organization / Region"
                  required
                >
                  <select
                    className={compactFieldClasses}
                    id="organization-region"
                    onChange={(event) =>
                      updateField("organizationRegion", event.target.value)
                    }
                    required
                    value={form.organizationRegion}
                  >
                    {organizationRegions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </CompactFormField>
              ) : organizationRegions.length === 1 ? (
                <LockedInput
                  label="Organization / Region"
                  value={organizationRegions[0]}
                />
              ) : null}
              <LockedInput
                label="Plan Status"
                value="Draft (system generated)"
              />
            </div>
          </div>
        </section>

        {/* Section 3: Plan Timeline & Notice Dates */}
        <section className="overflow-hidden rounded border border-slate-300 bg-white shadow-xs">
          <div className="border-b border-slate-200 bg-[#edf5f1] px-5 py-3.5">
            <h2 className="text-xs font-bold uppercase tracking-[0.06em] text-slate-800">
              Plan Timeline (Dual Calendar: Gregorian & Ethiopian)
            </h2>
          </div>
          <div className="p-5 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <DualCalendarField
                errorMessage={
                  periodFromError ? "Start date is required." : undefined
                }
                ethiopianValue={form.periodFromEthiopian}
                gregorianValue={form.periodFrom}
                id="period-from"
                label="Plan Period From"
                onChange={(gregorianValue, ethiopianValue) =>
                  updateDatePair("from", gregorianValue, ethiopianValue)
                }
              />
              <DualCalendarField
                errorMessage={
                  validationAttempted && !form.periodTo
                    ? "End date is required."
                    : dateOrderError
                      ? "End date cannot be earlier than start date."
                      : undefined
                }
                ethiopianValue={form.periodToEthiopian}
                gregorianValue={form.periodTo}
                id="period-to"
                label="Plan Period To"
                onChange={(gregorianValue, ethiopianValue) =>
                  updateDatePair("to", gregorianValue, ethiopianValue)
                }
              />
            </div>

            <div
              className={`grid gap-5 ${
                project.supportsGeneralProcurementNotice ? "sm:grid-cols-2" : ""
              }`}
            >
              {project.supportsGeneralProcurementNotice ? (
                <DualCalendarField
                  ethiopianValue={form.generalProcurementNoticeDateEthiopian}
                  gregorianValue={form.generalProcurementNoticeDate}
                  id="general-procurement-notice-date"
                  label="General Procurement Notice Date"
                  onChange={(gregorianValue, ethiopianValue) =>
                    updateDatePair("notice", gregorianValue, ethiopianValue)
                  }
                  required={false}
                />
              ) : null}
              <div className="min-w-0">
                <CompactFormField
                  htmlFor="remarks"
                  label="Description / Remarks"
                >
                  <textarea
                    className="min-h-24 w-full resize-y rounded-none border border-slate-400 bg-white px-3 py-2 text-xs leading-5 text-slate-800 outline-none focus:border-[#176c55] focus:ring-2 focus:ring-[#176c55]/15"
                    id="remarks"
                    onChange={(event) =>
                      updateField("remarks", event.target.value)
                    }
                    placeholder="Enter any context, notes, or specific procurement plan remarks..."
                    value={form.remarks}
                  />
                </CompactFormField>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Actions & Navigation Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-300 bg-white pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Link
            className="inline-flex h-9 items-center gap-2 px-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            href={detailHref}
          >
            <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
            Back to {project.shortName} Project
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <button
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-sm border border-slate-300 bg-white px-4 text-xs font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => handleSubmit(null, "draft")}
              type="button"
            >
              Save Draft
            </button>
            <button
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-sm border border-[#125442] bg-[#176c55] px-4 text-xs font-medium text-white hover:bg-[#125f4c]"
              onClick={() => handleSubmit(null, "activity")}
              type="button"
            >
              <Save aria-hidden="true" className="h-3.5 w-3.5" />
              Save & Add Procurement Activity
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function CreatePlanBreadcrumb({
  detailHref,
  project,
}: {
  detailHref: string;
  project: OfficerProject;
}) {
  return (
    <nav aria-label="Breadcrumb" className="text-[10px] text-slate-500">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link
            className="inline-flex items-center gap-1 hover:text-[#176c55]"
            href="/dashboard/officer"
          >
            <House aria-hidden="true" className="h-3 w-3" />
            Home
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link className="hover:text-[#176c55]" href="/workspace/projects">
            Projects
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link className="hover:text-[#176c55]" href={detailHref}>
            {project.shortName}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page" className="font-semibold text-slate-800">
          Create Plan
        </li>
      </ol>
    </nav>
  );
}

export function DualCalendarField({
  errorMessage,
  ethiopianValue,
  gregorianValue,
  id,
  label,
  onChange,
  required = true,
}: {
  errorMessage?: string;
  ethiopianValue: string;
  gregorianValue: string;
  id: string;
  label: string;
  onChange: (gregorianValue: string, ethiopianValue: string) => void;
  required?: boolean;
}) {
  const error = Boolean(errorMessage);

  function changeGregorian(value: string) {
    if (!value) {
      onChange("", "");
      return;
    }

    const converted = gregorianToEthiopian(value);
    onChange(value, converted ? formatEthiopianDate(converted) : "");
  }

  function changeEthiopian(value: EthiopianDate) {
    onChange(
      ethiopianToGregorian(value.year, value.month, value.day),
      formatEthiopianDate(value),
    );
  }

  return (
    <div>
      <label
        className={`mb-2 block text-[11px] font-medium ${
          error ? "text-red-600" : "text-slate-600"
        }`}
        htmlFor={`${id}-gregorian`}
      >
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </label>
      <div
        className={`flex items-end gap-2 border p-3 ${
          error ? "border-red-500 bg-red-50" : "border-slate-300 bg-[#f0f3ff]"
        }`}
      >
        <GregorianCalendarInput
          error={error}
          id={`${id}-gregorian`}
          onChange={changeGregorian}
          value={gregorianValue}
        />
        <ArrowRightLeft
          aria-hidden="true"
          className={`mb-2 h-4 w-4 ${error ? "text-red-400" : "text-slate-500"}`}
        />
        <EthiopianCalendarInput
          error={error}
          id={`${id}-ethiopian`}
          onSelect={changeEthiopian}
          value={ethiopianValue}
        />
      </div>
      {errorMessage ? (
        <p className="mt-2 flex items-center gap-1 text-[10px] text-red-600">
          <Info aria-hidden="true" className="h-3 w-3" />
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

function GregorianCalendarInput({
  error,
  id,
  onChange,
  value,
}: {
  error: boolean;
  id: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className="min-w-0 flex-1">
      <label
        className="mb-1 block text-[9px] font-bold uppercase tracking-[0.06em] text-slate-500"
        htmlFor={id}
      >
        Gregorian
      </label>
      <input
        aria-invalid={error}
        className={`h-9 w-full min-w-0 rounded-none border bg-white px-2 text-[10px] outline-none ${
          error
            ? "border-red-500 text-red-600 focus:ring-2 focus:ring-red-100"
            : "border-slate-400 text-slate-700 focus:border-[#176c55] focus:ring-2 focus:ring-[#176c55]/15"
        }`}
        id={id}
        onChange={(event) => onChange(event.target.value)}
        type="date"
        value={value}
      />
    </div>
  );
}

function EthiopianCalendarInput({
  error,
  id,
  onSelect,
  value,
}: {
  error: boolean;
  id: string;
  onSelect: (value: EthiopianDate) => void;
  value: string;
}) {
  const parsedValue = parseEthiopianDate(value);
  const today = gregorianToEthiopian(new Date().toISOString().slice(0, 10)) ?? {
    day: 1,
    month: 1,
    year: 2017,
  };
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(
    parsedValue?.month ?? today.month,
  );
  const [visibleYear, setVisibleYear] = useState(
    parsedValue?.year ?? today.year,
  );

  function toggleCalendar() {
    if (!open) {
      const current = parseEthiopianDate(value) ?? today;
      setVisibleMonth(current.month);
      setVisibleYear(current.year);
    }
    setOpen((current) => !current);
  }

  function moveMonth(offset: number) {
    const monthIndex = visibleMonth - 1 + offset;
    const yearOffset = Math.floor(monthIndex / 13);
    setVisibleYear((current) => current + yearOffset);
    setVisibleMonth((((monthIndex % 13) + 13) % 13) + 1);
  }

  const leadingDays = ethiopianWeekday(visibleYear, visibleMonth);
  const monthDays = daysInEthiopianMonth(visibleYear, visibleMonth);

  return (
    <div className="relative min-w-0 flex-1">
      <label
        className="mb-1 block text-[9px] font-bold uppercase tracking-[0.06em] text-slate-500"
        htmlFor={id}
      >
        Ethiopian
      </label>
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-none border bg-white px-2 text-left text-[10px] outline-none ${
          error
            ? "border-red-500 text-red-600 focus:ring-2 focus:ring-red-100"
            : "border-slate-400 text-slate-700 focus:border-[#176c55] focus:ring-2 focus:ring-[#176c55]/15"
        }`}
        id={id}
        onClick={toggleCalendar}
        type="button"
      >
        <span className={value ? "truncate" : "truncate text-slate-400"}>
          {value || "Select Ethiopian date"}
        </span>
        <CalendarDays aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
      </button>

      {open ? (
        <div
          aria-label="Ethiopian calendar"
          className="absolute top-full right-0 z-50 mt-1 w-64 rounded border border-slate-300 bg-white p-3 text-slate-700 shadow-xl"
          role="dialog"
        >
          <div className="flex items-center justify-between gap-2">
            <button
              aria-label="Previous Ethiopian month"
              className="flex h-7 w-7 items-center justify-center rounded hover:bg-slate-100"
              onClick={() => moveMonth(-1)}
              type="button"
            >
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            </button>
            <p className="text-xs font-bold">
              {ETHIOPIAN_MONTHS[visibleMonth - 1]} {visibleYear}
            </p>
            <button
              aria-label="Next Ethiopian month"
              className="flex h-7 w-7 items-center justify-center rounded hover:bg-slate-100"
              onClick={() => moveMonth(1)}
              type="button"
            >
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-2 grid grid-cols-7 text-center text-[9px] font-semibold text-slate-400">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <span className="py-1" key={day}>
                {day}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center text-[10px]">
            {Array.from({ length: leadingDays }, (_, index) => (
              <span aria-hidden="true" key={`empty-${index}`} />
            ))}
            {Array.from({ length: monthDays }, (_, index) => index + 1).map(
              (day) => {
                const selected =
                  parsedValue?.year === visibleYear &&
                  parsedValue.month === visibleMonth &&
                  parsedValue.day === day;

                return (
                  <button
                    aria-label={`${day} ${ETHIOPIAN_MONTHS[visibleMonth - 1]} ${visibleYear}`}
                    className={`flex h-7 items-center justify-center rounded ${
                      selected
                        ? "bg-[#176c55] font-bold text-white"
                        : "hover:bg-[#edf5f1] hover:text-[#176c55]"
                    }`}
                    key={day}
                    onClick={() => {
                      onSelect({ day, month: visibleMonth, year: visibleYear });
                      setOpen(false);
                    }}
                    type="button"
                  >
                    {day}
                  </button>
                );
              },
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LockedInput({
  icon = false,
  label,
  value,
}: {
  icon?: boolean;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-[10px] text-slate-500">{label}</p>
      <div className="relative">
        <input
          className={`h-9 w-full truncate rounded-none border border-slate-400 bg-white px-2 text-[10px] text-slate-500 outline-none ${
            icon ? "pl-7" : ""
          }`}
          readOnly
          title={value}
          value={value}
        />
        {icon ? (
          <LockKeyhole
            aria-hidden="true"
            className="absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
          />
        ) : null}
      </div>
    </div>
  );
}

function CompactFormField({
  children,
  errorMessage,
  htmlFor,
  label,
  required = false,
}: {
  children: ReactNode;
  errorMessage?: string;
  htmlFor: string;
  label: string;
  required?: boolean;
}) {
  const error = Boolean(errorMessage);

  return (
    <div>
      <label
        className={`mb-2 block text-[11px] font-medium ${
          error ? "text-red-600" : "text-slate-600"
        }`}
        htmlFor={htmlFor}
      >
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </label>
      {children}
      {errorMessage ? (
        <p className="mt-1.5 flex items-center gap-1 text-[10px] text-red-600">
          <Info aria-hidden="true" className="h-3 w-3 shrink-0" />
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

function currencyLabel(currency: string) {
  if (currency === "USD") return "USD ($)";
  if (currency === "ETB") return "ETB (Br)";
  return currency;
}

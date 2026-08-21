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
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileText,
  FolderOpen,
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

type WizardStep = 1 | 2 | 3;
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

const procurementCategories = [
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
  const [step, setStep] = useState<WizardStep>(1);
  const [selectedCategory, setSelectedCategory] =
    useState<ProcurementCategory | null>(null);
  const [planNameEdited, setPlanNameEdited] = useState(false);
  const [saveAction, setSaveAction] = useState<SaveAction>(null);
  const [dateValidationAttempted, setDateValidationAttempted] = useState(false);
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
  const selectedCategoryConfig = procurementCategories.find(
    (category) => category.value === selectedCategory,
  );

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

  function goToStep(nextStep: WizardStep) {
    setSaveAction(null);
    setStep(nextStep);
    window.scrollTo({ behavior: "smooth", top: 0 });
  }

  function continueToInformation() {
    if (selectedCategory) {
      if (!planNameEdited) {
        setForm((current) => ({
          ...current,
          planName: suggestedPlanName(
            project,
            selectedCategory,
            current.budgetYear,
          ),
        }));
      }
      setDateValidationAttempted(false);
      goToStep(2);
    }
  }

  function continueToReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDateValidationAttempted(true);

    if (!form.periodFrom || !form.periodTo || dateOrderError) return;
    goToStep(3);
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

  function captureDraft(action: Exclude<SaveAction, null>) {
    if (!selectedCategory) return;

    onSavePlan({ ...form, category: selectedCategory }, action);
    setSaveAction(action);
    window.scrollTo({ behavior: "smooth", top: 0 });
  }

  return (
    <div className="w-full pb-4">
      {step === 1 ? (
        <CategoryStep
          detailHref={detailHref}
          onContinue={continueToInformation}
          onSelect={(category) => {
            setSaveAction(null);
            setSelectedCategory(category);
            if (!planNameEdited) {
              setForm((current) => ({
                ...current,
                planName: suggestedPlanName(
                  project,
                  category,
                  current.budgetYear,
                ),
              }));
            }
          }}
          project={project}
          selectedCategory={selectedCategory}
        />
      ) : null}

      {step === 2 ? (
        <PlanInformationStep
          dateOrderError={dateOrderError}
          dateValidationAttempted={dateValidationAttempted}
          form={form}
          onBack={() => goToStep(1)}
          onContinue={continueToReview}
          onDateChange={updateDatePair}
          onUpdate={updateField}
          project={project}
        />
      ) : null}

      {step === 3 && selectedCategory && selectedCategoryConfig ? (
        <ReviewStep
          category={selectedCategory}
          categoryIcon={selectedCategoryConfig.icon}
          form={form}
          onBack={() => goToStep(2)}
          onSave={captureDraft}
          project={project}
          saveAction={saveAction}
        />
      ) : null}
    </div>
  );
}

function CategoryStep({
  detailHref,
  onContinue,
  onSelect,
  project,
  selectedCategory,
}: {
  detailHref: string;
  onContinue: () => void;
  onSelect: (category: ProcurementCategory) => void;
  project: OfficerProject;
  selectedCategory: ProcurementCategory | null;
}) {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      <div className="space-y-5">
        <CreatePlanBreadcrumb detailHref={detailHref} project={project} />

        <WizardTitle step={1} />
        <CompactProgress currentStep={1} />

        <section className="flex items-center gap-3 rounded border border-slate-300 bg-[#f0f3ff] px-4 py-3">
          <LockKeyhole
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-slate-500"
          />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
              Assigned Project
            </p>
            <p className="mt-0.5 truncate text-xs font-bold text-slate-900">
              {project.name} <span>(# {project.code})</span>
            </p>
          </div>
        </section>

        <fieldset className="max-w-2xl">
          <legend className="mb-2 text-xs font-semibold text-slate-700">
            Procurement Category
          </legend>
          <div className="relative">
            <select
              className="h-11 w-full appearance-none rounded border border-slate-400 bg-white px-3 pr-10 text-sm font-medium text-slate-800 outline-none transition focus:border-[#176c55] focus:ring-2 focus:ring-[#176c55]/15"
              onChange={(event) =>
                onSelect(event.target.value as ProcurementCategory)
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
        </fieldset>
      </div>

      <WizardFooter className="mt-auto pt-8">
        <Link
          className="inline-flex h-9 items-center gap-2 px-2 text-xs font-medium text-slate-600 hover:text-slate-900"
          href={detailHref}
        >
          <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
          Back to {project.shortName} Project
        </Link>
        <PrimaryButton disabled={!selectedCategory} onClick={onContinue}>
          Continue
        </PrimaryButton>
      </WizardFooter>
    </div>
  );
}

function PlanInformationStep({
  dateOrderError,
  dateValidationAttempted,
  form,
  onBack,
  onContinue,
  onDateChange,
  onUpdate,
  project,
}: {
  dateOrderError: boolean;
  dateValidationAttempted: boolean;
  form: PlanFormState;
  onBack: () => void;
  onContinue: (event: FormEvent<HTMLFormElement>) => void;
  onDateChange: (
    period: "from" | "notice" | "to",
    gregorianValue: string,
    ethiopianValue: string,
  ) => void;
  onUpdate: (field: keyof PlanFormState, value: string) => void;
  project: OfficerProject;
}) {
  const organizationRegions =
    project.availableOrganizationRegions ??
    (project.organizationRegion ? [project.organizationRegion] : []);

  return (
    <form
      className="flex min-h-[calc(100vh-8rem)] flex-col"
      onSubmit={onContinue}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <WizardTitle step={2} />
        <CompactProgress currentStep={2} />
      </div>

      <section className="mt-5 max-w-5xl overflow-visible rounded border border-slate-300 bg-white">
        <div className="rounded-t bg-[#f8f8ff] p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <LockKeyhole
              aria-hidden="true"
              className="h-4 w-4 text-slate-500"
            />
            Inherited Project Information
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            <LockedInput label="Funding Source" value={project.fundingSource} />
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

        <div className="rounded-b border-t border-slate-300 p-5">
          <h2 className="text-sm font-bold text-slate-800">Plan Details</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <CompactFormField htmlFor="plan-name" label="Plan Name" required>
                <input
                  className={compactFieldClasses}
                  id="plan-name"
                  onChange={(event) => onUpdate("planName", event.target.value)}
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
                onChange={(event) => onUpdate("budgetYear", event.target.value)}
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

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
                    onUpdate("organizationRegion", event.target.value)
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
            <LockedInput label="Plan Status" value="Draft (system generated)" />
          </div>

          <div className="my-5 border-t border-slate-200" />

          <div className="grid gap-5 sm:grid-cols-2">
            <DualCalendarField
              ethiopianValue={form.periodFromEthiopian}
              errorMessage={
                dateValidationAttempted && !form.periodFrom
                  ? "Start date is required."
                  : undefined
              }
              gregorianValue={form.periodFrom}
              id="period-from"
              label="Plan Period From"
              onChange={(gregorianValue, ethiopianValue) =>
                onDateChange("from", gregorianValue, ethiopianValue)
              }
            />
            <DualCalendarField
              ethiopianValue={form.periodToEthiopian}
              errorMessage={
                dateValidationAttempted && !form.periodTo
                  ? "End date is required."
                  : dateValidationAttempted && dateOrderError
                    ? "End date cannot be earlier than start date."
                    : undefined
              }
              gregorianValue={form.periodTo}
              id="period-to"
              label="Plan Period To"
              onChange={(gregorianValue, ethiopianValue) =>
                onDateChange("to", gregorianValue, ethiopianValue)
              }
            />
          </div>

          <div className="my-5 border-t border-slate-200" />

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
                  onDateChange("notice", gregorianValue, ethiopianValue)
                }
                required={false}
              />
            ) : null}
            <div>
              <CompactFormField htmlFor="remarks" label="Description / Remarks">
                <textarea
                  className="min-h-24 w-full resize-y rounded-none border border-slate-400 bg-white px-3 py-2 text-xs leading-5 text-slate-800 outline-none focus:border-[#176c55] focus:ring-2 focus:ring-[#176c55]/15"
                  id="remarks"
                  onChange={(event) => onUpdate("remarks", event.target.value)}
                  value={form.remarks}
                />
              </CompactFormField>
            </div>
          </div>
        </div>
      </section>

      <WizardFooter className="mt-auto pt-6">
        <SecondaryButton onClick={onBack}>
          <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
          Back
        </SecondaryButton>
        <PrimaryButton type="submit">
          Continue
          <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
        </PrimaryButton>
      </WizardFooter>
    </form>
  );
}

function ReviewStep({
  category,
  categoryIcon: CategoryIcon,
  form,
  onBack,
  onSave,
  project,
  saveAction,
}: {
  category: ProcurementCategory;
  categoryIcon: typeof ShoppingCart;
  form: PlanFormState;
  onBack: () => void;
  onSave: (action: Exclude<SaveAction, null>) => void;
  project: OfficerProject;
  saveAction: SaveAction;
}) {
  return (
    <div className="flex min-h-[calc(100vh-7rem)] max-w-[72rem] flex-col">
      <WizardTitle step={3} />
      <ReviewProgress />

      {saveAction ? (
        <div
          aria-live="polite"
          className="mt-4 flex items-start gap-2 rounded-sm border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] text-emerald-900"
          role="status"
        >
          <CheckCircle2
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-[#176c55]"
          />
          Draft saved and added to this project&apos;s Procurement Plans.
        </div>
      ) : null}

      <div className="mt-5 grid items-start gap-4 sm:grid-cols-[minmax(0,2.15fr)_minmax(12rem,0.95fr)]">
        <div className="space-y-4">
          <ReviewCard
            icon={FolderOpen}
            locked
            title="Inherited Project Information"
          >
            <div className="grid gap-x-7 gap-y-2 sm:grid-cols-2">
              <ReviewItem label="Project Name" value={project.name} />
              <ReviewItem label="Project Code" value={project.code} />
              <ReviewItem
                label="Funding Source"
                value={project.fundingSource}
              />
              <ReviewItem
                label="Base / Reporting Currency"
                value={currencyLabel(project.baseCurrency)}
              />
              {project.financingNumbers?.length ? (
                <ReviewItem
                  className="sm:col-span-2"
                  label="Loan / Credit / Grant Number(s)"
                  value={project.financingNumbers.join(", ")}
                />
              ) : null}
            </div>
          </ReviewCard>

          <ReviewCard icon={ClipboardCheck} title="Plan Identification">
            <div className="grid gap-x-7 gap-y-2 sm:grid-cols-2">
              <ReviewItem
                className="sm:col-span-2"
                label="Plan Name"
                value={form.planName}
              />
              <ReviewItem
                label="Ethiopian Fiscal Year"
                value={form.budgetYear}
              />
              <ReviewItem label="Plan Status" value="Draft" />
              {form.organizationRegion ? (
                <ReviewItem
                  className="sm:col-span-2"
                  label="Organization / Region"
                  value={form.organizationRegion}
                />
              ) : null}
              <ReviewItem
                className="sm:col-span-2"
                label="Date Period (GC)"
                value={`${formatDate(form.periodFrom)} to ${formatDate(
                  form.periodTo,
                )}`}
              />
              <ReviewItem
                className="sm:col-span-2"
                label="Date Period (EC)"
                value={`${form.periodFromEthiopian} to ${form.periodToEthiopian}`}
              />
              {form.generalProcurementNoticeDate ? (
                <>
                  <ReviewItem
                    label="GPN Date (GC)"
                    value={formatDate(form.generalProcurementNoticeDate)}
                  />
                  <ReviewItem
                    label="GPN Date (EC)"
                    value={form.generalProcurementNoticeDateEthiopian}
                  />
                </>
              ) : null}
            </div>
          </ReviewCard>

          <div className="grid gap-4 sm:grid-cols-2">
            <ReviewCard icon={CategoryIcon} title="Category Selection">
              <p className="text-[9px] text-slate-500">Selected Category</p>
              <span className="mt-2 inline-flex items-center gap-1.5 border border-slate-300 bg-[#f7f9ff] px-2.5 py-1.5 text-[10px] font-semibold text-slate-700">
                <CategoryIcon
                  aria-hidden="true"
                  className="h-3.5 w-3.5 text-[#176c55]"
                />
                {category}
              </span>
            </ReviewCard>

            <ReviewCard icon={FileText} title="Remarks">
              <p className="text-[10px] leading-4 text-slate-700">
                &ldquo;{form.remarks.trim() || "No remarks were provided."}
                &rdquo;
              </p>
            </ReviewCard>
          </div>
        </div>

        <aside className="rounded-sm border border-slate-300 bg-[#fbfbff] p-3">
          <h2 className="flex items-center gap-2 text-[10px] font-bold text-slate-800">
            <ClipboardCheck
              aria-hidden="true"
              className="h-3.5 w-3.5 text-[#176c55]"
            />
            Plan Header Requirements
          </h2>
          <ul className="mt-2.5 space-y-2.5 border-b border-slate-300 pb-2.5 text-[10px] text-slate-700">
            {[
              "Plan identification complete",
              "Project context locked",
              "Fiscal period valid",
              "Category selected",
              ...(form.organizationRegion
                ? ["Organization scope confirmed"]
                : []),
            ].map((requirement) => (
              <li className="flex items-center gap-2" key={requirement}>
                <CheckCircle2
                  aria-hidden="true"
                  className="h-3 w-3 shrink-0 fill-[#176c55] text-white"
                />
                {requirement}
              </li>
            ))}
          </ul>
          <p className="mt-2.5 flex items-center gap-2 bg-[#e2efec] px-2.5 py-1 text-[9px] font-medium text-[#176c55]">
            <Info aria-hidden="true" className="h-3 w-3" />
            Ready to save as draft.
          </p>
        </aside>
      </div>

      <div aria-hidden="true" className="min-h-6 flex-1" />
      <div className="-mx-4 border-t border-slate-300 bg-white px-4 pt-3 sm:-mx-6 sm:px-6">
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-sm border border-slate-300 bg-white px-3 text-[10px] font-medium text-slate-700 hover:bg-slate-50"
            onClick={onBack}
            type="button"
          >
            <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
            Back
          </button>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              className="inline-flex h-8 items-center justify-center rounded-sm border border-slate-300 bg-white px-3 text-[10px] font-medium text-slate-800 hover:bg-slate-50"
              onClick={() => onSave("draft")}
              type="button"
            >
              Save Draft
            </button>
            <button
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-sm border border-[#125442] bg-[#176c55] px-3 text-[10px] font-medium text-white hover:bg-[#125f4c]"
              onClick={() => onSave("activity")}
              type="button"
            >
              <Save aria-hidden="true" className="h-3 w-3" />
              Save and Add Procurement Activity
            </button>
          </div>
        </div>
      </div>
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

function WizardTitle({ step }: { step: WizardStep }) {
  const descriptions = {
    1: "Step 1: Select the procurement category for this plan",
    2: "Step 2: Enter the detailed information for this procurement plan.",
    3: "Step 3: Review the plan details before saving.",
  } as const;

  return (
    <div>
      <h1
        className={`${
          step === 3 ? "text-base" : "text-xl"
        } font-bold tracking-tight text-slate-900`}
      >
        Create Procurement Plan
      </h1>
      <p
        className={`mt-1 ${
          step === 3 ? "text-[9px]" : "text-[11px]"
        } text-slate-500`}
      >
        {descriptions[step]}
      </p>
    </div>
  );
}

function CompactProgress({ currentStep }: { currentStep: 1 | 2 }) {
  const steps = [
    { label: "Category", number: 1 },
    { label: "Plan Information", number: 2 },
    { label: "Review & Save", number: 3 },
  ];

  return (
    <ol
      aria-label="Plan creation progress"
      className="flex w-full max-w-xl items-center text-[10px]"
    >
      {steps.map((item, index) => {
        const complete = currentStep > item.number;
        const current = currentStep === item.number;
        const firstStepPill = currentStep === 1 && current;

        return (
          <li className="flex min-w-0 items-center" key={item.number}>
            <div
              aria-current={current ? "step" : undefined}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap ${
                firstStepPill
                  ? "rounded-lg border border-[#176c55] bg-white px-3 py-2 font-semibold text-[#07523f]"
                  : current || complete
                    ? "font-semibold text-[#176c55]"
                    : "text-slate-500"
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full border text-[8px] ${
                  complete || current
                    ? "border-[#176c55] bg-[#176c55] text-white"
                    : "border-slate-400 bg-white text-slate-500"
                }`}
              >
                {complete ? <Check className="h-2.5 w-2.5" /> : item.number}
              </span>
              {item.label}
            </div>
            {index < steps.length - 1 ? (
              <span
                aria-hidden="true"
                className={`mx-3 h-px w-8 shrink-0 ${
                  complete ? "bg-[#176c55]" : "bg-slate-300"
                }`}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function ReviewProgress() {
  const steps = ["Category", "Plan Information", "Review & Save"];

  return (
    <div className="relative mt-4 w-full max-w-[33rem]">
      <div className="absolute top-3 right-[16.6%] left-[16.6%] h-px bg-[#176c55]" />
      <ol className="relative flex">
        {steps.map((label, index) => {
          const current = index === 2;
          return (
            <li
              className="flex min-w-0 flex-1 flex-col items-center"
              key={label}
            >
              <span
                className={`z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-bold ${
                  current
                    ? "border-[#176c55] bg-white text-[#176c55]"
                    : "border-[#176c55] bg-[#176c55] text-white"
                }`}
              >
                {current ? (
                  3
                ) : (
                  <Check aria-hidden="true" className="h-3.5 w-3.5" />
                )}
              </span>
              <span
                className={`mt-2 text-[9px] ${
                  current ? "font-bold text-[#176c55]" : "text-slate-800"
                }`}
              >
                {index + 1}. {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
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
  htmlFor,
  label,
  required = false,
}: {
  children: ReactNode;
  htmlFor: string;
  label: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        className="mb-2 block text-[11px] font-medium text-slate-600"
        htmlFor={htmlFor}
      >
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </label>
      {children}
    </div>
  );
}

function ReviewCard({
  children,
  icon: Icon,
  locked = false,
  title,
}: {
  children: ReactNode;
  icon: typeof FolderOpen;
  locked?: boolean;
  title: string;
}) {
  return (
    <section className="relative rounded-sm border border-slate-300 bg-white p-3">
      <h2 className="flex items-center gap-1.5 border-b border-[#b8c9c2] pb-2 text-[11px] font-bold text-slate-800">
        <Icon aria-hidden="true" className="h-3.5 w-3.5 text-slate-500" />
        {title}
      </h2>
      {locked ? (
        <LockKeyhole
          aria-hidden="true"
          className="absolute top-3 right-3 h-3 w-3 text-slate-500"
        />
      ) : null}
      <div className="pt-2.5">{children}</div>
    </section>
  );
}

function ReviewItem({
  className = "",
  label,
  value,
}: {
  className?: string;
  label: string;
  value: string;
}) {
  return (
    <div className={className}>
      <p className="text-[9px] text-slate-500">{label}</p>
      <p className="mt-1 text-[10px] font-medium leading-[1.3] text-slate-800">
        {value}
      </p>
    </div>
  );
}

function WizardFooter({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex flex-col-reverse gap-3 border-t border-slate-300 bg-white pt-4 sm:flex-row sm:items-center sm:justify-between">
        {children}
      </div>
    </div>
  );
}

function PrimaryButton({
  children,
  disabled = false,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      className="inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-[#125442] bg-[#176c55] px-4 text-xs font-medium text-white hover:bg-[#125f4c] disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className="inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-slate-300 bg-white px-4 text-xs font-medium text-slate-700 hover:bg-slate-50"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function currencyLabel(currency: string) {
  if (currency === "USD") return "USD ($)";
  if (currency === "ETB") return "ETB (Br)";
  return currency;
}

function formatDate(value: string) {
  if (!value) return "Not provided";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

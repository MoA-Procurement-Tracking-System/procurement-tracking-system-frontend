"use client";

import { StatusText } from "../../../components/dashboard/StatusText";
import type {
  OfficerProject,
  ProcurementCategory,
  ProcurementPlanSummary,
} from "@/features/projects/data/officerProjects";
import type {
  ProcurementActivityStatus,
  ProcurementActivitySummary,
} from "@/features/projects/data/officerActivityDrafts";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  House,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

type ActivityStatus = ProcurementActivityStatus;

type PlanActivity = ProcurementActivitySummary;

interface ActivityTemplate {
  amount: number;
  description: string;
  method: string;
  stage: string;
}

const activityTemplates: Record<
  ProcurementCategory,
  readonly ActivityTemplate[]
> = {
  "Consultancy Services": [
    {
      amount: 3_200_000,
      description: "Consultancy for Soil Quality Assessment",
      method: "QCBS",
      stage: "Final Report",
    },
    {
      amount: 2_850_000,
      description: "Feasibility Study for Market Linkage Hubs",
      method: "CQS",
      stage: "Shortlisting",
    },
    {
      amount: 1_950_000,
      description: "Environmental and Social Compliance Audit",
      method: "LCS",
      stage: "Proposal Evaluation",
    },
  ],
  Goods: [
    {
      amount: 45_000_000,
      description: "Procurement of Veterinary Vaccines for Zone 3",
      method: "RFB",
      stage: "Bid Opening",
    },
    {
      amount: 85_000_000,
      description: "Supply of Tractors and Attachments",
      method: "RFB",
      stage: "Bid Evaluation",
    },
    {
      amount: 6_400_000,
      description: "Supply of Livestock Monitoring Equipment",
      method: "RFQ",
      stage: "Purchase Order",
    },
    {
      amount: 22_300_000,
      description: "Supply of Improved Forage Seed",
      method: "RFB",
      stage: "Bid Preparation",
    },
  ],
  "Non-Consulting Services": [
    {
      amount: 4_600_000,
      description: "Fleet Maintenance and Support Services",
      method: "RFB",
      stage: "Contract Execution",
    },
    {
      amount: 2_400_000,
      description: "Security Services for Regional Project Offices",
      method: "RFB",
      stage: "Bid Evaluation",
    },
    {
      amount: 1_850_000,
      description: "Transport and Logistics Support Services",
      method: "RFQ",
      stage: "Purchase Order",
    },
  ],
  Works: [
    {
      amount: 120_500_000,
      description: "Construction of Irrigation Canal Extension",
      method: "RFB",
      stage: "Contract Signing",
    },
    {
      amount: 18_750_000,
      description: "Construction of Regional Storage Facilities",
      method: "RFB",
      stage: "Technical Evaluation",
    },
    {
      amount: 38_900_000,
      description: "Rehabilitation of Community Water Points",
      method: "RFB",
      stage: "Site Handover",
    },
    {
      amount: 54_200_000,
      description: "Construction of a Regional Veterinary Laboratory",
      method: "RFB",
      stage: "Contract Award",
    },
  ],
};

export function OfficerProcurementPlanDetailView({
  plan,
  project,
  savedActivities = [],
}: {
  plan: ProcurementPlanSummary;
  project: OfficerProject;
  savedActivities?: readonly ProcurementActivitySummary[];
}) {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [methodFilter, setMethodFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | ActivityStatus>(
    "All",
  );
  const searchInputRef = useRef<HTMLInputElement>(null);
  const activities = useMemo(
    () => getPlanActivities(project, plan, savedActivities),
    [plan, project, savedActivities],
  );
  const categoryOptions = useMemo(
    () =>
      Array.from(new Set(activities.map((activity) => activity.category))).sort(
        (left, right) => left.localeCompare(right),
      ),
    [activities],
  );
  const methodOptions = useMemo(
    () =>
      Array.from(new Set(activities.map((activity) => activity.method))).sort(
        (left, right) => left.localeCompare(right),
      ),
    [activities],
  );
  const filteredActivities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return activities.filter((activity) => {
      const matchesCategory =
        categoryFilter === "All" || activity.category === categoryFilter;
      const matchesMethod =
        methodFilter === "All" || activity.method === methodFilter;
      const matchesStatus =
        statusFilter === "All" || activity.status === statusFilter;
      const matchesSearch =
        query.length === 0 ||
        [
          activity.reference,
          activity.description,
          activity.category,
          activity.method,
          activity.currentStage,
          activity.status,
        ].some((value) => value.toLowerCase().includes(query));

      return matchesCategory && matchesMethod && matchesStatus && matchesSearch;
    });
  }, [activities, categoryFilter, methodFilter, searchQuery, statusFilter]);

  const pageSize = 4;
  const pageCount = Math.max(
    1,
    Math.ceil(filteredActivities.length / pageSize),
  );
  const safePage = Math.min(currentPage, pageCount);
  const firstResult = filteredActivities.length
    ? (safePage - 1) * pageSize + 1
    : 0;
  const lastResult = Math.min(safePage * pageSize, filteredActivities.length);
  const visibleActivities = filteredActivities.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const projectHref = `/workspace/projects?project=${encodeURIComponent(
    project.code,
  )}`;

  function exportActivities() {
    const headings = [
      "Reference",
      "Description",
      "Category",
      "Method",
      "Estimated Amount",
      "Current Stage",
      "Status",
    ];
    const rows = filteredActivities.map((activity) => [
      activity.reference,
      activity.description,
      activity.category,
      activity.method,
      activity.estimatedAmount,
      activity.currentStage,
      activity.status,
    ]);
    const csv = [headings, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${plan.reference}-activities.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-w-0 space-y-5 pb-6">
      <header>
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                className="inline-flex items-center gap-1 hover:text-[#176c55]"
                href="/dashboard/officer"
              >
                <House aria-hidden="true" className="h-3.5 w-3.5" />
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-slate-300">
              /
            </li>
            <li>
              <Link className="hover:text-[#176c55]" href="/workspace/projects">
                Assigned Projects
              </Link>
            </li>
            <li aria-hidden="true" className="text-slate-300">
              /
            </li>
            <li>
              <Link className="hover:text-[#176c55]" href={projectHref}>
                {project.shortName}
              </Link>
            </li>
            <li aria-hidden="true" className="text-slate-300">
              /
            </li>
            <li aria-current="page" className="font-semibold text-slate-900">
              {plan.name}
            </li>
          </ol>
        </nav>

        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#10243f]">
              {plan.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-500">
              <span>
                Reference:{" "}
                <strong className="font-semibold text-[#1261a8]">
                  {plan.reference}
                </strong>
              </span>
              <span aria-hidden="true" className="text-slate-300">
                •
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays aria-hidden="true" className="h-3 w-3" />
                {plan.budgetYear}
              </span>
              <span aria-hidden="true" className="text-slate-300">
                •
              </span>
              <StatusText className="text-[10px]" label={plan.status} />
              <span aria-hidden="true" className="text-slate-300">
                •
              </span>
              <span>{activities.length} Activities</span>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176c55]"
              onClick={exportActivities}
              type="button"
            >
              <Download aria-hidden="true" className="h-3.5 w-3.5" />
              Export
            </button>
            <Link
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#125442] bg-[#176c55] px-4 text-xs font-bold text-white hover:bg-[#125f4c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176c55]"
              href={
                "/workspace/projects?project=" +
                encodeURIComponent(project.code) +
                "&plan=" +
                encodeURIComponent(plan.reference) +
                "&mode=create-activity"
              }
            >
              <Plus aria-hidden="true" className="h-3.5 w-3.5" />
              New Activity
            </Link>
          </div>
        </div>
      </header>

      <section
        aria-labelledby="activities-title"
        className="overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm"
        id="procurement-activities"
      >
        <h2 className="sr-only" id="activities-title">
          Procurement Activities
        </h2>
        <div className="flex flex-col gap-3 border-b border-slate-200 p-3 md:flex-row md:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap">
            <label className="block w-full sm:max-w-xs sm:flex-1">
              <span className="sr-only">Search procurement activities</span>
              <span
                className="flex h-9 cursor-text items-center gap-2 rounded-md border border-slate-300 bg-[#fbfcff] px-3 focus-within:border-[#348267] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#348267]/15"
                onClick={() => searchInputRef.current?.focus()}
              >
                <Search
                  aria-hidden="true"
                  className="h-3.5 w-3.5 shrink-0 text-slate-500"
                />
                <input
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 text-xs text-slate-800 outline-none placeholder:text-slate-400"
                  id="activity-search"
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search activities..."
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                />
              </span>
            </label>

            <label className="relative block min-w-0">
              <span className="sr-only">Filter activities by category</span>
              <select
                className="h-9 w-full appearance-none rounded-md border border-slate-300 bg-white py-0 pr-9 pl-3 text-xs font-medium text-slate-700 outline-none hover:border-slate-400 focus:border-[#176c55] focus:ring-2 focus:ring-[#176c55]/15 sm:w-auto sm:min-w-36"
                onChange={(event) => {
                  setCategoryFilter(event.target.value);
                  setCurrentPage(1);
                }}
                value={categoryFilter}
              >
                <option value="All">All Categories</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
              />
            </label>

            <label className="relative block min-w-0">
              <span className="sr-only">Filter activities by method</span>
              <select
                className="h-9 w-full appearance-none rounded-md border border-slate-300 bg-white py-0 pr-9 pl-3 text-xs font-medium text-slate-700 outline-none hover:border-slate-400 focus:border-[#176c55] focus:ring-2 focus:ring-[#176c55]/15 sm:w-auto sm:min-w-36"
                onChange={(event) => {
                  setMethodFilter(event.target.value);
                  setCurrentPage(1);
                }}
                value={methodFilter}
              >
                <option value="All">All Methods</option>
                {methodOptions.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
              />
            </label>

            <label className="relative block min-w-0">
              <span className="sr-only">Filter activities by status</span>
              <select
                className="h-9 w-full appearance-none rounded-md border border-slate-300 bg-white py-0 pr-9 pl-3 text-xs font-medium text-slate-700 outline-none hover:border-slate-400 focus:border-[#176c55] focus:ring-2 focus:ring-[#176c55]/15 sm:w-auto sm:min-w-32"
                onChange={(event) => {
                  setStatusFilter(event.target.value as "All" | ActivityStatus);
                  setCurrentPage(1);
                }}
                value={statusFilter}
              >
                <option value="All">All Statuses</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Delayed">Delayed</option>
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
              />
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] table-fixed border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-[#fbfcfd] text-[9px] font-extrabold uppercase tracking-[0.04em] text-slate-500">
                <th className="w-[13%] px-3 py-3" scope="col">
                  Ref
                </th>
                <th className="w-[25%] px-3 py-3" scope="col">
                  Description
                </th>
                <th className="w-[10%] px-3 py-3" scope="col">
                  Category
                </th>
                <th className="w-[8%] px-3 py-3" scope="col">
                  Method
                </th>
                <th className="w-[13%] px-3 py-3 text-right" scope="col">
                  Est. Amount ({plan.currency})
                </th>
                <th className="w-[14%] px-3 py-3" scope="col">
                  Current Stage
                </th>
                <th className="w-[11%] px-3 py-3" scope="col">
                  Status
                </th>
                <th className="w-[6%] px-3 py-3 text-right" scope="col">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {visibleActivities.length ? (
                visibleActivities.map((activity) => (
                  <ActivityRow
                    activity={activity}
                    href={
                      "/workspace/projects?project=" +
                      encodeURIComponent(project.code) +
                      "&plan=" +
                      encodeURIComponent(plan.reference) +
                      "&activity=" +
                      encodeURIComponent(activity.reference)
                    }
                    key={activity.reference}
                  />
                ))
              ) : (
                <tr>
                  <td
                    className="px-4 py-10 text-center text-xs text-slate-500"
                    colSpan={8}
                  >
                    No procurement activities match the current search and
                    filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-col gap-3 border-t border-slate-200 bg-[#fbfcfd] px-4 py-3 text-[10px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p aria-live="polite">
            Showing {firstResult} to {lastResult} of {filteredActivities.length}{" "}
            results
          </p>
          <div aria-label="Activity pagination" className="flex items-center">
            <PaginationButton
              ariaLabel="Previous activity page"
              disabled={safePage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              <ChevronLeft aria-hidden="true" className="h-3.5 w-3.5" />
            </PaginationButton>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (page) => (
                <PaginationButton
                  active={safePage === page}
                  ariaLabel={`Activity page ${page}`}
                  key={page}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </PaginationButton>
              ),
            )}
            <PaginationButton
              ariaLabel="Next activity page"
              disabled={safePage === pageCount}
              onClick={() =>
                setCurrentPage((page) => Math.min(pageCount, page + 1))
              }
            >
              <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
            </PaginationButton>
          </div>
        </footer>
      </section>
    </div>
  );
}

function ActivityRow({
  activity,
  href,
}: {
  activity: PlanActivity;
  href: string;
}) {
  return (
    <tr className="even:bg-[#fbfcff] hover:bg-[#f7fbf9]">
      <td className="px-3 py-2.5 align-top font-mono text-[10px] font-semibold text-[#1261a8]">
        {activity.reference}
      </td>
      <td className="px-3 py-2.5 align-top text-[10px] font-medium leading-4 text-slate-700">
        {activity.description}
      </td>
      <td className="px-3 py-2.5 align-top text-[10px] text-slate-500">
        {activity.category}
      </td>
      <td className="px-3 py-2.5 align-top text-[10px] font-medium text-slate-500">
        {activity.method}
      </td>
      <td className="px-3 py-2.5 text-right align-top font-mono text-[10px] font-medium tabular-nums text-slate-800">
        {formatAmount(activity.estimatedAmount)}
      </td>
      <td className="px-3 py-2.5 align-top text-[10px] text-slate-500">
        {activity.currentStage}
      </td>
      <td className="px-3 py-2.5 align-top">
        <StatusText className="text-[9px]" label={activity.status} />
      </td>
      <td className="px-3 py-2.5 text-right align-top">
        <Link
          aria-label={`Open activity ${activity.reference}`}
          className="text-[10px] font-semibold text-[#1261a8] hover:text-[#07523f] hover:underline"
          href={href}
        >
          Open
        </Link>
      </td>
    </tr>
  );
}

function PaginationButton({
  active = false,
  ariaLabel,
  children,
  disabled = false,
  onClick,
}: {
  active?: boolean;
  ariaLabel: string;
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className={`flex h-7 min-w-7 items-center justify-center border-y border-r border-slate-300 px-2 text-[10px] first:rounded-l first:border-l last:rounded-r ${
        active
          ? "border-[#176c55] bg-[#176c55] font-bold text-white"
          : "bg-white text-slate-600 hover:bg-slate-50 disabled:text-slate-300"
      }`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export function getPlanActivities(
  project: OfficerProject,
  plan: ProcurementPlanSummary,
  savedActivities: readonly ProcurementActivitySummary[] = [],
) {
  const generated = createPlanActivities(project, plan);
  const normalizedSaved = savedActivities.map((savedActivity) => ({
    ...savedActivity,
    category: plan.category,
  }));
  const savedByReference = new Map(
    normalizedSaved.map((savedActivity) => [
      savedActivity.reference,
      savedActivity,
    ]),
  );
  const generatedReferences = new Set(
    generated.map((activity) => activity.reference),
  );

  return [
    ...generated.map(
      (activity) => savedByReference.get(activity.reference) ?? activity,
    ),
    ...Array.from(savedByReference.values()).filter(
      (savedActivity) => !generatedReferences.has(savedActivity.reference),
    ),
  ];
}

function createPlanActivities(
  project: OfficerProject,
  plan: ProcurementPlanSummary,
): PlanActivity[] {
  const activityProjectCode =
    project.shortName === "DRIVE" ? "DRV" : project.shortName;
  const remaining: Record<ActivityStatus, number> = {
    Completed: plan.completedActivities,
    Delayed: plan.delayedActivities,
    "In Progress": plan.inProgressActivities,
    "Not Started": 0,
  };
  const preferredStatuses: ActivityStatus[] = [
    "In Progress",
    "Delayed",
    "Completed",
    "In Progress",
  ];
  const statuses: ActivityStatus[] = [];
  const templates = activityTemplates[plan.category];

  for (const preferred of preferredStatuses) {
    if (statuses.length >= plan.activities) break;
    if (remaining[preferred] > 0) {
      statuses.push(preferred);
      remaining[preferred] -= 1;
    }
  }

  for (const status of ["Completed", "In Progress", "Delayed"] as const) {
    while (remaining[status] > 0 && statuses.length < plan.activities) {
      statuses.push(status);
      remaining[status] -= 1;
    }
  }

  return Array.from({ length: plan.activities }, (_, index) => {
    const template = templates[index % templates.length];
    const categoryCode =
      plan.category === "Goods"
        ? "G"
        : plan.category === "Works"
          ? "W"
          : plan.category === "Non-Consulting Services"
            ? "NCS"
            : "CS";

    return {
      category: plan.category,
      currentStage: template.stage,
      description: template.description,
      estimatedAmount: template.amount,
      method: template.method,
      reference: `MOA/${activityProjectCode}/${categoryCode}/${String(index + 1).padStart(2, "0")}`,
      status: statuses[index] ?? "In Progress",
    };
  });
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
}

function escapeCsvValue(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

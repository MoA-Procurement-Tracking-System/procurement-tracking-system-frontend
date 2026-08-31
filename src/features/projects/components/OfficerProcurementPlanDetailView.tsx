"use client";

import { StatusText } from "../../../components/dashboard/StatusText";
import type {
  OfficerProject,
  ProcurementPlanSummary,
} from "@/features/projects/data/officerProjects";
import type {
  ProcurementActivityStatus,
  ProcurementActivitySummary,
} from "@/features/projects/data/officerActivityDrafts";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Search,
  Send,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

type ActivityStatus = ProcurementActivityStatus;

type PlanActivity = ProcurementActivitySummary;

export function OfficerProcurementPlanDetailView({
  onSubmitToDirector,
  plan,
  project,
  savedActivities = [],
}: {
  onSubmitToDirector?: (planReference: string) => void;
  plan: ProcurementPlanSummary;
  project: OfficerProject;
  savedActivities?: readonly ProcurementActivitySummary[];
}) {
  const [submittedPlanReference, setSubmittedPlanReference] = useState<
    string | null
  >(null);
  const activePlanStatus =
    submittedPlanReference === plan.reference
      ? "Submitted to Director"
      : plan.status;
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [methodFilter, setMethodFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | ActivityStatus>(
    "All",
  );
  const searchInputRef = useRef<HTMLInputElement>(null);
  const activities = useMemo(() => {
    const list = [...savedActivities];
    if (plan.planActivities && plan.planActivities.length > 0) {
      const existingRefs = new Set(list.map((a) => a.reference.toLowerCase()));
      plan.planActivities.forEach((pa) => {
        if (!existingRefs.has(pa.reference.toLowerCase())) {
          list.push(pa);
        }
      });
    }
    return list;
  }, [savedActivities, plan.planActivities]);
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
              <Link className="hover:text-[#176c55]" href="/dashboard/officer">
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
              <StatusText className="text-[10px]" label={activePlanStatus} />
              <span aria-hidden="true" className="text-slate-300">
                •
              </span>
              <span>{activities.length} Activities</span>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-[#176c55] hover:bg-[#edf5f1] hover:text-[#176c55] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176c55]"
              type="button"
            >
              <Upload
                aria-hidden="true"
                className="h-3.5 w-3.5 text-slate-500"
              />
              Import Activities
            </button>
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

      {activePlanStatus !== "Submitted to Director" &&
      activePlanStatus !== "Committee Review" &&
      activePlanStatus !== "Approved" &&
      activePlanStatus !== "Finally Approved" ? (
        <section
          aria-label="Submit plan for review"
          className="flex flex-col gap-4 rounded-xl border border-[#c7d7d0] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf5f1] text-[#176c55]">
              <CheckCircle2
                aria-hidden="true"
                className="h-5 w-5 text-[#176c55]"
              />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#10243f]">
                {activePlanStatus === "Returned"
                  ? "Plan revised and ready for resubmission"
                  : "Plan is ready for review"}
              </h2>
              <p className="text-xs text-slate-500">
                {activePlanStatus === "Returned"
                  ? "Modifications have been applied. Resubmit to the Director for approval."
                  : "All activities have been drafted. Submit to the Director for final approval."}
              </p>
            </div>
          </div>
          <button
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-[#125442] bg-[#176c55] px-4 text-xs font-bold text-white shadow-2xs hover:bg-[#125f4c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176c55] transition cursor-pointer"
            onClick={() => {
              setSubmittedPlanReference(plan.reference);
              onSubmitToDirector?.(plan.reference);
            }}
            type="button"
          >
            {activePlanStatus === "Returned"
              ? "Resubmit to Director"
              : "Submit to Director"}
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        </section>
      ) : activePlanStatus === "Submitted to Director" ? (
        <section
          aria-label="Plan submission status"
          className="flex items-center gap-3.5 rounded-xl border border-[#c7d7d0] bg-[#edf5f1] p-4 shadow-2xs"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d8e8e0] text-[#176c55]">
            <Send aria-hidden="true" className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#10243f]">
              Submitted to Director for Review
            </h2>
            <p className="text-[11px] text-[#176c55]">
              This procurement plan and all its {activities.length} activities
              are currently under review by the Director.
            </p>
          </div>
        </section>
      ) : null}

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

function formatAmount(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
}

function escapeCsvValue(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

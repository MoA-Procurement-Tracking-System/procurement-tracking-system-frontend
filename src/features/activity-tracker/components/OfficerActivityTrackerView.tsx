"use client";

import {
  calculateDelayDays,
  createInitialActivityTrackingRecord,
  effectiveTargetDate,
  findActivityTrackingRecord,
  OFFICER_ACTIVITY_TRACKING_STORAGE_KEY,
  parseActivityTrackingRecords,
  upsertActivityTrackingRecord,
  type ActivityProcessStatus,
  type OfficerActivityTrackingRecord,
  type TrackingDateValue,
} from "../data/officerActivityTracking";
import { ActivityTrackingDetailView } from "./ActivityTrackingDetailView";
import { getPlanActivities } from "../../projects/components/OfficerProcurementPlanDetailView";
import {
  OFFICER_ACTIVITY_DRAFTS_STORAGE_KEY,
  parseSavedActivityRecords,
  type ProcurementActivitySummary,
  type SavedOfficerActivityRecord,
} from "../../projects/data/officerActivityDrafts";
import {
  mergeSavedPlans,
  OFFICER_PLAN_DRAFTS_STORAGE_KEY,
  parseSavedPlanRecords,
  type SavedOfficerPlanRecord,
} from "../../projects/data/officerPlanDrafts";
import {
  officerProjects,
  type OfficerProject,
  type ProcurementPlanSummary,
} from "../../projects/data/officerProjects";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Filter,
  House,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export interface OfficerTrackedActivityItem {
  activity: ProcurementActivitySummary;
  plan: ProcurementPlanSummary;
  project: OfficerProject;
  tracking: OfficerActivityTrackingRecord;
}

type TrackerDisplayStatus =
  "Canceled" | "Completed" | "Delayed" | "In Progress" | "Not Started";

const processStatusOptions: readonly ActivityProcessStatus[] = [
  "Pending Implementation",
  "Under Implementation",
  "Bid Opened / Under Evaluation",
  "Supplier Shortlisted",
  "Draft Contract / Negotiation",
  "Signed",
  "Completed",
  "Canceled",
];

const statusTone: Record<
  TrackerDisplayStatus,
  { background: string; border: string; color: string; dot: string }
> = {
  Canceled: {
    background: "#f8fafc",
    border: "#cbd5e1",
    color: "#475569",
    dot: "#64748b",
  },
  Completed: {
    background: "#ecfdf5",
    border: "#a7f3d0",
    color: "#047857",
    dot: "#059669",
  },
  Delayed: {
    background: "#fff1f0",
    border: "#fecaca",
    color: "#b42318",
    dot: "#dc2626",
  },
  "In Progress": {
    background: "#eff6ff",
    border: "#bfdbfe",
    color: "#1d4ed8",
    dot: "#2563eb",
  },
  "Not Started": {
    background: "#f8fafc",
    border: "#cbd5e1",
    color: "#475569",
    dot: "#64748b",
  },
};

export function OfficerActivityTrackerView({
  selectedActivityReference,
  selectedPlanReference,
  selectedProjectCode,
}: {
  selectedActivityReference?: string;
  selectedPlanReference?: string;
  selectedProjectCode?: string;
}) {
  const [savedPlanRecords, setSavedPlanRecords] = useState<
    SavedOfficerPlanRecord[]
  >([]);
  const [savedActivityRecords, setSavedActivityRecords] = useState<
    SavedOfficerActivityRecord[]
  >([]);
  const [trackingRecords, setTrackingRecords] = useState<
    OfficerActivityTrackingRecord[]
  >([]);

  useEffect(() => {
    const loadRecords = window.setTimeout(() => {
      setSavedPlanRecords(
        parseSavedPlanRecords(
          window.localStorage.getItem(OFFICER_PLAN_DRAFTS_STORAGE_KEY),
        ),
      );
      setSavedActivityRecords(
        parseSavedActivityRecords(
          window.localStorage.getItem(OFFICER_ACTIVITY_DRAFTS_STORAGE_KEY),
        ),
      );
      setTrackingRecords(
        parseActivityTrackingRecords(
          window.localStorage.getItem(OFFICER_ACTIVITY_TRACKING_STORAGE_KEY),
        ),
      );
    }, 0);

    return () => window.clearTimeout(loadRecords);
  }, []);

  const projects = useMemo(
    () => mergeSavedPlans(officerProjects, savedPlanRecords),
    [savedPlanRecords],
  );
  const items = useMemo(
    () =>
      collectTrackableActivities(
        projects,
        savedActivityRecords,
        trackingRecords,
      ),
    [projects, savedActivityRecords, trackingRecords],
  );
  const selectedItem = items.find(
    (item) =>
      item.activity.reference === selectedActivityReference &&
      (!selectedProjectCode || item.project.code === selectedProjectCode) &&
      (!selectedPlanReference || item.plan.reference === selectedPlanReference),
  );

  function saveTracking(record: OfficerActivityTrackingRecord) {
    const nextRecords = upsertActivityTrackingRecord(trackingRecords, record);
    setTrackingRecords(nextRecords);
    window.localStorage.setItem(
      OFFICER_ACTIVITY_TRACKING_STORAGE_KEY,
      JSON.stringify(nextRecords),
    );
  }

  if (selectedItem) {
    return (
      <ActivityTrackingDetailView item={selectedItem} onSave={saveTracking} />
    );
  }

  return <ActivityTrackerList items={items} />;
}

export function collectTrackableActivities(
  projects: readonly OfficerProject[],
  savedActivityRecords: readonly SavedOfficerActivityRecord[],
  trackingRecords: readonly OfficerActivityTrackingRecord[],
) {
  const items: OfficerTrackedActivityItem[] = [];

  for (const project of projects) {
    for (const plan of project.plans) {
      if (plan.status !== "Approved") continue;

      const savedActivities = savedActivityRecords
        .filter(
          (record) =>
            record.projectCode === project.code &&
            record.planReference === plan.reference,
        )
        .map((record) => record.activity);

      for (const activity of getPlanActivities(
        project,
        plan,
        savedActivities,
      )) {
        const tracking =
          findActivityTrackingRecord(
            trackingRecords,
            project.code,
            plan.reference,
            activity.reference,
          ) ??
          createInitialActivityTrackingRecord(
            project.code,
            plan.reference,
            activity,
          );

        items.push({ activity, plan, project, tracking });
      }
    }
  }

  return items;
}

function ActivityTrackerList({
  items,
}: {
  items: readonly OfficerTrackedActivityItem[];
}) {
  const [category, setCategory] = useState("all");
  const [displayStatus, setDisplayStatus] = useState("all");
  const [planReference, setPlanReference] = useState("all");
  const [processStatus, setProcessStatus] = useState("all");
  const [projectCode, setProjectCode] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const projectOptions = useMemo(
    () =>
      Array.from(
        new Map(
          items.map((item) => [item.project.code, item.project.shortName]),
        ),
      ),
    [items],
  );
  const planOptions = useMemo(
    () =>
      Array.from(
        new Map(items.map((item) => [item.plan.reference, item.plan.name])),
      ),
    [items],
  );
  const categoryOptions = useMemo(
    () => Array.from(new Set(items.map((item) => item.activity.category))),
    [items],
  );

  const filteredItems = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const status = trackerDisplayStatus(item);
      const searchable = [
        item.activity.reference,
        item.activity.description,
        item.activity.currentStage,
        item.plan.name,
        item.plan.reference,
        item.project.name,
        item.project.code,
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!search || searchable.includes(search)) &&
        (projectCode === "all" || item.project.code === projectCode) &&
        (planReference === "all" || item.plan.reference === planReference) &&
        (category === "all" || item.activity.category === category) &&
        (processStatus === "all" ||
          item.tracking.processStatus === processStatus) &&
        (displayStatus === "all" || status === displayStatus)
      );
    });
  }, [
    category,
    displayStatus,
    items,
    planReference,
    processStatus,
    projectCode,
    searchQuery,
  ]);

  const completedCount = items.filter(
    (item) => trackerDisplayStatus(item) === "Completed",
  ).length;
  const delayedCount = items.filter(
    (item) => trackerDisplayStatus(item) === "Delayed",
  ).length;
  const inProgressCount = items.filter(
    (item) => trackerDisplayStatus(item) === "In Progress",
  ).length;
  const additionalFilterCount =
    Number(planReference !== "all") +
    Number(category !== "all") +
    Number(displayStatus !== "all");
  const hasFilters =
    Boolean(searchQuery.trim()) ||
    projectCode !== "all" ||
    processStatus !== "all" ||
    additionalFilterCount > 0;

  return (
    <div className="w-full min-w-0 space-y-5 overflow-x-hidden pb-6">
      <header>
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
          <ol className="flex items-center gap-2">
            <li>
              <Link
                className="inline-flex items-center gap-1 hover:text-[#176c55] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176c55]"
                href="/dashboard/officer"
              >
                <House aria-hidden="true" className="h-3.5 w-3.5" />
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-slate-300">
              /
            </li>
            <li aria-current="page" className="font-bold text-[#176c55]">
              Activity Tracker
            </li>
          </ol>
        </nav>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[#10243f]">
          Activity Tracker
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Update execution milestones for activities in finally approved plans.
        </p>
      </header>

      <section
        aria-label="Activity tracking summary"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <SummaryCard
          icon={<Activity aria-hidden="true" className="h-4 w-4" />}
          label="Approved-plan activities"
          tone="navy"
          value={items.length}
        />
        <SummaryCard
          icon={<Clock3 aria-hidden="true" className="h-4 w-4" />}
          label="In progress"
          tone="blue"
          value={inProgressCount}
        />
        <SummaryCard
          icon={<AlertTriangle aria-hidden="true" className="h-4 w-4" />}
          label="Delayed"
          tone="red"
          value={delayedCount}
        />
        <SummaryCard
          icon={<CheckCircle2 aria-hidden="true" className="h-4 w-4" />}
          label="Completed"
          tone="green"
          value={completedCount}
        />
      </section>

      <section
        aria-label="Activity tracker filters"
        className="w-full rounded-md border border-slate-300 bg-white p-3 shadow-sm"
      >
        <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(21rem,1fr)_10rem_14rem_auto]">
          <label className="relative block min-w-0 sm:col-span-2 xl:col-span-1">
            <span className="sr-only">Search tracked activities</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500"
            />
            <input
              className="h-10 w-full rounded-sm border border-slate-300 bg-[#fbfcfd] pr-3 pl-10 text-xs text-slate-800 outline-none transition placeholder:text-slate-500 hover:border-[#9fb8ad] focus:border-[#176c55] focus:bg-white focus:ring-2 focus:ring-[#176c55]/15"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search activity #, description, plan, or stage..."
              type="search"
              value={searchQuery}
            />
          </label>
          <CompactSelect
            label="Project"
            onChange={setProjectCode}
            options={[
              { label: "Project", value: "all" },
              ...projectOptions.map(([value, label]) => ({ label, value })),
            ]}
            value={projectCode}
          />
          <CompactSelect
            label="Process Status"
            onChange={setProcessStatus}
            options={[
              { label: "Process Status", value: "all" },
              ...processStatusOptions.map((value) => ({ label: value, value })),
            ]}
            value={processStatus}
          />
          <button
            aria-expanded={showMoreFilters}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-sm border px-3 text-xs font-bold whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176c55] ${
              showMoreFilters || additionalFilterCount > 0
                ? "border-[#7caa98] bg-[#edf5f1] text-[#07523f]"
                : "border-slate-300 bg-[#fbfcfd] text-slate-700 hover:border-[#9fb8ad] hover:bg-white"
            }`}
            onClick={() => setShowMoreFilters((current) => !current)}
            type="button"
          >
            <Filter aria-hidden="true" className="h-3.5 w-3.5" />
            More Filters
            {additionalFilterCount > 0 ? (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#176c55] px-1 text-[9px] text-white">
                {additionalFilterCount}
              </span>
            ) : null}
          </button>
        </div>

        {showMoreFilters ? (
          <div className="mt-3 grid gap-3 border-t border-slate-200 pt-3 sm:grid-cols-2 xl:grid-cols-[minmax(13rem,1fr)_11rem_10rem_auto]">
            <CompactSelect
              label="Plan"
              onChange={setPlanReference}
              options={[
                { label: "All Approved Plans", value: "all" },
                ...planOptions.map(([value, label]) => ({ label, value })),
              ]}
              value={planReference}
            />
            <CompactSelect
              label="Category"
              onChange={setCategory}
              options={[
                { label: "All Categories", value: "all" },
                ...categoryOptions.map((value) => ({ label: value, value })),
              ]}
              value={category}
            />
            <CompactSelect
              label="Status"
              onChange={setDisplayStatus}
              options={[
                { label: "All Statuses", value: "all" },
                { label: "Not Started", value: "Not Started" },
                { label: "In Progress", value: "In Progress" },
                { label: "Delayed", value: "Delayed" },
                { label: "Completed", value: "Completed" },
                { label: "Canceled", value: "Canceled" },
              ]}
              value={displayStatus}
            />
            {hasFilters ? (
              <button
                className="h-10 justify-self-start px-2 text-xs font-bold text-slate-500 underline-offset-2 hover:text-[#176c55] hover:underline"
                onClick={() => {
                  setCategory("all");
                  setDisplayStatus("all");
                  setPlanReference("all");
                  setProcessStatus("all");
                  setProjectCode("all");
                  setSearchQuery("");
                }}
                type="button"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div
          aria-label="Tracked procurement activities"
          className="max-w-full overflow-x-auto"
          role="region"
          tabIndex={0}
        >
          <table className="w-[94rem] min-w-[94rem] table-fixed border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-300 bg-[#edf5f1] text-[10px] font-extrabold uppercase tracking-[0.05em] text-slate-600">
                <th className="w-72 px-4 py-3" scope="col">
                  Activity / Reference
                </th>
                <th className="w-56 px-4 py-3" scope="col">
                  Project / Plan
                </th>
                <th className="w-40 px-4 py-3" scope="col">
                  Category / Method
                </th>
                <th className="w-52 px-4 py-3" scope="col">
                  Current Stage
                </th>
                <th className="w-40 px-4 py-3" scope="col">
                  Current Target
                </th>
                <th className="w-36 px-4 py-3" scope="col">
                  Progress
                </th>
                <th className="w-24 px-4 py-3 text-center" scope="col">
                  Delay
                </th>
                <th className="w-52 px-4 py-3" scope="col">
                  Process / Status
                </th>
                <th className="w-20 px-4 py-3 text-center" scope="col">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <TrackerRow item={item} key={trackerItemKey(item)} />
                ))
              ) : (
                <tr>
                  <td className="px-4 py-14 text-center" colSpan={9}>
                    <Search className="mx-auto h-6 w-6 text-slate-300" />
                    <p className="mt-2 text-sm font-bold text-slate-700">
                      No activities match these filters
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Clear a filter or search using another reference.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <footer className="flex items-center justify-between border-t border-slate-200 bg-[#fafbfc] px-4 py-3 text-xs text-slate-500">
          <span>
            Showing {filteredItems.length} of {items.length} approved-plan
            activities
          </span>
          <span>Original baseline dates remain locked</span>
        </footer>
      </section>
    </div>
  );
}

function TrackerRow({ item }: { item: OfficerTrackedActivityItem }) {
  const status = trackerDisplayStatus(item);
  const tone = statusTone[status];
  const activeStage = currentRoadmapStage(item);
  const stageTracking = item.tracking.stages.find(
    (stage) => stage.stageName === activeStage?.name,
  );
  const originalDate: TrackingDateValue = {
    ethiopian: activeStage?.ethiopianDate ?? "",
    gregorian: activeStage?.gregorianDate ?? "",
  };
  const target = effectiveTargetDate(originalDate, stageTracking);
  const delay = calculateDelayDays(originalDate, stageTracking);
  const href =
    "/workspace/activity-tracker?project=" +
    encodeURIComponent(item.project.code) +
    "&plan=" +
    encodeURIComponent(item.plan.reference) +
    "&activity=" +
    encodeURIComponent(item.activity.reference);

  return (
    <tr className="align-middle text-xs text-slate-700 hover:bg-slate-50/70">
      <td className="px-4 py-3.5">
        <p className="font-bold leading-5 text-[#10243f]">
          {item.activity.description}
        </p>
        <p className="mt-1 font-mono text-[10px] text-[#1261a8]">
          {item.activity.reference}
        </p>
      </td>
      <td className="px-4 py-3.5">
        <p className="font-bold text-slate-700">{item.project.shortName}</p>
        <p
          className="mt-1 truncate text-[10px] text-slate-500"
          title={item.plan.name}
        >
          {item.plan.name}
        </p>
      </td>
      <td className="px-4 py-3.5">
        <p className="font-semibold text-slate-700">{item.activity.category}</p>
        <p className="mt-1 text-[10px] text-slate-500">
          {item.activity.method}
        </p>
      </td>
      <td className="px-4 py-3.5">
        <p className="font-semibold leading-5 text-slate-700">
          {activeStage?.name ?? item.activity.currentStage}
        </p>
        <p className="mt-1 text-[10px] text-slate-500">
          {stageTracking?.status ?? "Baseline stage"}
        </p>
      </td>
      <td className="px-4 py-3.5">
        <DateValue date={target} />
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[#176c55]"
              style={{ width: `${item.tracking.progressPercent}%` }}
            />
          </div>
          <span className="w-8 text-right font-bold tabular-nums text-slate-700">
            {item.tracking.progressPercent}%
          </span>
        </div>
      </td>
      <td className="px-4 py-3.5 text-center">
        {delay === null ? (
          <span className="text-slate-400">—</span>
        ) : delay > 0 ? (
          <span className="font-bold text-[#b42318]">{delay}d</span>
        ) : (
          <span className="font-semibold text-[#047857]">On time</span>
        )}
      </td>
      <td className="px-4 py-3.5">
        <p className="font-semibold text-slate-700">
          {item.tracking.processStatus}
        </p>
        <p className="mt-1 text-[10px] text-slate-500">
          {item.tracking.activityStatus}
        </p>
        <span
          className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-bold"
          style={{
            backgroundColor: tone.background,
            borderColor: tone.border,
            color: tone.color,
          }}
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: tone.dot }}
          />
          {status}
        </span>
      </td>
      <td className="px-4 py-3.5 text-center">
        <Link
          className="font-bold text-[#1261a8] hover:text-[#07523f] hover:underline"
          href={href}
        >
          Open
        </Link>
      </td>
    </tr>
  );
}

function SummaryCard({
  icon,
  label,
  tone,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "blue" | "green" | "navy" | "red";
  value: number;
}) {
  const colors = {
    blue: { accent: "#2563eb", border: "#bfdbfe", icon: "#eff6ff" },
    green: { accent: "#047857", border: "#b8dfcf", icon: "#ecfdf5" },
    navy: { accent: "#10243f", border: "#d7e0ea", icon: "#f1f5f9" },
    red: { accent: "#b42318", border: "#fecaca", icon: "#fff1f0" },
  }[tone];

  return (
    <article
      className="flex min-h-24 items-center gap-4 rounded-lg border bg-white px-4 py-4 shadow-sm"
      style={{ borderColor: colors.border }}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: colors.icon, color: colors.accent }}
      >
        {icon}
      </span>
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
          {label}
        </p>
        <p
          className="mt-1 text-2xl font-extrabold"
          style={{ color: colors.accent }}
        >
          {value}
        </p>
      </div>
    </article>
  );
}

function CompactSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: readonly { label: string; value: string }[];
  value: string;
}) {
  return (
    <label className="relative block min-w-0">
      <span className="sr-only">{label}</span>
      <select
        className="h-10 w-full cursor-pointer appearance-none truncate rounded-sm border border-slate-300 bg-[#fbfcfd] py-2 pr-9 pl-3 text-xs font-semibold text-slate-700 outline-none transition hover:border-[#9fb8ad] focus:border-[#176c55] focus:bg-white focus:ring-2 focus:ring-[#176c55]/15"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-500"
      />
    </label>
  );
}

function DateValue({ date }: { date: TrackingDateValue }) {
  if (!date.gregorian) return <span className="text-slate-400">—</span>;
  return (
    <div>
      <p className="font-semibold text-slate-700">
        {formatGregorianDate(date.gregorian)}
      </p>
      {date.ethiopian ? (
        <p className="mt-1 text-[10px] text-slate-500">{date.ethiopian}</p>
      ) : null}
    </div>
  );
}

function trackerDisplayStatus(
  item: OfficerTrackedActivityItem,
): TrackerDisplayStatus {
  if (item.tracking.processStatus === "Canceled") return "Canceled";
  if (
    item.tracking.processStatus === "Completed" ||
    item.tracking.progressPercent === 100
  ) {
    return "Completed";
  }
  const activeStage = currentRoadmapStage(item);
  const tracking = item.tracking.stages.find(
    (stage) => stage.stageName === activeStage?.name,
  );
  const delay = calculateDelayDays(
    {
      ethiopian: activeStage?.ethiopianDate ?? "",
      gregorian: activeStage?.gregorianDate ?? "",
    },
    tracking,
  );
  if ((delay ?? 0) > 0 || item.activity.status === "Delayed") return "Delayed";
  if (
    item.tracking.progressPercent > 0 ||
    item.tracking.processStatus !== "Pending Implementation"
  ) {
    return "In Progress";
  }
  return "Not Started";
}

function currentRoadmapStage(item: OfficerTrackedActivityItem) {
  const roadmap = item.activity.details?.roadmap ?? [];
  const inProgressStage = item.tracking.stages.find(
    (stage) => stage.status === "In Progress",
  );
  return (
    roadmap.find((stage) => stage.name === inProgressStage?.stageName) ??
    roadmap.find((stage) => stage.name === item.activity.currentStage) ??
    roadmap.find((stage) => !stage.notApplicable)
  );
}

function trackerItemKey(item: OfficerTrackedActivityItem) {
  return [item.project.code, item.plan.reference, item.activity.reference].join(
    "::",
  );
}

function formatGregorianDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.valueOf())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(date);
}

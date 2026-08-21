"use client";

import type { OfficerTrackedActivityItem } from "./OfficerActivityTrackerView";
import {
  calculateDelayDays,
  effectiveTargetDate,
  type ActivityProcessStatus,
  type ActivityStageStatus,
  type ActivityStageTracking,
  type ActivityWorkflowStatus,
  type OfficerActivityTrackingRecord,
  type TrackingDateValue,
} from "../data/officerActivityTracking";
import { DualCalendarField } from "../../projects/components/CreateProcurementPlanView";
import type { ProcurementActivityRoadmapStage } from "../../projects/data/officerActivityDrafts";
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  ExternalLink,
  FileClock,
  House,
  Info,
  LockKeyhole,
  RefreshCw,
  Route,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const processStatuses: readonly ActivityProcessStatus[] = [
  "Pending Implementation",
  "Under Implementation",
  "Bid Opened / Under Evaluation",
  "Supplier Shortlisted",
  "Draft Contract / Negotiation",
  "Signed",
  "Completed",
  "Canceled",
];

const workflowStatuses: readonly ActivityWorkflowStatus[] = [
  "New",
  "Submitted",
  "Under Review",
  "Cleared",
  "Modified / Cleared",
];

export function ActivityTrackingDetailView({
  item,
  onSave,
}: {
  item: OfficerTrackedActivityItem;
  onSave: (record: OfficerActivityTrackingRecord) => void;
}) {
  const roadmap = useMemo(() => trackingRoadmap(item), [item]);
  const [record, setRecord] = useState(item.tracking);
  const [savedMessage, setSavedMessage] = useState("");
  const projectActivityHref =
    "/workspace/projects?project=" +
    encodeURIComponent(item.project.code) +
    "&plan=" +
    encodeURIComponent(item.plan.reference) +
    "&activity=" +
    encodeURIComponent(item.activity.reference);

  function updateRecord(
    changes: Partial<
      Pick<
        OfficerActivityTrackingRecord,
        | "activityStatus"
        | "generalRemarks"
        | "processStatus"
        | "progressPercent"
      >
    >,
  ) {
    setSavedMessage("");
    setRecord((current) => ({ ...current, ...changes }));
  }

  function persist(nextRecord: OfficerActivityTrackingRecord, message: string) {
    const savedRecord = { ...nextRecord, updatedAt: new Date().toISOString() };
    setRecord(savedRecord);
    onSave(savedRecord);
    setSavedMessage(message);
  }

  return (
    <div className="min-w-0 space-y-5 pb-8">
      <header>
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                className="inline-flex items-center gap-1 hover:text-[#176c55]"
                href="/dashboard/officer"
              >
                <House aria-hidden="true" className="h-3.5 w-3.5" /> Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-slate-300">
              /
            </li>
            <li>
              <Link
                className="hover:text-[#176c55]"
                href="/workspace/activity-tracker"
              >
                Activity Tracker
              </Link>
            </li>
            <li aria-hidden="true" className="text-slate-300">
              /
            </li>
            <li aria-current="page" className="font-bold text-[#176c55]">
              {item.activity.reference}
            </li>
          </ol>
        </nav>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#176c55]">
              Execution Tracking
            </p>
            <h1 className="mt-1 max-w-5xl text-2xl font-extrabold tracking-tight text-[#10243f]">
              {item.activity.description}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              <span className="font-mono text-[#1261a8]">
                {item.activity.reference}
              </span>
              <span aria-hidden="true">•</span>
              <span>{item.project.shortName}</span>
              <span aria-hidden="true">•</span>
              <span>{item.plan.name}</span>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-xs font-bold text-slate-600 hover:border-[#8db7a6] hover:text-[#176c55]"
              href={projectActivityHref}
            >
              Full activity details{" "}
              <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
            <Link
              className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-xs font-bold text-slate-600 hover:border-[#8db7a6] hover:text-[#176c55]"
              href="/workspace/activity-tracker"
            >
              <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" /> Back to
              tracker
            </Link>
          </div>
        </div>
      </header>

      {savedMessage ? (
        <div
          aria-live="polite"
          className="flex items-center gap-2 rounded-md border border-[#b8dfcf] bg-[#edf7f2] px-4 py-3 text-xs font-bold text-[#07523f]"
        >
          <CheckCircle2 aria-hidden="true" className="h-4 w-4" /> {savedMessage}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <SectionHeading
          icon={<CircleDot className="h-4 w-4" />}
          title="Activity Execution Status"
        />
        <div className="grid gap-5 p-4 lg:grid-cols-[1fr_1fr_1fr_1.5fr]">
          <FieldSelect
            label="Process Status"
            onChange={(value) => {
              const processStatus = value as ActivityProcessStatus;
              updateRecord({
                processStatus,
                ...(processStatus === "Completed"
                  ? { progressPercent: 100 }
                  : {}),
              });
            }}
            options={processStatuses}
            value={record.processStatus}
          />
          <FieldSelect
            label="Activity Status"
            onChange={(value) =>
              updateRecord({ activityStatus: value as ActivityWorkflowStatus })
            }
            options={workflowStatuses}
            value={record.activityStatus}
          />
          <label className="block">
            <span className="mb-2 block text-[11px] font-bold text-slate-600">
              Performance / Progress %
            </span>
            <div className="flex h-10 items-center gap-3 rounded border border-slate-300 bg-white px-3 focus-within:border-[#176c55] focus-within:ring-2 focus-within:ring-[#176c55]/15">
              <input
                aria-label="Performance progress percentage"
                className="min-w-0 flex-1 accent-[#176c55]"
                max={100}
                min={0}
                onChange={(event) =>
                  updateRecord({ progressPercent: Number(event.target.value) })
                }
                type="range"
                value={record.progressPercent}
              />
              <span className="w-10 text-right text-xs font-extrabold tabular-nums text-[#10243f]">
                {record.progressPercent}%
              </span>
            </div>
          </label>
          <label className="block">
            <span className="mb-2 block text-[11px] font-bold text-slate-600">
              General Remarks
            </span>
            <input
              className="h-10 w-full rounded border border-slate-300 px-3 text-xs text-slate-700 outline-none focus:border-[#176c55] focus:ring-2 focus:ring-[#176c55]/15"
              onChange={(event) =>
                updateRecord({ generalRemarks: event.target.value })
              }
              placeholder="Execution note, issue, or follow-up..."
              value={record.generalRemarks}
            />
          </label>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-slate-200 bg-[#fafbfc] px-4 py-3">
          <p className="text-[10px] text-slate-500">
            {record.updatedAt
              ? `Last saved ${formatDateTime(record.updatedAt)}`
              : "No execution update has been saved yet."}
          </p>
          <button
            className="inline-flex h-9 items-center gap-2 rounded-md bg-[#176c55] px-4 text-xs font-bold text-white hover:bg-[#125442]"
            onClick={() => persist(record, "Activity execution status saved.")}
            type="button"
          >
            <Save aria-hidden="true" className="h-3.5 w-3.5" /> Save Activity
            Update
          </button>
        </div>
      </section>

      <RoadmapTrackingSection
        item={item}
        onRecordChange={setRecord}
        onSave={persist}
        record={record}
        roadmap={roadmap}
      />

      <div className="flex items-start gap-2 rounded-md border border-[#cbd8e6] bg-[#f4f7fb] px-4 py-3 text-[10px] leading-5 text-slate-600">
        <Info
          aria-hidden="true"
          className="mt-0.5 h-4 w-4 shrink-0 text-[#1261a8]"
        />
        Delay uses the latest revised target when one exists; otherwise it uses
        the approved original date. Historical revisions remain available for
        baseline-variance reporting.
      </div>
    </div>
  );
}

function RoadmapTrackingSection({
  item,
  onRecordChange,
  onSave,
  record,
  roadmap,
}: {
  item: OfficerTrackedActivityItem;
  onRecordChange: (record: OfficerActivityTrackingRecord) => void;
  onSave: (record: OfficerActivityTrackingRecord, message: string) => void;
  record: OfficerActivityTrackingRecord;
  roadmap: readonly ProcurementActivityRoadmapStage[];
}) {
  const initialStage =
    roadmap.find((stage) => stage.name === item.activity.currentStage) ??
    roadmap[0];
  const [selectedStageName, setSelectedStageName] = useState(
    initialStage?.name ?? "",
  );
  const selectedStage =
    roadmap.find((stage) => stage.name === selectedStageName) ?? roadmap[0];
  const selectedTracking = selectedStage
    ? trackingForStage(record, selectedStage, item)
    : undefined;

  function updateStage(changes: Partial<ActivityStageTracking>) {
    if (!selectedTracking) return;
    onRecordChange(
      withStageTracking(record, { ...selectedTracking, ...changes }),
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-[#c7d8cf] bg-[#edf5f1] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Route aria-hidden="true" className="h-4 w-4 text-[#176c55]" />
          <h2 className="text-sm font-extrabold text-[#10243f]">
            Procurement Roadmap Tracking
          </h2>
        </div>
        <p className="inline-flex items-center gap-1.5 text-[10px] text-slate-500">
          <LockKeyhole aria-hidden="true" className="h-3.5 w-3.5" />
          Original planned dates are locked after approval
        </p>
      </div>

      <div className="grid min-w-0 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <div
          aria-label="Activity roadmap tracking stages"
          className="min-w-0 overflow-x-auto"
          role="region"
          tabIndex={0}
        >
          <table className="w-[76rem] min-w-[76rem] table-fixed border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-300 bg-[#fafbfc] text-[9px] font-extrabold uppercase tracking-[0.05em] text-slate-600">
                <th className="w-64 px-4 py-3" scope="col">
                  Stage
                </th>
                <th className="w-44 px-4 py-3" scope="col">
                  Original Planned Date
                </th>
                <th className="w-44 px-4 py-3" scope="col">
                  Current Target
                </th>
                <th className="w-44 px-4 py-3" scope="col">
                  Actual Date
                </th>
                <th className="w-36 px-4 py-3" scope="col">
                  Stage Status
                </th>
                <th className="w-24 px-4 py-3 text-center" scope="col">
                  Delay
                </th>
                <th className="w-24 px-4 py-3 text-center" scope="col">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {roadmap.map((stage) => {
                const tracking = trackingForStage(record, stage, item);
                const original = dateFromRoadmap(stage);
                const target = effectiveTargetDate(original, tracking);
                const delay = calculateDelayDays(original, tracking);
                const selected = stage.name === selectedStage?.name;
                return (
                  <tr
                    className={
                      selected
                        ? "bg-[#f2f8f5] text-xs text-slate-700"
                        : "text-xs text-slate-700 hover:bg-slate-50"
                    }
                    key={stage.name}
                  >
                    <td className="px-4 py-3">
                      <p className="font-bold leading-5 text-[#10243f]">
                        {stage.name}
                      </p>
                      {tracking.revisions.length > 0 ? (
                        <span className="mt-1 inline-flex rounded bg-[#eef2ff] px-1.5 py-0.5 text-[9px] font-bold text-[#475569]">
                          R{tracking.revisions.length}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <LockedDateValue date={original} />
                    </td>
                    <td className="px-4 py-3">
                      <DateValue
                        date={target}
                        revised={tracking.revisions.length > 0}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <DateValue date={tracking.actualDate ?? emptyDate()} />
                    </td>
                    <td className="px-4 py-3">
                      <StageStatusBadge status={tracking.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      {delay === null ? (
                        <span className="text-slate-400">—</span>
                      ) : delay > 0 ? (
                        <span className="font-extrabold text-[#b42318]">
                          {delay}d
                        </span>
                      ) : (
                        <span className="font-bold text-[#047857]">0d</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        className="font-bold text-[#1261a8] hover:text-[#07523f] hover:underline"
                        onClick={() => setSelectedStageName(stage.name)}
                        type="button"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <aside className="border-t border-slate-200 bg-[#fafbfc] p-4 xl:border-t-0 xl:border-l">
          {selectedStage && selectedTracking ? (
            <StageEditor
              key={selectedStage.name}
              onSave={onSave}
              onUpdate={updateStage}
              record={record}
              roadmap={roadmap}
              stage={selectedStage}
              tracking={selectedTracking}
            />
          ) : (
            <div className="py-10 text-center text-xs text-slate-500">
              Select a roadmap stage to update it.
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function trackingRoadmap(item: OfficerTrackedActivityItem) {
  if (item.activity.details?.roadmap.length)
    return item.activity.details.roadmap;
  return [
    {
      allowNotApplicable: false,
      days: "",
      ethiopianDate: "",
      gregorianDate: "",
      name: item.activity.currentStage,
      notApplicable: false,
      remarks: "",
    },
  ] satisfies ProcurementActivityRoadmapStage[];
}

function trackingForStage(
  record: OfficerActivityTrackingRecord,
  stage: ProcurementActivityRoadmapStage,
  item: OfficerTrackedActivityItem,
): ActivityStageTracking {
  return (
    record.stages.find((tracking) => tracking.stageName === stage.name) ?? {
      remarks: stage.remarks,
      revisions: [],
      stageName: stage.name,
      status: stage.notApplicable
        ? "Not Applicable"
        : stage.name === item.activity.currentStage &&
            item.activity.status !== "Not Started"
          ? "In Progress"
          : "Not Started",
    }
  );
}

function withStageTracking(
  record: OfficerActivityTrackingRecord,
  tracking: ActivityStageTracking,
) {
  return {
    ...record,
    stages: [
      ...record.stages.filter(
        (stage) => stage.stageName !== tracking.stageName,
      ),
      tracking,
    ],
  };
}

function dateFromRoadmap(
  stage: ProcurementActivityRoadmapStage | undefined,
): TrackingDateValue {
  return {
    ethiopian: stage?.ethiopianDate ?? "",
    gregorian: stage?.gregorianDate ?? "",
  };
}

function emptyDate(): TrackingDateValue {
  return { ethiopian: "", gregorian: "" };
}

function StageEditor({
  onSave,
  onUpdate,
  record,
  roadmap,
  stage,
  tracking,
}: {
  onSave: (record: OfficerActivityTrackingRecord, message: string) => void;
  onUpdate: (changes: Partial<ActivityStageTracking>) => void;
  record: OfficerActivityTrackingRecord;
  roadmap: readonly ProcurementActivityRoadmapStage[];
  stage: ProcurementActivityRoadmapStage;
  tracking: ActivityStageTracking;
}) {
  const originalDate = dateFromRoadmap(stage);
  const targetDate = effectiveTargetDate(originalDate, tracking);
  const delay = calculateDelayDays(originalDate, tracking);
  const [stageError, setStageError] = useState("");
  const [revisionError, setRevisionError] = useState("");
  const [revisionReason, setRevisionReason] = useState("");
  const [revisedDate, setRevisedDate] =
    useState<TrackingDateValue>(emptyDate());

  function saveStage() {
    if (tracking.status === "Completed" && !tracking.actualDate?.gregorian) {
      setStageError("A completed stage must have an Actual Date.");
      return;
    }
    const orderError = actualDateOrderError(
      roadmap,
      record,
      stage.name,
      tracking.actualDate?.gregorian ?? "",
    );
    if (orderError) {
      setStageError(orderError);
      return;
    }
    setStageError("");
    onSave(withStageTracking(record, tracking), `${stage.name} updated.`);
  }

  function addRevision() {
    if (!originalDate.gregorian) {
      setRevisionError(
        "This stage has no approved baseline date, so it cannot be replanned here.",
      );
      return;
    }
    if (!revisedDate.gregorian) {
      setRevisionError("Select the revised target date.");
      return;
    }
    if (!revisionReason.trim()) {
      setRevisionError("A replanning reason is required.");
      return;
    }
    if (revisedDate.gregorian === targetDate.gregorian) {
      setRevisionError(
        "The revised target must differ from the current target.",
      );
      return;
    }

    const nextTracking: ActivityStageTracking = {
      ...tracking,
      revisions: [
        ...tracking.revisions,
        {
          createdAt: new Date().toISOString(),
          reason: revisionReason.trim(),
          revisionNumber: tracking.revisions.length + 1,
          targetDate: revisedDate,
        },
      ],
    };
    setRevisionError("");
    setRevisionReason("");
    setRevisedDate(emptyDate());
    onSave(
      withStageTracking(record, nextTracking),
      `Revision R${nextTracking.revisions.length} saved.`,
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#176c55]">
          Selected Stage
        </p>
        <h3 className="mt-1 text-sm font-extrabold leading-5 text-[#10243f]">
          {stage.name}
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-md border border-slate-200 bg-white p-3">
          <MiniDate label="Original" value={originalDate} />
          <MiniDate label="Current Target" value={targetDate} />
        </div>
        <p
          className={`mt-2 text-[10px] font-bold ${delay && delay > 0 ? "text-[#b42318]" : "text-[#047857]"}`}
        >
          {delay === null
            ? "Delay unavailable"
            : delay > 0
              ? `${delay} calendar days delayed`
              : "On target"}
        </p>
      </div>

      <div className="space-y-4 border-t border-slate-200 pt-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-[#176c55]" />
          <h4 className="text-xs font-extrabold text-[#10243f]">
            Record Stage Progress
          </h4>
        </div>
        <FieldSelect
          label="Stage Status"
          onChange={(value) => {
            const status = value as ActivityStageStatus;
            setStageError("");
            onUpdate({
              status,
              ...(status === "Not Applicable" ? { actualDate: undefined } : {}),
            });
          }}
          options={stageStatusOptions(stage)}
          value={tracking.status}
        />
        <DualCalendarField
          ethiopianValue={tracking.actualDate?.ethiopian ?? ""}
          gregorianValue={tracking.actualDate?.gregorian ?? ""}
          id="tracker-actual-date"
          label="Actual Date"
          onChange={(gregorian, ethiopian) => {
            setStageError("");
            onUpdate({
              actualDate: gregorian ? { ethiopian, gregorian } : undefined,
            });
          }}
          required={tracking.status === "Completed"}
        />
        <label className="block">
          <span className="mb-2 block text-[11px] font-bold text-slate-600">
            Stage Remarks
          </span>
          <textarea
            className="min-h-20 w-full resize-y rounded border border-slate-300 bg-white p-3 text-xs leading-5 text-slate-700 outline-none focus:border-[#176c55] focus:ring-2 focus:ring-[#176c55]/15"
            onChange={(event) => onUpdate({ remarks: event.target.value })}
            placeholder="Delay, rebid, issue, or completion note..."
            value={tracking.remarks}
          />
        </label>
        {stageError ? <ErrorMessage>{stageError}</ErrorMessage> : null}
        <button
          className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md bg-[#176c55] px-4 text-xs font-bold text-white hover:bg-[#125442]"
          onClick={saveStage}
          type="button"
        >
          <Save aria-hidden="true" className="h-3.5 w-3.5" /> Save Stage Update
        </button>
      </div>

      <div className="space-y-4 border-t border-slate-200 pt-4">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-[#176c55]" />
          <h4 className="text-xs font-extrabold text-[#10243f]">
            Controlled Replanning
          </h4>
        </div>
        <p className="text-[10px] leading-4 text-slate-500">
          Add a new target without replacing the approved baseline or earlier
          revisions.
        </p>
        <DualCalendarField
          ethiopianValue={revisedDate.ethiopian}
          gregorianValue={revisedDate.gregorian}
          id="tracker-revised-target"
          label="Revised Target Date"
          onChange={(gregorian, ethiopian) => {
            setRevisionError("");
            setRevisedDate({ ethiopian, gregorian });
          }}
          required
        />
        <label className="block">
          <span className="mb-2 block text-[11px] font-bold text-slate-600">
            Replanning Reason <span className="text-red-600">*</span>
          </span>
          <textarea
            className="min-h-20 w-full resize-y rounded border border-slate-300 bg-white p-3 text-xs leading-5 text-slate-700 outline-none focus:border-[#176c55] focus:ring-2 focus:ring-[#176c55]/15"
            onChange={(event) => {
              setRevisionError("");
              setRevisionReason(event.target.value);
            }}
            placeholder="Why does this stage need a new target?"
            value={revisionReason}
          />
        </label>
        {revisionError ? <ErrorMessage>{revisionError}</ErrorMessage> : null}
        <button
          className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-[#176c55] bg-white px-4 text-xs font-bold text-[#176c55] hover:bg-[#edf5f1] disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
          disabled={!originalDate.gregorian}
          onClick={addRevision}
          type="button"
        >
          <FileClock aria-hidden="true" className="h-3.5 w-3.5" /> Add Revision
        </button>

        {tracking.revisions.length > 0 ? (
          <div className="space-y-2 border-t border-slate-200 pt-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.06em] text-slate-500">
              Revision History
            </p>
            {[...tracking.revisions].reverse().map((revision) => (
              <div
                className="rounded border border-slate-200 bg-white p-3"
                key={revision.revisionNumber}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] font-bold text-[#176c55]">
                    R{revision.revisionNumber}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {formatDateTime(revision.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-[10px] font-bold text-slate-700">
                  {formatGregorianDate(revision.targetDate.gregorian)}
                </p>
                <p className="mt-1 text-[10px] leading-4 text-slate-500">
                  {revision.reason}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function actualDateOrderError(
  roadmap: readonly ProcurementActivityRoadmapStage[],
  record: OfficerActivityTrackingRecord,
  stageName: string,
  actualDate: string,
) {
  if (!actualDate) return "";
  const index = roadmap.findIndex((stage) => stage.name === stageName);
  for (let previousIndex = index - 1; previousIndex >= 0; previousIndex -= 1) {
    const previousStage = roadmap[previousIndex];
    const previousActual = record.stages.find(
      (stage) => stage.stageName === previousStage.name,
    )?.actualDate?.gregorian;
    if (previousActual && actualDate < previousActual) {
      return `Actual Date cannot be earlier than ${previousStage.name} (${formatGregorianDate(previousActual)}).`;
    }
  }
  return "";
}

function stageStatusOptions(stage: ProcurementActivityRoadmapStage) {
  const values: ActivityStageStatus[] = [
    "Not Started",
    "In Progress",
    "Completed",
  ];
  if (stage.allowNotApplicable) values.push("Not Applicable");
  return values;
}

function SectionHeading({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-[#c7d8cf] bg-[#edf5f1] px-4 py-3 text-[#176c55]">
      {icon}
      <h2 className="text-sm font-extrabold text-[#10243f]">{title}</h2>
    </div>
  );
}

function FieldSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: readonly string[];
  value: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-[11px] font-bold text-slate-600">
        {label}
      </span>
      <select
        className="h-10 w-full cursor-pointer rounded border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#176c55] focus:ring-2 focus:ring-[#176c55]/15"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function StageStatusBadge({ status }: { status: ActivityStageStatus }) {
  const tone = {
    Completed: {
      background: "#ecfdf5",
      borderColor: "#a7f3d0",
      color: "#047857",
    },
    "In Progress": {
      background: "#eff6ff",
      borderColor: "#bfdbfe",
      color: "#1d4ed8",
    },
    "Not Applicable": {
      background: "#f8fafc",
      borderColor: "#cbd5e1",
      color: "#475569",
    },
    "Not Started": {
      background: "#f8fafc",
      borderColor: "#cbd5e1",
      color: "#475569",
    },
  }[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[9px] font-bold"
      style={tone}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-current"
      />
      {status}
    </span>
  );
}

function LockedDateValue({ date }: { date: TrackingDateValue }) {
  return (
    <div className="flex items-start gap-2">
      <LockKeyhole
        aria-hidden="true"
        className="mt-0.5 h-3 w-3 shrink-0 text-slate-400"
      />
      <DateValue date={date} />
    </div>
  );
}

function DateValue({
  date,
  revised = false,
}: {
  date: TrackingDateValue;
  revised?: boolean;
}) {
  if (!date.gregorian) return <span className="text-slate-400">—</span>;
  return (
    <div>
      <p className="font-semibold text-slate-700">
        {formatGregorianDate(date.gregorian)}
      </p>
      {date.ethiopian ? (
        <p className="mt-1 text-[9px] text-slate-500">{date.ethiopian}</p>
      ) : null}
      {revised ? (
        <p className="mt-1 text-[9px] font-bold text-[#7c3aed]">Revised</p>
      ) : null}
    </div>
  );
}

function MiniDate({
  label,
  value,
}: {
  label: string;
  value: TrackingDateValue;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[8px] font-extrabold uppercase tracking-[0.06em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-[10px] font-bold text-slate-700">
        {value.gregorian
          ? formatGregorianDate(value.gregorian)
          : "Not recorded"}
      </p>
      {value.ethiopian ? (
        <p className="mt-0.5 truncate text-[9px] text-slate-500">
          {value.ethiopian}
        </p>
      ) : null}
    </div>
  );
}

function ErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="flex items-start gap-1.5 rounded border border-red-200 bg-red-50 px-3 py-2 text-[10px] leading-4 text-red-700"
      role="alert"
    >
      <AlertCircle aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      {children}
    </p>
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

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

import type {
  ProcurementActivityAllocation,
  ProcurementActivityRoadmapStage,
  ProcurementActivityStatus,
  ProcurementActivitySummary,
} from "@/features/projects/data/officerActivityDrafts";
import type {
  OfficerProject,
  ProcurementPlanSummary,
} from "@/features/projects/data/officerProjects";
import {
  ArrowLeft,
  CircleDot,
  ClipboardList,
  FolderOpen,
  House,
  MapPin,
  Route,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const statusTones: Record<
  ProcurementActivityStatus,
  { background: string; border: string; color: string }
> = {
  Completed: {
    background: "#ecfdf5",
    border: "#a7f3d0",
    color: "#047857",
  },
  Delayed: {
    background: "#fff1f0",
    border: "#fecaca",
    color: "#b42318",
  },
  "In Progress": {
    background: "#eff6ff",
    border: "#bfdbfe",
    color: "#1d4ed8",
  },
  "Not Started": {
    background: "#f8fafc",
    border: "#cbd5e1",
    color: "#475569",
  },
};

interface DetailValue {
  label: string;
  value: string;
}

export function OfficerProcurementActivityDetailView({
  activity,
  plan,
  project,
}: {
  activity: ProcurementActivitySummary;
  plan: ProcurementPlanSummary;
  project: OfficerProject;
}) {
  const planHref =
    "/workspace/projects?project=" +
    encodeURIComponent(project.code) +
    "&plan=" +
    encodeURIComponent(plan.reference);
  const tone = statusTones[activity.status];
  const details = activity.details;
  const form = details?.form;

  const keyDetails = compactValues([
    { label: "Procurement Category", value: activity.category },
    { label: "Procurement Method", value: activity.method },
    { label: "Specific Method / Approach", value: form?.specificMethod ?? "" },
    { label: "Market Approach", value: form?.marketApproach ?? "" },
    { label: "Contract Type", value: form?.contractType ?? "" },
    {
      label: "Procurement Document Type",
      value: form?.procurementDocumentType ?? "",
    },
    {
      label: "Qualification Approach",
      value: form?.qualificationApproach ?? "",
    },
    {
      label: "Domestic / Regional Preference",
      value: form?.domesticPreference ?? "",
    },
    { label: "Review Type", value: form?.reviewType ?? "" },
    {
      label: "Oversight Classification",
      value: form?.oversightClassification ?? "",
    },
    { label: "Procurement Process", value: form?.procurementProcess ?? "" },
    ...(form
      ? [
          {
            label: "Requires UN Agency Contracting",
            value: form.requiresUnAgency ? "Yes" : "No",
          },
          {
            label: "Activity Is In-Process",
            value: form.inProcess ? "Yes" : "No",
          },
        ]
      : []),
  ]);

  const relatedInformation = compactValues([
    { label: "Activity Reference", value: activity.reference },
    { label: "Activity Description", value: activity.description },
    {
      label: `Estimated Amount (${form?.currency || plan.currency})`,
      value: formatAmount(activity.estimatedAmount),
    },
    { label: "Currency", value: form?.currency ?? plan.currency },
    {
      label: "Primary Funding Source",
      value: form?.fundingSource ?? project.fundingSource,
    },
    { label: "Pricing Basis", value: form?.pricingBasis ?? "" },
    { label: "Subcomponent", value: form?.subcomponent ?? "" },
    {
      label: "Invitation / Bid Reference",
      value: form?.invitationReference ?? "",
    },
    ...(form
      ? [{ label: "Lot Required", value: form.lotRequired ? "Yes" : "No" }]
      : []),
    { label: "Description / Scope Notes", value: form?.scopeNotes ?? "" },
    { label: "Comments / Remarks", value: form?.comments ?? "" },
  ]);

  const additionalDetails = compactValues([
    {
      label: "Classification Code",
      value: form?.classificationCode ?? "",
    },
    {
      label: "Evaluation Option Code",
      value: form?.evaluationOptionCode ?? "",
    },
    { label: "High-Risk Code", value: form?.highRiskCode ?? "" },
    { label: "Location / Region", value: form?.location ?? "" },
    { label: "Latitude", value: form?.latitude ?? "" },
    { label: "Longitude", value: form?.longitude ?? "" },
  ]);

  const selectedComponents =
    details?.componentAllocations.filter((item) => item.selected) ?? [];
  const selectedFinancing =
    details?.financingAllocations.filter((item) => item.selected) ?? [];
  const signedContractIndex =
    details?.roadmap.findIndex((stage) => stage.name === "Signed Contract") ??
    -1;
  const planningStages =
    details?.roadmap.slice(
      0,
      signedContractIndex >= 0 ? signedContractIndex + 1 : undefined,
    ) ?? [];
  const monitoringStages =
    signedContractIndex >= 0
      ? (details?.roadmap.slice(signedContractIndex + 1) ?? [])
      : [];

  return (
    <div className="min-w-0 space-y-5 pb-6">
      <header>
        <ActivityBreadcrumb plan={plan} planHref={planHref} project={project} />
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#176c55]">
              Procurement Activity
            </p>
            <h1 className="mt-1 max-w-4xl text-2xl font-extrabold tracking-tight text-[#10243f]">
              {activity.description}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>
                Reference:{" "}
                <strong className="font-semibold text-[#1261a8]">
                  {activity.reference}
                </strong>
              </span>
              <span aria-hidden="true" className="text-slate-300">
                •
              </span>
              <StatusBadge status={activity.status} tone={tone} />
            </div>
          </div>
          <Link
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#07523f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176c55]"
            href={planHref}
          >
            <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
            Back to Plan
          </Link>
        </div>
      </header>

      <DetailCard
        icon={<ClipboardList aria-hidden="true" className="h-4 w-4" />}
        number={1}
        title="Key Details"
      >
        <DetailGrid values={keyDetails} />
      </DetailCard>

      <DetailCard
        icon={<FolderOpen aria-hidden="true" className="h-4 w-4" />}
        number={2}
        title="Related Information"
      >
        <section className="rounded-md border border-[#cfd8e8] bg-[#f2f5ff] p-3">
          <h3 className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#07523f]">
            <FolderOpen aria-hidden="true" className="h-3.5 w-3.5" />
            Inherited Project &amp; Plan Context
          </h3>
          <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem label="Project" value={project.name} />
            <DetailItem label="Project Code" value={project.code} />
            <DetailItem label="Procurement Plan" value={plan.name} />
            <DetailItem label="Plan Reference" value={plan.reference} />
            <DetailItem label="Fiscal Year" value={plan.budgetYear} />
            <DetailItem
              label="Responsible Officer"
              value={project.assignedOfficers[0] ?? "Not assigned"}
            />
          </dl>
        </section>

        <div className="mt-4">
          <DetailGrid values={relatedInformation} />
        </div>

        {details?.lots.length ? (
          <CompactTable
            columns={[
              "Lot Number",
              "Description",
              `Amount (${form?.currency})`,
            ]}
            rows={details.lots.map((lot) => [
              lot.number,
              lot.description,
              formatAmount(Number(lot.amount)),
            ])}
            title="Lots"
          />
        ) : null}
      </DetailCard>

      <DetailCard
        icon={<MapPin aria-hidden="true" className="h-4 w-4" />}
        number={3}
        title="Additional Details"
      >
        {selectedComponents.length ? (
          <AllocationList
            allocations={selectedComponents}
            title="Project Component Allocation"
          />
        ) : null}
        {selectedFinancing.length ? (
          <AllocationList
            allocations={selectedFinancing}
            title="Financing Allocation"
          />
        ) : null}
        {additionalDetails.length ? (
          <div
            className={
              selectedComponents.length || selectedFinancing.length
                ? "mt-5 border-t border-slate-200 pt-4"
                : ""
            }
          >
            <DetailGrid values={additionalDetails} />
          </div>
        ) : null}
        {!details ? (
          <UnavailableNote>
            No additional-information submission is stored for this existing
            activity.
          </UnavailableNote>
        ) : null}
      </DetailCard>

      <DetailCard
        icon={<Route aria-hidden="true" className="h-4 w-4" />}
        number={4}
        title="Roadmap"
      >
        {planningStages.length ? (
          <RoadmapTable
            allStages={details?.roadmap ?? []}
            stages={planningStages}
            title="Procurement Planning Roadmap"
          />
        ) : (
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Current Stage" value={activity.currentStage} />
            <DetailItem label="Status" value={activity.status} />
          </dl>
        )}
        {monitoringStages.length ? (
          <div className="mt-4">
            <RoadmapTable
              allStages={details?.roadmap ?? []}
              stages={monitoringStages}
              title="Procurement Monitoring"
            />
          </div>
        ) : null}
      </DetailCard>
    </div>
  );
}

function ActivityBreadcrumb({
  plan,
  planHref,
  project,
}: {
  plan: ProcurementPlanSummary;
  planHref: string;
  project: OfficerProject;
}) {
  return (
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
        <li aria-hidden="true">/</li>
        <li>
          <Link className="hover:text-[#176c55]" href="/workspace/projects">
            Projects
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link
            className="hover:text-[#176c55]"
            href={`/workspace/projects?project=${encodeURIComponent(project.code)}`}
          >
            {project.shortName}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link
            className="max-w-60 truncate hover:text-[#176c55]"
            href={planHref}
          >
            {plan.name}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page" className="font-semibold text-slate-800">
          Activity Details
        </li>
      </ol>
    </nav>
  );
}

function DetailCard({
  children,
  icon,
  number,
  title,
}: {
  children: ReactNode;
  icon: ReactNode;
  number: number;
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
      <header className="flex items-center gap-2 border-b border-[#c7d8d1] bg-[#edf5f1] px-4 py-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#176c55] text-[10px] font-extrabold text-white">
          {number}
        </span>
        <span className="text-[#176c55]">{icon}</span>
        <h2 className="text-sm font-extrabold text-[#10243f]">{title}</h2>
      </header>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function DetailGrid({ values }: { values: DetailValue[] }) {
  return (
    <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
      {values.map((item) => (
        <DetailItem key={item.label} {...item} />
      ))}
    </dl>
  );
}

function DetailItem({ label, value }: DetailValue) {
  return (
    <div className="min-w-0">
      <dt className="text-[9px] font-bold uppercase tracking-[0.07em] text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 break-words text-xs font-semibold leading-5 text-slate-800">
        {value}
      </dd>
    </div>
  );
}

function StatusBadge({
  status,
  tone,
}: {
  status: ProcurementActivityStatus;
  tone: { background: string; border: string; color: string };
}) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold"
      style={{
        backgroundColor: tone.background,
        borderColor: tone.border,
        color: tone.color,
      }}
    >
      <CircleDot aria-hidden="true" className="h-3 w-3" />
      {status}
    </span>
  );
}

function AllocationList({
  allocations,
  title,
}: {
  allocations: ProcurementActivityAllocation[];
  title: string;
}) {
  return (
    <section className="mb-4 last:mb-0">
      <h3 className="text-[10px] font-extrabold text-slate-700">{title}</h3>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {allocations.map((allocation) => (
          <div
            className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-[#fbfcfd] px-3 py-2"
            key={allocation.id}
          >
            <span className="min-w-0 break-words text-[10px] font-semibold text-slate-700">
              {allocation.id}
            </span>
            <span className="shrink-0 rounded bg-[#e8f5ef] px-2 py-0.5 text-[10px] font-bold text-[#047857]">
              {allocation.percent}%
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CompactTable({
  columns,
  rows,
  title,
}: {
  columns: string[];
  rows: string[][];
  title: string;
}) {
  return (
    <section className="mt-5 overflow-hidden rounded-md border border-slate-300">
      <h3 className="border-b border-slate-300 bg-[#f6f7fb] px-3 py-2 text-[10px] font-extrabold text-slate-800">
        {title}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-[#fbfcfd]">
              {columns.map((column) => (
                <th
                  className="px-3 py-2 text-[9px] font-extrabold uppercase tracking-[0.04em] text-slate-500"
                  key={column}
                  scope="col"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row, rowIndex) => (
              <tr key={row.join("-") || rowIndex}>
                {row.map((value, valueIndex) => (
                  <td
                    className="px-3 py-2 text-[10px] leading-4 text-slate-700"
                    key={columns[valueIndex]}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RoadmapTable({
  allStages,
  stages,
  title,
}: {
  allStages: ProcurementActivityRoadmapStage[];
  stages: ProcurementActivityRoadmapStage[];
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-md border border-slate-300">
      <h3 className="border-b border-slate-300 bg-[#f6f7fb] px-3 py-2 text-[10px] font-extrabold text-slate-800">
        {title}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[46rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-[#fbfcfd]">
              <th className="w-[34%] px-3 py-2" scope="col">
                Stage
              </th>
              <th className="w-[31%] px-3 py-2" scope="col">
                Original Planned Date (GC / EC)
              </th>
              <th className="w-[12%] px-3 py-2" scope="col">
                Duration
              </th>
              <th className="w-[13%] px-3 py-2" scope="col">
                Type
              </th>
              <th className="w-[10%] px-3 py-2" scope="col">
                N/A
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {stages.map((stage) => (
              <tr
                className={stage.notApplicable ? "bg-slate-50" : ""}
                key={stage.name}
              >
                <td className="px-3 py-2 text-[10px] font-semibold text-slate-700">
                  {stage.name}
                  {stage.remarks ? (
                    <span className="mt-0.5 block font-normal text-slate-500">
                      {stage.remarks}
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2 text-[10px] text-slate-700">
                  {stage.notApplicable
                    ? "Not applicable"
                    : formatRoadmapDate(stage)}
                </td>
                <td className="px-3 py-2 text-[10px] text-slate-500">
                  {stage.notApplicable ? "—" : formatDuration(allStages, stage)}
                </td>
                <td className="px-3 py-2 text-[10px] text-slate-500">
                  {stage.allowNotApplicable ? "Conditional" : "Required"}
                </td>
                <td className="px-3 py-2 text-[10px] font-semibold text-slate-500">
                  {stage.notApplicable ? "Yes" : "No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function UnavailableNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-[10px] leading-4 text-slate-500">
      {children}
    </p>
  );
}

function compactValues(values: DetailValue[]) {
  return values.filter((item) => item.value.trim().length > 0);
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
}

function formatRoadmapDate(stage: ProcurementActivityRoadmapStage) {
  const gregorian = stage.gregorianDate
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        timeZone: "UTC",
        year: "numeric",
      })
        .format(new Date(`${stage.gregorianDate}T00:00:00Z`))
        .replaceAll(" ", "-")
    : "Date not recorded";
  return stage.ethiopianDate
    ? `${gregorian} (${stage.ethiopianDate})`
    : gregorian;
}

function formatDuration(
  allStages: ProcurementActivityRoadmapStage[],
  stage: ProcurementActivityRoadmapStage,
) {
  const currentIndex = allStages.findIndex((item) => item.name === stage.name);
  if (!stage.gregorianDate || currentIndex < 0) return "—";

  const previousStage = allStages
    .slice(0, currentIndex)
    .reverse()
    .find((item) => !item.notApplicable && item.gregorianDate);
  if (!previousStage) return "0 days";

  const currentDate = Date.parse(`${stage.gregorianDate}T00:00:00Z`);
  const previousDate = Date.parse(`${previousStage.gregorianDate}T00:00:00Z`);
  if (!Number.isFinite(currentDate) || !Number.isFinite(previousDate)) {
    return "—";
  }
  return `${Math.round((currentDate - previousDate) / 86_400_000)} days`;
}

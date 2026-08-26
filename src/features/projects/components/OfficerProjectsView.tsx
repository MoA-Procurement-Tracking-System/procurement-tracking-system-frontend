"use client";

import { StatusText } from "../../../components/dashboard/StatusText";
import { CreateProcurementActivityView } from "@/features/projects/components/CreateProcurementActivityView";
import { CreateProcurementPlanView } from "@/features/projects/components/CreateProcurementPlanView";
import { OfficerProcurementActivityDetailView } from "@/features/projects/components/OfficerProcurementActivityDetailView";
import {
  getPlanActivities,
  OfficerProcurementPlanDetailView,
} from "@/features/projects/components/OfficerProcurementPlanDetailView";
import { OfficerProjectDetailView } from "@/features/projects/components/OfficerProjectDetailView";
import {
  addSavedActivityRecord,
  OFFICER_ACTIVITY_DRAFTS_STORAGE_KEY,
  parseSavedActivityRecords,
  type ProcurementActivitySummary,
  type SavedOfficerActivityRecord,
} from "@/features/projects/data/officerActivityDrafts";
import {
  addSavedPlanRecord,
  createDraftPlan,
  mergeSavedPlans,
  OFFICER_PLAN_DRAFTS_STORAGE_KEY,
  parseSavedPlanRecords,
  type ProcurementPlanDraftInput,
  type SavedOfficerPlanRecord,
} from "@/features/projects/data/officerPlanDrafts";
import {
  officerProjects,
  type OfficerProject,
  type ProjectStatus,
} from "@/features/projects/data/officerProjects";
import { ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

export function OfficerProjectsView({
  fromTracker,
  mode,
  selectedActivityReference,
  selectedPlanReference,
  selectedProjectCode,
}: {
  fromTracker?: boolean;
  mode?: "create-activity" | "create-plan";
  selectedActivityReference?: string;
  selectedPlanReference?: string;
  selectedProjectCode?: string;
}) {
  const router = useRouter();
  const [savedPlanRecords, setSavedPlanRecords] = useState<
    SavedOfficerPlanRecord[]
  >([]);
  const [savedActivityRecords, setSavedActivityRecords] = useState<
    SavedOfficerActivityRecord[]
  >([]);

  useEffect(() => {
    const loadSavedRecords = window.setTimeout(() => {
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
    }, 0);

    return () => window.clearTimeout(loadSavedRecords);
  }, []);

  const projects = useMemo(
    () => mergeSavedPlans(officerProjects, savedPlanRecords),
    [savedPlanRecords],
  );
  const selectedProject = projects.find(
    (project) => project.code === selectedProjectCode,
  );
  const selectedPlan = selectedProject?.plans.find(
    (plan) => plan.reference === selectedPlanReference,
  );
  const selectedPlanActivities = savedActivityRecords
    .filter(
      (record) =>
        record.projectCode === selectedProject?.code &&
        record.planReference === selectedPlan?.reference,
    )
    .map((record) => record.activity);
  const selectedActivity =
    selectedProject && selectedPlan && selectedActivityReference
      ? getPlanActivities(
          selectedProject,
          selectedPlan,
          selectedPlanActivities,
        ).find((activity) => activity.reference === selectedActivityReference)
      : undefined;

  function savePlan(
    input: ProcurementPlanDraftInput,
    action: "activity" | "draft",
  ) {
    if (!selectedProject) return;

    const existingPlan = selectedProject.plans.find(
      (plan) =>
        plan.status === "Draft" &&
        plan.name === input.planName.trim() &&
        plan.budgetYear === `${input.budgetYear} EFY` &&
        plan.category === input.category,
    );

    let planForNavigation = existingPlan;

    if (!planForNavigation) {
      planForNavigation = createDraftPlan(selectedProject, input);
      const nextRecords = addSavedPlanRecord(savedPlanRecords, {
        plan: planForNavigation,
        projectCode: selectedProject.code,
      });

      setSavedPlanRecords(nextRecords);
      window.localStorage.setItem(
        OFFICER_PLAN_DRAFTS_STORAGE_KEY,
        JSON.stringify(nextRecords),
      );
    }

    if (action === "activity") {
      router.push(
        "/workspace/projects?project=" +
          encodeURIComponent(selectedProject.code) +
          "&plan=" +
          encodeURIComponent(planForNavigation.reference) +
          "&mode=create-activity",
      );
      return;
    }

    router.push(
      "/workspace/projects?project=" + encodeURIComponent(selectedProject.code),
    );
  }

  function saveActivity(activity: ProcurementActivitySummary) {
    if (!selectedProject || !selectedPlan) return;

    const nextRecords = addSavedActivityRecord(savedActivityRecords, {
      activity,
      planReference: selectedPlan.reference,
      projectCode: selectedProject.code,
    });
    setSavedActivityRecords(nextRecords);
    window.localStorage.setItem(
      OFFICER_ACTIVITY_DRAFTS_STORAGE_KEY,
      JSON.stringify(nextRecords),
    );
    router.push(
      "/workspace/projects?project=" +
        encodeURIComponent(selectedProject.code) +
        "&plan=" +
        encodeURIComponent(selectedPlan.reference),
    );
  }

  if (selectedProject && mode === "create-plan") {
    return (
      <CreateProcurementPlanView
        onSavePlan={savePlan}
        project={selectedProject}
      />
    );
  }

  if (selectedProject && selectedPlan && mode === "create-activity") {
    return (
      <CreateProcurementActivityView
        existingActivityCount={
          selectedPlan.activities + selectedPlanActivities.length
        }
        onSaveActivity={saveActivity}
        plan={selectedPlan}
        project={selectedProject}
      />
    );
  }

  if (selectedProject && selectedPlan && selectedActivity) {
    return (
      <OfficerProcurementActivityDetailView
        activity={selectedActivity}
        fromTracker={fromTracker}
        plan={selectedPlan}
        project={selectedProject}
      />
    );
  }

  if (selectedProject && selectedPlan) {
    return (
      <OfficerProcurementPlanDetailView
        plan={selectedPlan}
        project={selectedProject}
        savedActivities={selectedPlanActivities}
      />
    );
  }

  if (selectedProject) {
    return <OfficerProjectDetailView project={selectedProject} />;
  }

  return <OfficerProjectsList projects={projects} />;
}

function OfficerProjectsList({
  projects,
}: {
  projects: readonly OfficerProject[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [fundingSource, setFundingSource] = useState("all");
  const [status, setStatus] = useState<"all" | ProjectStatus>("all");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const fundingSources = useMemo(
    () => [...new Set(projects.map((project) => project.fundingSource))],
    [projects],
  );

  const filteredProjects = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          project.name,
          project.code,
          project.fundingSource,
          project.organizationRegion ?? "",
        ].some((value) => value.toLowerCase().includes(normalizedSearch));
      const matchesFunding =
        fundingSource === "all" || project.fundingSource === fundingSource;
      const matchesStatus = status === "all" || project.status === status;

      return matchesSearch && matchesFunding && matchesStatus;
    });
  }, [fundingSource, projects, searchQuery, status]);

  const resultCount = filteredProjects.length;
  const entrySummary =
    resultCount === 0
      ? "Showing 0 entries"
      : `Showing 1 to ${resultCount} of ${resultCount} entries`;

  return (
    <div className="space-y-5 pb-6">
      <header>
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
          <ol className="flex items-center gap-2">
            <li>
              <Link
                className="hover:text-[#176c55] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176c55]"
                href="/dashboard/officer"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-slate-300">
              /
            </li>
            <li aria-current="page" className="font-semibold text-slate-800">
              Projects
            </li>
          </ol>
        </nav>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#10243f]">
          My Projects
        </h1>
        <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-600">
          Overview of projects specifically assigned to your account for
          procurement planning and tracking.
        </p>
      </header>

      <section
        aria-label="Project filters"
        className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="block md:min-w-0 md:max-w-[25rem] md:flex-1">
            <span className="sr-only">Search projects</span>
            <span
              className="flex h-11 cursor-text items-center gap-3 rounded-lg border border-slate-300 bg-[#fbfcfd] px-3.5 focus-within:border-[#348267] focus-within:bg-white focus-within:ring-3 focus-within:ring-[#348267]/15"
              onClick={() => searchInputRef.current?.focus()}
            >
              <Search
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-slate-500"
              />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search projects..."
                ref={searchInputRef}
                spellCheck={false}
                style={{
                  appearance: "none",
                  background: "transparent",
                  border: 0,
                  boxShadow: "none",
                  margin: 0,
                  minWidth: 0,
                  outline: "none",
                  padding: 0,
                  width: "100%",
                  WebkitAppearance: "none",
                }}
                type="search"
                value={searchQuery}
              />
            </span>
          </label>

          <label className="relative block md:w-52 md:shrink-0">
            <span className="sr-only">Filter by funding source</span>
            <select
              className="h-11 w-full appearance-none rounded-lg border border-slate-300 bg-[#fbfcfd] px-3 pr-9 text-sm font-medium text-slate-700 outline-none focus:border-[#348267] focus:bg-white focus:ring-3 focus:ring-[#348267]/15"
              onChange={(event) => setFundingSource(event.target.value)}
              style={{
                appearance: "none",
                paddingRight: "3rem",
                WebkitAppearance: "none",
              }}
              value={fundingSource}
            >
              <option value="all">Funding Source</option>
              {fundingSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none h-4 w-4 text-slate-500"
              style={{
                position: "absolute",
                right: "0.875rem",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
          </label>

          <label className="relative block md:w-40 md:shrink-0">
            <span className="sr-only">Filter by project status</span>
            <select
              className="h-11 w-full appearance-none rounded-lg border border-slate-300 bg-[#fbfcfd] px-3 pr-9 text-sm font-medium text-slate-700 outline-none focus:border-[#348267] focus:bg-white focus:ring-3 focus:ring-[#348267]/15"
              onChange={(event) =>
                setStatus(event.target.value as "all" | ProjectStatus)
              }
              style={{
                appearance: "none",
                paddingRight: "3rem",
                WebkitAppearance: "none",
              }}
              value={status}
            >
              <option value="all">Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none h-4 w-4 text-slate-500"
              style={{
                position: "absolute",
                right: "0.875rem",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
          </label>
        </div>
      </section>

      <section
        aria-labelledby="projects-table-title"
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <h2 className="sr-only" id="projects-table-title">
          Assigned projects
        </h2>
        <div
          aria-label="Assigned projects table"
          className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#176c55]"
          role="region"
          tabIndex={0}
        >
          <table className="w-full min-w-[78rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-[#edf5f1] text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#24364d]">
                <th className="w-[31%] px-4 py-4" scope="col">
                  Project name
                </th>
                <th className="w-[9%] px-4 py-4" scope="col">
                  Code
                </th>
                <th className="w-[12%] px-4 py-4" scope="col">
                  Funding source
                </th>
                <th className="w-[12%] px-4 py-4" scope="col">
                  Organization / region
                </th>
                <th className="w-[15%] px-4 py-4" scope="col">
                  Assignment start
                </th>
                <th className="w-[8%] px-4 py-4 text-center" scope="col">
                  Active plans
                </th>
                <th className="w-[6%] px-4 py-4" scope="col">
                  Status
                </th>
                <th className="w-[5%] px-4 py-4 text-right" scope="col">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <tr key={project.code} className="hover:bg-[#f8fbf9]">
                    <td className="px-4 py-4">
                      <Link
                        className="font-semibold leading-5 text-slate-900 underline-offset-4 hover:text-[#176c55] hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176c55]"
                        href={`/workspace/projects?project=${encodeURIComponent(
                          project.code,
                        )}`}
                      >
                        {project.name}
                      </Link>
                      <p className="mt-1 text-[11px] font-medium text-slate-500">
                        {project.code}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-mono text-xs font-semibold text-slate-500">
                      {project.code}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {project.fundingSource}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {project.organizationRegion ?? "Not provided"}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-slate-700">
                        {project.assignmentStart.gregorian}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {project.assignmentStart.ethiopian}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-center text-sm font-bold text-slate-800">
                      {project.activePlans}
                    </td>
                    <td className="px-4 py-4">
                      <StatusText className="text-xs" label={project.status} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        aria-label={`Open ${project.name}`}
                        className="text-sm font-semibold text-[#1261a8] underline-offset-4 hover:text-[#07523f] hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#07523f]"
                        href={`/workspace/projects?project=${encodeURIComponent(
                          project.code,
                        )}`}
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-4 py-12 text-center text-sm text-slate-500"
                    colSpan={8}
                  >
                    No projects match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex items-center justify-between gap-4 border-t border-slate-200 bg-[#fbfcfd] px-4 py-4 text-xs text-slate-500">
          <p aria-live="polite">{entrySummary}</p>
          <div aria-label="Project table pagination" className="flex gap-1.5">
            <button
              aria-label="Previous page"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-300"
              disabled
              type="button"
            >
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            </button>
            <button
              aria-label="Next page"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-300"
              disabled
              type="button"
            >
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}

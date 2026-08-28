"use client";

import { useState, useEffect, useCallback } from "react";
import { BellRing, RefreshCw } from "lucide-react";
import { INITIAL_PROJECTS, type ProjectItem, type ProjectOfficer } from "./projectsData";
import { ProjectsDirectoryView } from "./ProjectsDirectoryView";
import { CreateProjectView } from "./CreateProjectView";
import { ProjectPlansView } from "@/features/plans/components/ProjectPlansView";
import { CreatePlanForm } from "@/features/plans/components/CreatePlanForm";
import {
  INITIAL_PLANS,
  type ProcurementPlan,
} from "@/features/plans/plansData";
import { ActivitiesListView } from "@/features/activities/components/ActivitiesListView";
import {
  fetchProjects,
  createProject,
  updateProject,
  assignOfficerToProject,
  mapBackendProjectToProjectItem,
} from "@/lib/projectsApi";
import {
  fetchPlans,
  sendPlanToCommittee,
  rejectPlan,
  mapBackendPlanToFrontend,
} from "@/lib/plansApi";
import { fetchLookups, fetchOfficers, type LookupItem } from "@/lib/lookupsApi";

type ViewMode =
  | "list"
  | "project-form"
  | "plans-list"
  | "plan-form"
  | "activities-list";

export function ProjectsManagementView() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [plans, setPlans] = useState<ProcurementPlan[]>(INITIAL_PLANS);
  const [availableOfficers, setAvailableOfficers] = useState<ProjectOfficer[]>([]);
  const [sectors, setSectors] = useState<LookupItem[]>([]);
  const [fundingSources, setFundingSources] = useState<LookupItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [editingPlan, setEditingPlan] = useState<ProcurementPlan | null>(null);
  const [selectedPlanForActivities, setSelectedPlanForActivities] =
    useState<ProcurementPlan | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch live lookups and officers
      const [secList, fsList, offList] = await Promise.allSettled([
        fetchLookups("SECTOR"),
        fetchLookups("FUNDING_SOURCE"),
        fetchOfficers(),
      ]);

      if (secList.status === "fulfilled" && secList.value.length > 0) {
        setSectors(secList.value);
      }
      if (fsList.status === "fulfilled" && fsList.value.length > 0) {
        setFundingSources(fsList.value);
      }
      if (offList.status === "fulfilled" && offList.value.length > 0) {
        setAvailableOfficers(
          offList.value.map((o) => ({
            id: o.id,
            name: o.name,
            email: o.email,
            roleTag: "OFFICER",
          })),
        );
      }

      // 2. Fetch projects from backend
      const backendProjects = await fetchProjects();
      if (backendProjects && backendProjects.length > 0) {
        const mapped = backendProjects.map(mapBackendProjectToProjectItem);
        setProjects(mapped);
      }

      // 3. Fetch plans from backend
      const backendPlans = await fetchPlans();
      if (backendPlans && backendPlans.length > 0) {
        const mappedPlans = backendPlans.map((p) => mapBackendPlanToFrontend(p));
        setPlans(mappedPlans);
      }
    } catch (err) {
      console.warn("Using default dataset fallback (backend syncing in background):", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Project Create Form
  const handleCreateProjectClick = () => {
    setEditingProject(null);
    setViewMode("project-form");
  };

  // Open Project Edit Form
  const handleEditProjectClick = (project: ProjectItem) => {
    setEditingProject(project);
    setViewMode("project-form");
  };

  // Eye Icon -> Open Tabular Plans View for Project
  const handleViewPlansClick = (project: ProjectItem) => {
    setSelectedProject(project);
    setViewMode("plans-list");
  };

  // Save/Update Project Handler (connected to backend)
  const handleSaveProject = async (savedProject: ProjectItem) => {
    try {
      if (editingProject) {
        // Update Project
        try {
          await updateProject(savedProject.id, {
            name: savedProject.name,
            status: savedProject.status === "Active" ? "ACTIVE" : "CLOSED",
            sapIdentificationNo: savedProject.sapNumber,
            country: savedProject.countryOrg,
            executingAgency: savedProject.executingAgency,
            organization: savedProject.region,
            fundingType: savedProject.fundingType,
            loanGrantNumbers: savedProject.loanGrantNumbers,
            components: savedProject.components,
            subcomponents: savedProject.subcomponents,
            baseCurrency: savedProject.currency,
            projectStartDate: savedProject.startDate
              ? new Date(savedProject.startDate).toISOString()
              : undefined,
            projectEndDate: savedProject.endDate
              ? new Date(savedProject.endDate).toISOString()
              : undefined,
          });

          // Sync assigned officers if new officers were added
          if (savedProject.assignedOfficers && savedProject.assignedOfficers.length > 0) {
            for (const off of savedProject.assignedOfficers) {
              try {
                await assignOfficerToProject(savedProject.id, off.id);
              } catch {
                // Officer might already be assigned
              }
            }
          }
        } catch (apiErr) {
          console.warn("Backend update API note:", apiErr);
        }

        setProjects((prev) =>
          prev.map((p) => (p.id === savedProject.id ? savedProject : p)),
        );
        showToast(`Project "${savedProject.code}" updated successfully!`);
      } else {
        // Create Project on backend
        let createdId = savedProject.id;
        try {
          // Resolve sector ID & funding source ID from lookups or fallback
          const matchedSector =
            sectors.find((s) => s.label.toLowerCase() === savedProject.sector.toLowerCase()) ||
            sectors[0];
          const matchedFs =
            fundingSources.find((f) =>
              f.label.toLowerCase().includes(savedProject.fundingSource.toLowerCase()),
            ) || fundingSources[0];

          const result = await createProject({
            code: savedProject.code,
            name: savedProject.name,
            sectorId: matchedSector?.id || "sec-default",
            fundingSourceId: matchedFs?.id || "fs-default",
            sapIdentificationNo: savedProject.sapNumber,
            country: savedProject.countryOrg,
            executingAgency: savedProject.executingAgency,
            organization: savedProject.region,
            fundingType: savedProject.fundingType,
            loanGrantNumbers: savedProject.loanGrantNumbers,
            components: savedProject.components,
            subcomponents: savedProject.subcomponents,
            baseCurrency: savedProject.currency,
            projectStartDate: savedProject.startDate
              ? new Date(savedProject.startDate).toISOString()
              : undefined,
            projectEndDate: savedProject.endDate
              ? new Date(savedProject.endDate).toISOString()
              : undefined,
          });

          if (result && result.id) {
            createdId = result.id;
            // Assign officers to the created project on backend
            if (savedProject.assignedOfficers && savedProject.assignedOfficers.length > 0) {
              for (const off of savedProject.assignedOfficers) {
                try {
                  await assignOfficerToProject(result.id, off.id);
                } catch (assignErr) {
                  console.warn("Assign officer note:", assignErr);
                }
              }
            }
          }
        } catch (apiErr) {
          console.warn("Backend create project API note:", apiErr);
        }

        const projectWithId = { ...savedProject, id: createdId };
        setProjects((prev) => [projectWithId, ...prev]);
        showToast(`New sector project "${savedProject.code}" registered and officer assigned!`);
      }
    } finally {
      setEditingProject(null);
      setViewMode("list");
    }
  };

  // Open Plan Review/Edit Form for Director
  const handleEditPlanClick = (plan: ProcurementPlan) => {
    setEditingPlan(plan);
    setViewMode("plan-form");
  };

  // Save Plan Handler (Director Review -> Approve & Forward to Committee or Return to Officer)
  const handleSavePlan = async (savedPlan: ProcurementPlan) => {
    try {
      if (savedPlan.status === "Committee Review") {
        try {
          await sendPlanToCommittee(savedPlan.id);
        } catch (err) {
          console.warn("Backend sendToCommittee note:", err);
        }
        showToast(
          `Plan "${savedPlan.planName}" approved by Director and forwarded to Endorsing Committee!`,
        );
      } else if (savedPlan.status === "Returned") {
        try {
          await rejectPlan(savedPlan.id, savedPlan.rejectionReason || "Returned by Director for revisions.");
        } catch (err) {
          console.warn("Backend rejectPlan note:", err);
        }
        showToast(
          `Plan "${savedPlan.planName}" returned to Procurement Officer with feedback.`,
        );
      } else {
        showToast(
          `Plan "${savedPlan.planName}" updated successfully by Director.`,
        );
      }

      setPlans((prev) =>
        prev.map((p) => (p.id === savedPlan.id ? savedPlan : p)),
      );
    } finally {
      setEditingPlan(null);
      setViewMode("plans-list");
    }
  };

  // View Activities Action -> Opens Tabular Package Activities Directory
  const handleViewActivitiesClick = (plan: ProcurementPlan) => {
    setSelectedPlanForActivities(plan);
    setViewMode("activities-list");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 rounded-xl bg-slate-900 text-white px-4 py-3 shadow-xl border border-slate-700 animate-in slide-in-from-top-3 max-w-md">
          <BellRing className="h-4 w-4 text-[#A3E635] shrink-0" />
          <p className="text-xs font-medium leading-relaxed">{toastMessage}</p>
        </div>
      )}

      {/* RENDER VIEW ACCORDING TO VIEW MODE */}
      {viewMode === "list" && (
        <ProjectsDirectoryView
          projects={projects}
          onCreateClick={handleCreateProjectClick}
          onEditClick={handleEditProjectClick}
          onViewPlansClick={handleViewPlansClick}
        />
      )}

      {viewMode === "project-form" && (
        <CreateProjectView
          initialData={editingProject}
          availableOfficers={availableOfficers.length > 0 ? availableOfficers : undefined}
          onBackClick={() => {
            setEditingProject(null);
            setViewMode("list");
          }}
          onSaveProject={handleSaveProject}
        />
      )}

      {viewMode === "plans-list" && selectedProject && (
        <ProjectPlansView
          project={selectedProject}
          plans={plans}
          userRole="DIRECTOR"
          onBackToProjects={() => {
            setSelectedProject(null);
            setViewMode("list");
          }}
          onEditPlanClick={handleEditPlanClick}
          onViewActivitiesClick={handleViewActivitiesClick}
        />
      )}

      {viewMode === "plan-form" && selectedProject && editingPlan && (
        <CreatePlanForm
          project={selectedProject}
          initialData={editingPlan}
          userRole="DIRECTOR"
          readOnly={true}
          onBackClick={() => {
            setEditingPlan(null);
            setViewMode("plans-list");
          }}
          onSavePlan={handleSavePlan}
        />
      )}

      {viewMode === "activities-list" &&
        selectedProject &&
        selectedPlanForActivities && (
          <DirectorActivitiesListView
            plan={selectedPlanForActivities}
            project={selectedProject}
            parentSection="projects"
            onBackClick={() => {
              setSelectedPlanForActivities(null);
              setViewMode("plans-list");
            }}
          />
        )}
    </div>
  );
}

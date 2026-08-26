"use client";

import { useState } from "react";
import { BellRing } from "lucide-react";
import { INITIAL_PROJECTS, type ProjectItem } from "./projectsData";
import { ProjectsDirectoryView } from "./ProjectsDirectoryView";
import { CreateProjectView } from "./CreateProjectView";
import { ProjectPlansView } from "@/features/plans/components/ProjectPlansView";
import { CreatePlanForm } from "@/features/plans/components/CreatePlanForm";
import {
  INITIAL_PLANS,
  type ProcurementPlan,
} from "@/features/plans/plansData";

import { DirectorActivitiesListView } from "@/features/activities/components/DirectorActivitiesListView";

type ViewMode =
  "list" | "project-form" | "plans-list" | "plan-form" | "activities-list";

export function ProjectsManagementView() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [plans, setPlans] = useState<ProcurementPlan[]>(INITIAL_PLANS);

  const [editingProject, setEditingProject] = useState<ProjectItem | null>(
    null,
  );
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(
    null,
  );
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

  // Save/Update Project Handler
  const handleSaveProject = (savedProject: ProjectItem) => {
    if (editingProject) {
      setProjects((prev) =>
        prev.map((p) => (p.id === savedProject.id ? savedProject : p)),
      );
      showToast(`Project "${savedProject.code}" updated successfully!`);
    } else {
      setProjects((prev) => [savedProject, ...prev]);
      showToast(`New sector project "${savedProject.code}" registered!`);
    }
    setEditingProject(null);
    setViewMode("list");
  };

  // Open Plan Review/Edit Form for Director
  const handleEditPlanClick = (plan: ProcurementPlan) => {
    setEditingPlan(plan);
    setViewMode("plan-form");
  };

  // Open Activities View under particular plan
  const handleViewActivitiesClick = (plan: ProcurementPlan) => {
    setSelectedPlanForActivities(plan);
    setViewMode("activities-list");
  };

  // Save Plan Edits
  const handleSavePlan = (savedPlan: ProcurementPlan) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === savedPlan.id ? savedPlan : p)),
    );
    setEditingPlan(null);
    setViewMode("plans-list");
    showToast(`Plan "${savedPlan.planName}" updated!`);
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
          onBackClick={() => setViewMode("list")}
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

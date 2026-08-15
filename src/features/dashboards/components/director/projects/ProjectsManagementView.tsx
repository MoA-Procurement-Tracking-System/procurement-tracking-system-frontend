"use client";

import { useState } from "react";
import { BellRing } from "lucide-react";
import { INITIAL_PROJECTS, type ProjectItem } from "./projectsData";
import { ProjectsDirectoryView } from "./ProjectsDirectoryView";
import { CreateProjectView } from "./CreateProjectView";

export function ProjectsManagementView() {
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(
    null,
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Open Create Mode
  const handleCreateClick = () => {
    setEditingProject(null);
    setViewMode("form");
  };

  // Open Edit Mode with pre-filled project data
  const handleEditClick = (project: ProjectItem) => {
    setEditingProject(project);
    setViewMode("form");
  };

  // Eye Icon -> Placeholder toast notification (Plans under project coming soon)
  const handleViewPlansClick = (project: ProjectItem) => {
    showToast(
      `Plans under project "${project.code}" will be listed here after the Officer Plans section is completed!`,
    );
  };

  // Save/Update Handler
  const handleSaveProject = (savedProject: ProjectItem) => {
    if (editingProject) {
      // Update existing project
      setProjects((prev) =>
        prev.map((p) => (p.id === savedProject.id ? savedProject : p)),
      );
      showToast(
        `Project "${savedProject.code}" updated successfully with new information!`,
      );
    } else {
      // Create new project
      setProjects((prev) => [savedProject, ...prev]);
      showToast(
        `New sector project "${savedProject.code}" created and registered successfully!`,
      );
    }
    setEditingProject(null);
    setViewMode("list");
  };

  return (
    <div className="relative">
      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 rounded-xl bg-slate-900 text-white px-4 py-3 shadow-xl border border-slate-700 animate-in slide-in-from-top-3 max-w-md">
          <BellRing className="h-4 w-4 text-emerald-400 shrink-0" />
          <p className="text-xs font-medium leading-relaxed">{toastMessage}</p>
        </div>
      )}

      {viewMode === "list" ? (
        <ProjectsDirectoryView
          projects={projects}
          onCreateClick={handleCreateClick}
          onEditClick={handleEditClick}
          onViewPlansClick={handleViewPlansClick}
        />
      ) : (
        <CreateProjectView
          initialData={editingProject}
          onBackClick={() => {
            setEditingProject(null);
            setViewMode("list");
          }}
          onSaveProject={handleSaveProject}
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Home,
  ChevronRight,
  FolderKanban,
  Plus,
  Search,
  Eye,
  Edit,
  UserCheck,
} from "lucide-react";
import type { ProjectItem } from "./projectsData";

interface ProjectsDirectoryViewProps {
  projects: ProjectItem[];
  onCreateClick: () => void;
  onEditClick: (project: ProjectItem) => void;
  onViewPlansClick: (project: ProjectItem) => void;
}

export function ProjectsDirectoryView({
  projects,
  onCreateClick,
  onEditClick,
  onViewPlansClick,
}: ProjectsDirectoryViewProps) {
  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [officerFilter, setOfficerFilter] = useState("All Assigned Officers");
  const [fundingFilter, setFundingFilter] = useState("All Funding Sources");

  // Filtered logic
  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      project.code.toLowerCase().includes(query) ||
      project.name.toLowerCase().includes(query) ||
      project.fundingSource.toLowerCase().includes(query) ||
      project.sector.toLowerCase().includes(query) ||
      project.assignedOfficers.some((o) =>
        o.name.toLowerCase().includes(query),
      );

    const matchesStatus =
      statusFilter === "All Statuses" || project.status === statusFilter;

    const matchesOfficer =
      officerFilter === "All Assigned Officers" ||
      project.assignedOfficers.some((o) => o.name === officerFilter);

    const matchesFunding =
      fundingFilter === "All Funding Sources" ||
      project.fundingSource === fundingFilter;

    return matchesSearch && matchesStatus && matchesOfficer && matchesFunding;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Breadcrumbs Header Bar */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
        <Link
          href="/dashboard"
          title="Go to Dashboard"
          className="text-slate-500 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1"
        >
          <Home className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="font-bold text-[#0A3C2F]">Projects Management</span>
      </nav>

      {/* 2. Page Title Header & Top Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              MoA Projects Directory
            </h1>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-2xl">
            Manage, search, assign multiple procurement officers, and set donor
            funding sources for Ministry projects.
          </p>
        </div>

        <button
          onClick={onCreateClick}
          className="bg-[#0A3C2F] hover:bg-[#072b22] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-2xs transition-all duration-200 flex items-center gap-2 shrink-0 cursor-pointer self-start sm:self-auto active:scale-98"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Create New Project</span>
        </button>
      </div>

      {/* 3. Search & Filters Container Card */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-3 lg:space-y-0 lg:flex lg:items-center lg:gap-3">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code, name, donor, officer, or sector..."
            className="w-full rounded-xl bg-slate-50/80 border border-slate-200/90 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl bg-slate-50/80 border border-slate-200/90 px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer transition-all"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Delayed">Delayed</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Assigned Officer Filter */}
          <select
            value={officerFilter}
            onChange={(e) => setOfficerFilter(e.target.value)}
            className="rounded-xl bg-slate-50/80 border border-slate-200/90 px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer transition-all"
          >
            <option value="All Assigned Officers">All Assigned Officers</option>
            <option value="Demelash Worku">Demelash Worku</option>
            <option value="Abebe Kebede">Abebe Kebede</option>
            <option value="Dawit Mekonnen">Dawit Mekonnen</option>
            <option value="Bethelhem Tadesse">Bethelhem Tadesse</option>
          </select>

          {/* Funding Source Filter */}
          <select
            value={fundingFilter}
            onChange={(e) => setFundingFilter(e.target.value)}
            className="rounded-xl bg-slate-50/80 border border-slate-200/90 px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:bg-white focus:border-emerald-500 outline-none cursor-pointer transition-all"
          >
            <option value="All Funding Sources">All Funding Sources</option>
            <option value="African Development Bank (AfDB)">AfDB</option>
            <option value="World Bank (IDA)">World Bank (IDA)</option>
            <option value="Government Treasury (መንግሥት)">
              Government Treasury
            </option>
            <option value="World Bank / Grant">World Bank / Grant</option>
          </select>
        </div>
      </div>

      {/* 4. Projects Directory Table Card */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-[#0A3C2F] text-white text-[11px] font-extrabold uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12">#</th>
                <th className="py-3.5 px-4">Project Code</th>
                <th className="py-3.5 px-4">Project Name</th>
                <th className="py-3.5 px-4">Funding Source</th>
                <th className="py-3.5 px-4">Sector</th>
                <th className="py-3.5 px-4">Assigned Officers</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <p className="font-semibold text-slate-700 text-sm">
                      No matching projects found
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try clearing search queries or adjusting filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project, index) => (
                  <tr
                    key={project.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Index */}
                    <td className="py-4 px-4 text-center font-bold text-slate-400">
                      {index + 1}
                    </td>

                    {/* Code */}
                    <td className="py-4 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {project.code}
                    </td>

                    {/* Name */}
                    <td className="py-4 px-4 font-bold text-slate-900 max-w-[280px]">
                      <div className="leading-snug line-clamp-2">
                        {project.name}
                      </div>
                    </td>

                    {/* Funding Source Pill Badge */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                        {project.fundingSource}
                      </span>
                    </td>

                    {/* Sector */}
                    <td className="py-4 px-4 text-slate-600 font-medium max-w-[200px] leading-relaxed">
                      {project.sector}
                    </td>

                    {/* Assigned Officers List */}
                    <td className="py-4 px-4">
                      <div className="space-y-1.5">
                        {project.assignedOfficers.map((off) => (
                          <div
                            key={off.id}
                            className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800"
                          >
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-500 shrink-0">
                              <UserCheck className="h-3 w-3" />
                            </div>
                            <span>{off.name}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Eye Icon -> Reserved for project plans page (placeholder) */}
                        <button
                          onClick={() => onViewPlansClick(project)}
                          title="View Plans Under Project"
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* Edit Icon -> Pre-fills form data to edit project */}
                        <button
                          onClick={() => onEditClick(project)}
                          title="Edit Sector Project"
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

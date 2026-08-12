"use client";

import {
  Activity,
  BarChart3,
  Bell,
  ClipboardCheck,
  FileSignature,
  FolderKanban,
  Gavel,
  Globe2,
  History,
  LayoutDashboard,
  ListChecks,
  Menu,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { AuthUser } from "../../lib/authTypes";
import { ROLE_LABELS } from "../../lib/authTypes";
import {
  getNavigationForRole,
  type NavigationIconName,
} from "../../lib/navigation";
import { SignOutButton } from "./SignOutButton";

const navigationIcons: Record<NavigationIconName, LucideIcon> = {
  activity: Activity,
  clipboard: ClipboardCheck,
  contract: FileSignature,
  dashboard: LayoutDashboard,
  decision: Gavel,
  logs: History,
  progress: ListChecks,
  projects: FolderKanban,
  reports: BarChart3,
  users: Users,
};

const roleContext = {
  OFFICER: "Procurement Operations",
  DIRECTOR: "Directorate Oversight",
  ENDORSING_COMMITTEE: "Committee Review",
  ADMIN: "System Administration",
} as const;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "MU";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AppShell({
  user,
  children,
}: {
  user: AuthUser;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigation = getNavigationForRole(user.role);
  const userInitials = initials(user.displayName);

  const sidebar = (
    <aside className="flex h-full w-64 flex-col bg-[#064a3a] text-white shadow-2xl shadow-slate-950/15">
      <div className="flex min-h-24 items-center gap-3 border-b border-white/10 px-5">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-emerald-300/40 bg-white">
          <Image
            src="/moa-logo.png"
            alt="Ministry of Agriculture logo"
            width={1536}
            height={1024}
            priority
            className="absolute left-1/2 top-[-3px] h-auto w-[134px] max-w-none -translate-x-1/2"
          />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-extrabold tracking-tight">MoA PTS</p>
          <p className="mt-0.5 truncate text-xs font-medium text-emerald-200">
            {roleContext[user.role]}
          </p>
        </div>
      </div>

      <nav
        aria-label={`${ROLE_LABELS[user.role]} navigation`}
        className="flex-1 space-y-1 overflow-y-auto px-3 py-5"
      >
        {navigation.map((item) => {
          const Icon = navigationIcons[item.icon];
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex min-h-12 items-center gap-3 rounded-lg px-4 text-sm font-semibold ${
                isActive
                  ? "bg-lime-400 text-slate-950 shadow-sm"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.2 : 1.8}
                className={isActive ? "text-slate-950" : "text-emerald-200"}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-xs font-extrabold text-[#064a3a]">
            {userInitials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold">{user.displayName}</p>
            <p className="mt-0.5 truncate text-xs text-emerald-200">
              {ROLE_LABELS[user.role]}
            </p>
          </div>
          <SignOutButton compact />
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="sticky top-0 hidden h-screen shrink-0 lg:block">
        {sidebar}
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-slate-950/50"
          />
          <div className="relative h-full w-64 max-w-[85vw]">
            {sidebar}
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg text-emerald-100 hover:bg-white/10"
            >
              <X size={22} />
            </button>
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex min-h-[72px] items-center border-y border-b-slate-200 border-t-[#4b3328] bg-white px-4 sm:px-6">
          <button
            type="button"
            aria-label="Open navigation"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:border-emerald-300 hover:text-emerald-800 lg:hidden"
          >
            <Menu size={22} />
          </button>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifications, 3 unread"
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-800"
            >
              <Bell size={20} strokeWidth={1.8} />
              <span className="absolute -right-1.5 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white">
                3
              </span>
            </button>

            <div
              aria-label="Current language: English and Amharic"
              className="flex h-10 items-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800"
            >
              <Globe2 size={19} strokeWidth={1.8} className="text-slate-500" />
              <span>
                English / <span lang="am">አማርኛ</span>
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[96rem] p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

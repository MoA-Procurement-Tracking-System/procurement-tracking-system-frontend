import type { LucideIcon } from "lucide-react";

export type DashboardTone = "blue" | "emerald" | "orange" | "slate" | "violet";

export interface DashboardMetric {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: DashboardTone;
}

export interface DashboardWorkspace {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  icon: LucideIcon;
}

export interface DashboardFocusItem {
  title: string;
  description: string;
}

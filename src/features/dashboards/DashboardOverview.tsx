/* eslint-disable @typescript-eslint/no-unused-vars */
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { AuthUser } from "@/lib/authTypes";
import type {
  DashboardFocusItem,
  DashboardMetric,
  DashboardWorkspace,
} from "./types";

interface DashboardOverviewProps {
  user: AuthUser;
  eyebrow?: string;
  description?: string;
  metrics: readonly DashboardMetric[];
  workspaceTitle?: string;
  workspaceDescription?: string;
  workspaces?: readonly DashboardWorkspace[];
  focusTitle?: string;
  focusDescription?: string;
  focusItems?: readonly DashboardFocusItem[];
}

export function DashboardOverview({
  user: _user,
  eyebrow: _eyebrow,
  description: _description,
  metrics,
  workspaceTitle: _workspaceTitle,
  workspaceDescription: _workspaceDescription,
  workspaces: _workspaces,
  focusTitle: _focusTitle,
  focusDescription: _focusDescription,
  focusItems: _focusItems,
}: DashboardOverviewProps) {
  return (
    <div className="space-y-5 sm:space-y-6">
      <section
        aria-label="Dashboard summary"
        className="grid grid-cols-1 gap-3.5 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {metrics.map(
          ({
            label,
            value,
            detail,
            icon: Icon,
            tone,
            hasRightAccent,
            actionLabel,
            actionHref,
            detailLines,
            actionLines,
          }) => {
            // Modern, clean, and restrained styling system
            const titleColorClass = "text-slate-500";
            const detailColorClass = "text-slate-500";
            const cardBorderClass =
              "border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-200";

            let iconBgClass =
              "bg-slate-50 text-slate-600 border border-slate-200/60";
            let actionColorClass = "text-slate-700 hover:text-slate-900";

            const numValue = Number(value);
            const isDeactivatedMetric =
              tone === "rose" ||
              label.toLowerCase().includes("deactivat") ||
              label.toLowerCase().includes("suspended");
            const isActiveMetric =
              tone === "emerald" ||
              label.toLowerCase().includes("active access");

            if (isActiveMetric) {
              iconBgClass =
                "bg-emerald-50/70 text-emerald-600 border border-emerald-100/60 group-hover:bg-emerald-50 group-hover:border-emerald-200/70";
              actionColorClass = "text-emerald-700 hover:text-emerald-800";
            } else if (isDeactivatedMetric) {
              const hasAlert = !isNaN(numValue) && numValue > 0;
              iconBgClass = hasAlert
                ? "bg-rose-50/80 text-rose-600 border border-rose-100/60 group-hover:bg-rose-50 group-hover:border-rose-200/70"
                : "bg-slate-50 text-slate-400 border border-slate-200/60 group-hover:text-slate-600";
              actionColorClass = "text-slate-600 hover:text-slate-900";
            } else if (
              tone === "purple" ||
              tone === "violet" ||
              label.toLowerCase().includes("role") ||
              label.toLowerCase().includes("committee")
            ) {
              iconBgClass =
                "bg-violet-50/70 text-violet-600 border border-violet-100/60 group-hover:bg-violet-50 group-hover:border-violet-200/70";
              actionColorClass = "text-violet-700 hover:text-violet-800";
            } else if (
              tone === "orange" ||
              label.toLowerCase().includes("awaiting")
            ) {
              iconBgClass =
                "bg-amber-50/70 text-amber-600 border border-amber-100/60 group-hover:bg-amber-50 group-hover:border-amber-200/70";
              actionColorClass = "text-amber-700 hover:text-amber-800";
            } else {
              // Default blue / slate tone
              iconBgClass =
                "bg-sky-50/70 text-sky-600 border border-sky-100/60 group-hover:bg-sky-50 group-hover:border-sky-200/70";
              actionColorClass = "text-sky-700 hover:text-sky-800";
            }

            return (
              <article
                key={label}
                className={`group flex flex-col justify-between rounded-2xl bg-white p-4 sm:p-5 shadow-2xs min-h-[155px] sm:min-h-[160px] ${cardBorderClass}`}
              >
                {/* 1. TOP ROW: Title on Left, Icon Badge on Right */}
                <div className="flex items-start justify-between gap-3">
                  <h3
                    className={`text-[11px] font-semibold uppercase tracking-wider leading-snug max-w-[140px] sm:max-w-[160px] ${titleColorClass}`}
                  >
                    {label}
                  </h3>
                  <div
                    className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-150 ${iconBgClass}`}
                  >
                    <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
                  </div>
                </div>

                {/* 2. MIDDLE ROW: Clean, Prominent Metric Number */}
                <div className="my-2">
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
                    {value}
                  </p>
                </div>

                {/* 3. BOTTOM ROW: Divider line + Subtext & Action link */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  {detailLines && detailLines.length > 0 ? (
                    <div
                      className={`flex flex-col leading-tight ${detailColorClass}`}
                    >
                      {detailLines.map((line, idx) => (
                        <span key={idx}>{line}</span>
                      ))}
                    </div>
                  ) : (
                    <div
                      className={`flex items-center gap-1.5 truncate ${detailColorClass}`}
                    >
                      {isActiveMetric && (
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      {isDeactivatedMetric && (
                        <span
                          className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                            !isNaN(numValue) && numValue > 0
                              ? "bg-rose-500"
                              : "bg-slate-300"
                          }`}
                          aria-hidden="true"
                        />
                      )}
                      <span className="truncate">{detail}</span>
                    </div>
                  )}

                  {actionHref && (actionLabel || actionLines) ? (
                    <Link
                      href={actionHref}
                      className={`font-semibold hover:underline flex items-center gap-0.5 text-right leading-tight cursor-pointer transition-colors ${actionColorClass}`}
                    >
                      {actionLines && actionLines.length > 0 ? (
                        <div className="flex flex-col items-end">
                          {actionLines.map((line, idx) =>
                            idx === actionLines.length - 1 ? (
                              <span
                                key={idx}
                                className="flex items-center gap-0.5"
                              >
                                {line}{" "}
                                <ChevronRight className="h-3.5 w-3.5 inline shrink-0" />
                              </span>
                            ) : (
                              <span key={idx}>{line}</span>
                            ),
                          )}
                        </div>
                      ) : (
                        <>
                          <span>{actionLabel}</span>
                          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                        </>
                      )}
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          },
        )}
      </section>
    </div>
  );
}

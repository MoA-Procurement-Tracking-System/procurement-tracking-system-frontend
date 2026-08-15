import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { AuthUser } from "@/lib/authTypes";
import type {
  DashboardFocusItem,
  DashboardMetric,
  DashboardWorkspace,
} from "../types";

interface DashboardOverviewProps {
  user: AuthUser;
  eyebrow: string;
  description: string;
  metrics: readonly DashboardMetric[];
  workspaceTitle: string;
  workspaceDescription: string;
  workspaces: readonly DashboardWorkspace[];
  focusTitle: string;
  focusDescription: string;
  focusItems: readonly DashboardFocusItem[];
}

export function DashboardOverview({
  user,
  eyebrow,
  description,
  metrics,
  workspaceTitle,
  workspaceDescription,
  workspaces,
  focusTitle,
  focusDescription,
  focusItems,
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
            // Color and border mappings matching reference screenshot
            let titleColorClass = "text-[#475569]";
            let iconBgClass = "bg-[#E8F0FE] text-[#1A73E8] rounded-2xl";
            let detailColorClass = "text-[#94A3B8]";
            let actionColorClass = "text-[#1A73E8]";
            let cardBorderClass = "border border-slate-200/80";

            if (
              tone === "emerald" ||
              label.toLowerCase().includes("active access")
            ) {
              titleColorClass = "text-emerald-900";
              iconBgClass = "bg-emerald-50 text-emerald-600 rounded-2xl";
              detailColorClass = "text-emerald-900/80 font-medium";
              actionColorClass = "text-emerald-700";
              cardBorderClass =
                hasRightAccent !== false
                  ? "border border-emerald-200/90 border-r-[6px] border-r-emerald-500"
                  : "border border-emerald-200/90";
            } else if (
              tone === "rose" ||
              label.toLowerCase().includes("deactivat") ||
              label.toLowerCase().includes("suspended") ||
              label.toLowerCase().includes("critical")
            ) {
              titleColorClass = "text-[#881337]";
              iconBgClass =
                "bg-[#FFE4E6] text-[#E11D48] rounded-full border border-[#FECDD3]";
              detailColorClass = "text-[#881337] font-semibold";
              actionColorClass = "text-[#881337]";
              cardBorderClass =
                hasRightAccent !== false
                  ? "border border-[#FECDD3] border-r-[6px] border-r-[#E11D48]"
                  : "border border-[#FECDD3]";
            } else if (
              tone === "purple" ||
              tone === "violet" ||
              label.toLowerCase().includes("role") ||
              label.toLowerCase().includes("committee")
            ) {
              titleColorClass = "text-[#475569]";
              iconBgClass = "bg-[#F3E8FF] text-[#9333EA] rounded-full";
              detailColorClass = "text-[#94A3B8] font-normal";
              actionColorClass = "text-[#7E22CE]";
              cardBorderClass = hasRightAccent
                ? "border border-purple-200/90 border-r-[6px] border-r-purple-500"
                : "border border-slate-200/80";
            } else if (
              tone === "orange" ||
              label.toLowerCase().includes("awaiting")
            ) {
              titleColorClass = "text-[#78350F]";
              iconBgClass =
                "bg-[#FEF3C7] text-[#D97706] rounded-full border border-[#FDE68A]";
              detailColorClass = "text-[#78350F] font-semibold";
              actionColorClass = "text-[#78350F]";
              cardBorderClass =
                hasRightAccent !== false
                  ? "border border-[#FDE68A] border-r-[6px] border-r-[#F59E0B]"
                  : "border border-[#FDE68A]";
            } else {
              // Default blue tone
              titleColorClass = "text-[#475569]";
              iconBgClass = "bg-[#E8F0FE] text-[#1A73E8] rounded-2xl";
              detailColorClass = "text-[#94A3B8] font-normal";
              actionColorClass = "text-[#1A73E8]";
              cardBorderClass = hasRightAccent
                ? "border border-blue-200/90 border-r-[6px] border-r-blue-500"
                : "border border-slate-200/80";
            }

            return (
              <article
                key={label}
                className={`flex flex-col justify-between rounded-[20px] bg-white p-4 sm:p-5 shadow-2xs transition-all duration-200 hover:shadow-md min-h-[160px] sm:min-h-[165px] ${cardBorderClass}`}
              >
                {/* 1. TOP ROW: Title on Left, Icon Badge on Right */}
                <div className="flex items-start justify-between gap-3">
                  <h3
                    className={`text-[11px] font-bold uppercase tracking-wider leading-tight max-w-[130px] sm:max-w-[150px] ${titleColorClass}`}
                  >
                    {label}
                  </h3>
                  <div
                    className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center ${iconBgClass}`}
                  >
                    <Icon size={18} strokeWidth={2.2} aria-hidden="true" />
                  </div>
                </div>

                {/* 2. MIDDLE ROW: Big Bold Metric Number */}
                <div className="my-1">
                  <p className="text-[24px] sm:text-[28px] font-extrabold tracking-tight text-slate-900 leading-none">
                    {value}
                  </p>
                </div>

                {/* 3. BOTTOM ROW: Divider line + Subtext & Action link */}
                <div className="pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] sm:text-[12px]">
                  {detailLines && detailLines.length > 0 ? (
                    <div
                      className={`flex flex-col leading-tight ${detailColorClass}`}
                    >
                      {detailLines.map((line, idx) => (
                        <span key={idx}>{line}</span>
                      ))}
                    </div>
                  ) : (
                    <span className={`line-clamp-1 ${detailColorClass}`}>
                      {detail}
                    </span>
                  )}

                  {actionHref && (actionLabel || actionLines) ? (
                    <Link
                      href={actionHref}
                      className={`font-bold hover:underline flex items-center gap-0.5 text-right leading-tight cursor-pointer ${actionColorClass}`}
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

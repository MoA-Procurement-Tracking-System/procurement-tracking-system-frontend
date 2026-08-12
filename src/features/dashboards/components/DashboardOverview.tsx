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
    <div className="space-y-5">
      <section
        aria-label="Dashboard summary"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {metrics.map(
          ({ label, value, detail, icon: Icon, tone, hasRightAccent }) => {
            // Color and border mappings matching the reference
            let titleColorClass = "text-slate-800";
            let iconBgClass = "bg-blue-50 text-blue-600";
            let detailColorClass = "text-slate-400";
            let cardBorderClass = "border border-slate-200/80";

            if (
              tone === "emerald" ||
              label.toLowerCase().includes("active access")
            ) {
              titleColorClass = "text-emerald-900";
              iconBgClass = "bg-emerald-50 text-emerald-600";
              detailColorClass = "text-emerald-900/80 font-medium";
              cardBorderClass =
                hasRightAccent !== false
                  ? "border border-emerald-200/90 border-r-[5px] border-r-emerald-500"
                  : "border border-emerald-200/90";
            } else if (
              tone === "rose" ||
              label.toLowerCase().includes("deactivat") ||
              label.toLowerCase().includes("suspended")
            ) {
              titleColorClass = "text-rose-950";
              iconBgClass = "bg-rose-50 text-rose-500";
              detailColorClass = "text-rose-900/80 font-medium";
              cardBorderClass =
                hasRightAccent !== false
                  ? "border border-rose-200/90 border-r-[5px] border-r-rose-500"
                  : "border border-rose-200/90";
            } else if (
              tone === "purple" ||
              tone === "violet" ||
              label.toLowerCase().includes("role")
            ) {
              titleColorClass = "text-slate-800";
              iconBgClass = "bg-purple-50 text-purple-600";
              detailColorClass = "text-slate-400 font-normal";
              cardBorderClass = hasRightAccent
                ? "border border-purple-200/90 border-r-[5px] border-r-purple-500"
                : "border border-purple-100/90";
            } else if (tone === "orange") {
              titleColorClass = "text-orange-950";
              iconBgClass = "bg-orange-50 text-orange-600";
              detailColorClass = "text-slate-400";
              cardBorderClass =
                hasRightAccent !== false
                  ? "border border-orange-200/90 border-r-[5px] border-r-orange-500"
                  : "border border-orange-200/90";
            } else {
              // Default blue tone
              titleColorClass = "text-slate-800";
              iconBgClass = "bg-blue-50 text-blue-600";
              detailColorClass = "text-slate-400 font-normal";
              cardBorderClass = hasRightAccent
                ? "border border-blue-200/90 border-r-[5px] border-r-blue-500"
                : "border border-slate-200/80";
            }

            return (
              <article
                key={label}
                className={`flex flex-col justify-between rounded-[20px] bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-md min-h-[175px] ${cardBorderClass}`}
              >
                {/* 1. TOP ROW: Title on Left, Icon Badge on Right */}
                <div className="flex items-start justify-between gap-3">
                  <h3
                    className={`text-[12px] font-bold uppercase tracking-wider leading-tight max-w-[150px] ${titleColorClass}`}
                  >
                    {label}
                  </h3>
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${iconBgClass}`}
                  >
                    <Icon size={19} strokeWidth={2.2} aria-hidden="true" />
                  </div>
                </div>

                {/* 2. MIDDLE ROW: Big Bold Metric Number */}
                <div className="my-2">
                  <p
                    className={`text-4xl font-extrabold tracking-tight ${
                      tone === "rose" ? "text-rose-950" : "text-slate-900"
                    }`}
                  >
                    {value}
                  </p>
                </div>

                {/* 3. BOTTOM ROW: Divider line + Subtext detail */}
                <div className="pt-3 border-t border-slate-100/90 flex items-center justify-between gap-2 text-xs">
                  <span className={`line-clamp-1 ${detailColorClass}`}>
                    {detail}
                  </span>
                </div>
              </article>
            );
          }
        )}
      </section>
    </div>
  );
}



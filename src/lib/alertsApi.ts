import { apiClient } from "./apiClient";
import {
  INITIAL_NOTIFICATIONS,
  type SystemNotification,
} from "@/features/notifications/data/notificationsData";

export interface BackendAlert {
  id: string;
  type: string;
  severity: "HIGH" | "MEDIUM" | "LOW" | "INFO";
  title: string;
  message: string;
  createdAt: string;
  readAt?: string | null;
  link?: string;
  targetRole?: string;
}

export function mapBackendAlertToNotification(
  alert: BackendAlert,
): SystemNotification {
  const priorityMap: Record<string, SystemNotification["priority"]> = {
    HIGH: "urgent",
    MEDIUM: "normal",
    LOW: "info",
    INFO: "info",
  };

  const typeMap: Record<string, SystemNotification["type"]> = {
    PLAN_REVIEW: "plan",
    CONTRACT_MILESTONE: "contract",
    ACTIVITY_DEADLINE: "activity",
    DECISION: "approval",
    SYSTEM: "system",
  };

  const calculatedType = typeMap[alert.type] || "system";
  const priority = priorityMap[alert.severity] || "normal";

  // Calculate relative timestamp
  const date = new Date(alert.createdAt);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  let timestamp = "Just now";

  if (diffMinutes >= 1440) {
    const days = Math.floor(diffMinutes / 1440);
    timestamp = `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (diffMinutes >= 60) {
    const hours = Math.floor(diffMinutes / 60);
    timestamp = `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (diffMinutes > 0) {
    timestamp = `${diffMinutes} min${diffMinutes > 1 ? "s" : ""} ago`;
  }

  return {
    id: alert.id,
    title: alert.title,
    message: alert.message,
    type: calculatedType,
    priority,
    timestamp,
    read: Boolean(alert.readAt),
    link: alert.link || getLinkForType(calculatedType),
    actionLabel: getActionLabel(calculatedType),
  };
}

function getLinkForType(type: SystemNotification["type"]): string {
  switch (type) {
    case "plan":
      return "/workspace/plan-for-review";
    case "contract":
      return "/workspace/contracts";
    case "activity":
      return "/workspace/activity-tracker";
    case "approval":
      return "/workspace/committee-progress";
    case "system":
    default:
      return "/workspace/reports";
  }
}

function getActionLabel(type: SystemNotification["type"]): string {
  switch (type) {
    case "plan":
      return "Review Plan";
    case "contract":
      return "View Contract";
    case "activity":
      return "Open Tracker";
    case "approval":
      return "View Decision";
    case "system":
    default:
      return "View Details";
  }
}

export async function fetchNotifications(): Promise<SystemNotification[]> {
  try {
    const rawAlerts = await apiClient.get<BackendAlert[]>("/alerts");
    if (Array.isArray(rawAlerts) && rawAlerts.length > 0) {
      return rawAlerts.map(mapBackendAlertToNotification);
    }
  } catch (err) {
    console.warn("Could not fetch alerts from backend, falling back:", err);
  }

  // Return initial seed notifications if API returns empty array or fails
  return INITIAL_NOTIFICATIONS;
}

export async function markAlertAsRead(id: string): Promise<void> {
  try {
    await apiClient.patch(`/alerts/${id}/read`);
  } catch (err) {
    console.warn(`Failed to mark alert ${id} as read on backend:`, err);
  }
}

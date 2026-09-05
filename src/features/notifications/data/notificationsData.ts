export type NotificationPriority = "urgent" | "normal" | "info";
export type NotificationType = "plan" | "contract" | "activity" | "system" | "approval";

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  timestamp: string;
  read: boolean;
  link?: string;
  actionLabel?: string;
}

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "notif-1",
    title: "Procurement Plan Submitted for Review",
    message: "Officer Tadesse Alemu submitted 'BREFONS - Goods Procurement Plan - 2018 EFY' for Director approval.",
    type: "plan",
    priority: "urgent",
    timestamp: "10 mins ago",
    read: false,
    link: "/workspace/plan-for-review",
    actionLabel: "Review Plan",
  },
  {
    id: "notif-2",
    title: "Contract Payment Milestone Due",
    message: "Payment Milestone #2 for Contract MoA/GOODS/02/2017 (Supply of 4WD Vehicles) is due in 3 days.",
    type: "contract",
    priority: "normal",
    timestamp: "1 hour ago",
    read: false,
    link: "/workspace/contracts",
    actionLabel: "View Contract",
  },
  {
    id: "notif-3",
    title: "Committee Endorsement Decision Recorded",
    message: "Management Committee approved 'PASIDP II - Works Procurement Plan' with 4 positive votes.",
    type: "approval",
    priority: "info",
    timestamp: "3 hours ago",
    read: false,
    link: "/workspace/committee-progress",
    actionLabel: "View Progress",
  },
  {
    id: "notif-4",
    title: "Activity Milestone Deadline Alert",
    message: "Activity 'Technical Specification Preparation for Irrigation Pumps' has passed target start date.",
    type: "activity",
    priority: "urgent",
    timestamp: "Yesterday",
    read: true,
    link: "/workspace/activity-tracker",
    actionLabel: "Open Tracker",
  },
  {
    id: "notif-5",
    title: "System Audit Log Generated",
    message: "Monthly user authentication and permission change audit summary report is available.",
    type: "system",
    priority: "info",
    timestamp: "2 days ago",
    read: true,
    link: "/workspace/reports",
    actionLabel: "View Reports",
  },
];

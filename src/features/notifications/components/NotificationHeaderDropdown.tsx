"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  FileSpreadsheet,
  Info,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import {
  INITIAL_NOTIFICATIONS,
  type NotificationType,
  type SystemNotification,
} from "../data/notificationsData";
import { fetchNotifications, markAlertAsRead } from "@/lib/alertsApi";

export function NotificationHeaderDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>(
    INITIAL_NOTIFICATIONS,
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadAlerts() {
      const liveData = await fetchNotifications();
      setNotifications(liveData);
    }
    loadAlerts();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  function getNotificationIcon(type: NotificationType) {
    switch (type) {
      case "plan":
        return <FileSpreadsheet className="h-4 w-4 text-emerald-600" />;
      case "contract":
        return <FileCheck className="h-4 w-4 text-blue-600" />;
      case "approval":
        return <CheckCircle2 className="h-4 w-4 text-purple-600" />;
      case "activity":
        return <Clock className="h-4 w-4 text-amber-600" />;
      case "system":
      default:
        return <Info className="h-4 w-4 text-slate-600" />;
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications, ${unreadCount} unread`}
        className={`relative p-2 rounded-lg border text-slate-600 hover:bg-slate-50 hover:text-[#0A3C2F] transition-all cursor-pointer flex items-center justify-center ${
          isOpen
            ? "bg-emerald-50 border-emerald-300 text-[#0A3C2F]"
            : "border-slate-200"
        }`}
      >
        <Bell size={16} strokeWidth={1.8} className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Floating Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-900">
                Notifications
              </span>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                  {unreadCount} New
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  All Read
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck size={13} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 font-medium">
                No notifications right now.
              </div>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkAsRead(n.id)}
                  className={`p-3 sm:p-3.5 transition-colors flex items-start gap-3 cursor-pointer hover:bg-slate-50 ${
                    n.read ? "bg-white" : "bg-emerald-50/40"
                  }`}
                >
                  <div className="p-2 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                    {getNotificationIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`text-xs truncate ${
                          n.read
                            ? "font-semibold text-slate-800"
                            : "font-extrabold text-slate-950"
                        }`}
                      >
                        {n.title}
                      </h4>
                      {n.priority === "urgent" && (
                        <span className="shrink-0 text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-medium text-slate-400">
                        {n.timestamp}
                      </span>
                      {n.link && (
                        <Link
                          href={n.link}
                          onClick={() => setIsOpen(false)}
                          className="text-[11px] font-bold text-[#0A3C2F] hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>{n.actionLabel || "View"}</span>
                          <ExternalLink size={10} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Link */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <Link
              href="/workspace/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-[#0A3C2F] hover:underline inline-flex items-center gap-1"
            >
              <span>See All Notifications ({notifications.length})</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

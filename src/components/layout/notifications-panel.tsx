"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  Package,
  X,
} from "lucide-react";
import { useAuth } from "@/context/auth-provider";
import { isAdmin } from "@/lib/auth";
import { useInventory } from "@/context/inventory-provider";
import { useSettings } from "@/context/settings-provider";
import {
  buildActivityNotifications,
  buildStockAlertNotifications,
  getReadNotificationIds,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from "@/lib/notifications";

const typeStyles: Record<
  AppNotification["type"],
  { icon: typeof Bell; className: string }
> = {
  alert: {
    icon: AlertTriangle,
    className: "bg-accent-warning-light text-accent-warning",
  },
  activity: {
    icon: Package,
    className: "bg-accent-info-light text-accent-info",
  },
  info: {
    icon: Bell,
    className: "bg-accent-primary-light text-accent-primary",
  },
};

export function NotificationsPanel() {
  const { user } = useAuth();
  const admin = isAdmin(user);
  const { getAlertItems, activity } = useInventory();
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);

  const email = user?.email ?? "";

  useEffect(() => {
    if (email) setReadIds(getReadNotificationIds(email));
  }, [email]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const notifications = useMemo(() => {
    const list: AppNotification[] = [];

    if (settings.notifications.lowStockAlerts) {
      const alerts = getAlertItems(admin, user?.id ?? "");
      list.push(...buildStockAlertNotifications(alerts));
    }

    if (settings.notifications.pushNotifications) {
      list.push(...buildActivityNotifications(activity));
    }

    return list;
  }, [
    settings.notifications.lowStockAlerts,
    settings.notifications.pushNotifications,
    getAlertItems,
    admin,
    user?.id,
    activity,
  ]);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  function handleOpen() {
    setOpen((prev) => !prev);
    if (email) setReadIds(getReadNotificationIds(email));
  }

  function handleMarkRead(id: string) {
    if (!email) return;
    markNotificationRead(email, id);
    setReadIds((prev) => new Set([...prev, id]));
  }

  function handleMarkAllRead() {
    if (!email) return;
    const ids = notifications.map((n) => n.id);
    markAllNotificationsRead(email, ids);
    setReadIds(new Set(ids));
  }

  const alertsDisabled =
    !settings.notifications.lowStockAlerts &&
    !settings.notifications.pushNotifications;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={handleOpen}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary transition-colors hover:border-accent-primary/30 hover:bg-accent-primary-light hover:text-accent-primary"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-danger px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-bold text-text-primary">Notifications</p>
              <p className="text-[10px] text-text-muted">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "You're all caught up"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-accent-primary"
                  aria-label="Mark all as read"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {alertsDisabled ? (
              <div className="px-4 py-8 text-center">
                <Bell className="mx-auto mb-2 h-8 w-8 text-text-muted" />
                <p className="text-sm font-medium text-text-primary">
                  Notifications are off
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  Enable alerts in Settings to receive updates here.
                </p>
                <Link
                  href="/settings"
                  onClick={() => setOpen(false)}
                  className="mt-3 inline-block text-xs font-semibold text-accent-primary hover:underline"
                >
                  Open Settings
                </Link>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <CheckCheck className="mx-auto mb-2 h-8 w-8 text-accent-success" />
                <p className="text-sm font-medium text-text-primary">
                  No notifications
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  Stock alerts and activity will appear here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {notifications.map((notification) => {
                  const unread = !readIds.has(notification.id);
                  const style = typeStyles[notification.type];
                  const Icon = style.icon;

                  return (
                    <li key={notification.id}>
                      <Link
                        href={notification.href ?? "#"}
                        onClick={() => {
                          handleMarkRead(notification.id);
                          setOpen(false);
                        }}
                        className={`flex gap-3 px-4 py-3 transition-colors hover:bg-surface-hover ${unread ? "bg-accent-primary-light/30" : ""}`}
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.className}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-text-primary">
                              {notification.title}
                            </p>
                            {unread && (
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-primary" />
                            )}
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-text-secondary">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-[10px] text-text-muted">
                            {notification.timestamp}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-border bg-surface px-4 py-2.5">
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-accent-primary hover:underline"
              >
                Manage notification preferences
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

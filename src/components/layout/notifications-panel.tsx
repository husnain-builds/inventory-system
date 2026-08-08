"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

function NotificationList({
  notifications,
  readIds,
  alertsDisabled,
  onMarkRead,
  onClose,
}: {
  notifications: AppNotification[];
  readIds: Set<string>;
  alertsDisabled: boolean;
  onMarkRead: (id: string) => void;
  onClose: () => void;
}) {
  if (alertsDisabled) {
    return (
      <div className="px-5 py-10 text-center">
        <Bell className="mx-auto mb-3 h-9 w-9 text-text-muted" />
        <p className="text-sm font-medium text-text-primary">
          Notifications are off
        </p>
        <p className="mt-1.5 text-sm text-text-muted">
          Enable alerts in Settings to receive updates here.
        </p>
        <Link
          href="/settings"
          onClick={onClose}
          className="mt-4 inline-block text-sm font-semibold text-accent-primary hover:underline"
        >
          Open Settings
        </Link>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="px-5 py-10 text-center">
        <CheckCheck className="mx-auto mb-3 h-9 w-9 text-accent-success" />
        <p className="text-sm font-medium text-text-primary">No notifications</p>
        <p className="mt-1.5 text-sm text-text-muted">
          Stock alerts and activity will appear here.
        </p>
      </div>
    );
  }

  return (
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
                onMarkRead(notification.id);
                onClose();
              }}
              className={`flex gap-3 px-4 py-3.5 transition-colors active:bg-surface-hover sm:px-5 ${unread ? "bg-accent-primary-light/30" : ""}`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.className}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {notification.title}
                  </p>
                  {unread && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-primary" />
                  )}
                </div>
                <p className="mt-1 break-words text-sm leading-snug text-text-secondary">
                  {notification.message}
                </p>
                <p className="mt-1.5 text-xs text-text-muted">
                  {notification.timestamp}
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function NotificationsPanel() {
  const { user } = useAuth();
  const admin = isAdmin(user);
  const { getAlertItems, activity } = useInventory();
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const email = user?.email ?? "";

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (email) setReadIds(getReadNotificationIds(email));
  }, [email]);

  useEffect(() => {
    function handlePointerOutside(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (
        panelRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    if (open) {
      document.addEventListener("mousedown", handlePointerOutside);
      document.addEventListener("touchstart", handlePointerOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handlePointerOutside);
      document.removeEventListener("touchstart", handlePointerOutside);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !isMobile) return;

    document.body.classList.add("notifications-open");
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.classList.remove("notifications-open");
      document.body.style.overflow = prev;
    };
  }, [open, isMobile]);

  const notifications = useMemo(() => {
    const list: AppNotification[] = [];

    if (settings.notifications.lowStockAlerts) {
      const alerts = getAlertItems(admin, user?.id ?? "");
      list.push(...buildStockAlertNotifications(alerts));
    }

    if (settings.notifications.pushNotifications) {
      list.push(...buildActivityNotifications(activity));
    }

    const unique = new Map<string, AppNotification>();
    for (const notification of list) {
      unique.set(notification.id, notification);
    }
    return [...unique.values()];
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

  function handleClose() {
    setOpen(false);
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

  const panelBody = (
    <>
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3.5 sm:px-5">
        <div className="min-w-0 pr-3">
          <p className="text-base font-bold text-text-primary">Notifications</p>
          <p className="text-xs text-text-muted">
            {unreadCount > 0
              ? `${unreadCount} unread`
              : "You're all caught up"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-accent-primary"
              aria-label="Mark all as read"
              title="Mark all as read"
            >
              <CheckCheck className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
        <NotificationList
          notifications={notifications}
          readIds={readIds}
          alertsDisabled={alertsDisabled}
          onMarkRead={handleMarkRead}
          onClose={handleClose}
        />
      </div>

      {notifications.length > 0 && (
        <div className="shrink-0 border-t border-border bg-surface px-4 py-3 sm:px-5">
          <Link
            href="/settings"
            onClick={handleClose}
            className="text-sm font-semibold text-accent-primary hover:underline"
          >
            Manage notification preferences
          </Link>
        </div>
      )}
    </>
  );

  return (
    <div className="relative shrink-0">
      <button
        ref={buttonRef}
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

      {mounted &&
        open &&
        createPortal(
          isMobile ? (
            <div className="fixed inset-0 z-[200] lg:hidden">
              <button
                type="button"
                className="absolute inset-0 bg-black/40"
                onClick={handleClose}
                aria-label="Close notifications"
              />
              <div
                ref={panelRef}
                className="absolute inset-x-0 bottom-0 flex h-[min(58dvh,520px)] flex-col overflow-hidden rounded-t-[1.25rem] border border-border bg-surface-elevated shadow-2xl"
                role="dialog"
                aria-modal="true"
                aria-label="Notifications"
              >
                <div className="flex shrink-0 justify-center pt-2.5 pb-1">
                  <div className="h-1 w-12 rounded-full bg-surface-muted" />
                </div>
                {panelBody}
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="fixed inset-0 z-[100] hidden lg:block"
                onClick={handleClose}
                aria-label="Close notifications"
              />
              <div
                ref={panelRef}
                className="fixed right-4 top-[4rem] z-[101] hidden h-[min(24rem,calc(100vh-5.5rem))] w-80 flex-col overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-lg lg:flex"
                role="dialog"
                aria-label="Notifications"
              >
                {panelBody}
              </div>
            </>
          ),
          document.body
        )}
    </div>
  );
}

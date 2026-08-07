import type { ActivityEntry, InventoryItem } from "./mock-data";

export type NotificationType = "alert" | "activity" | "info";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  href?: string;
}

const READ_KEY = "stockflow_read_notifications";

function readKeyForUser(email: string) {
  return `${READ_KEY}_${email.toLowerCase()}`;
}

export function getReadNotificationIds(email: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(readKeyForUser(email));
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function markNotificationRead(email: string, id: string) {
  if (typeof window === "undefined") return;
  const ids = getReadNotificationIds(email);
  ids.add(id);
  localStorage.setItem(readKeyForUser(email), JSON.stringify([...ids]));
}

export function markAllNotificationsRead(email: string, notificationIds: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(readKeyForUser(email), JSON.stringify(notificationIds));
}

export function buildStockAlertNotifications(
  items: InventoryItem[]
): AppNotification[] {
  return items.map((item) => ({
    id: `alert-${item.id}`,
    type: "alert" as const,
    title:
      item.status === "out-of-stock" ? "Out of Stock" : "Low Stock Alert",
    message: `${item.name} (${item.sku}) — ${item.quantity} ${item.unit} remaining (min ${item.minStock})`,
    timestamp: item.lastUpdated,
    href: "/inventory",
  }));
}

export function buildActivityNotifications(
  activity: ActivityEntry[]
): AppNotification[] {
  const seen = new Set<string>();

  return activity
    .filter((entry) => {
      if (seen.has(entry.id)) return false;
      seen.add(entry.id);
      return true;
    })
    .slice(0, 8)
    .map((entry) => ({
      id: `activity-${entry.id}`,
      type: "activity" as const,
      title:
        entry.type === "add"
          ? "Item Added"
          : entry.type === "remove"
            ? "Item Removed"
            : entry.type === "alert"
              ? "Stock Alert"
              : "Item Updated",
      message: entry.message,
      timestamp: entry.timestamp,
      href: "/inventory",
    }));
}

export function getWorkspaceTitle(
  name: string,
  admin: boolean
): string {
  const trimmed = name.trim() || "User";
  if (admin) return trimmed;
  const firstName = trimmed.split(/\s+/)[0];
  return `${firstName}'s Workspace`;
}

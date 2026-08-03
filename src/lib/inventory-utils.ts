import type { InventoryItem, StockStatus } from "./mock-data";

export function computeStatus(
  quantity: number,
  minStock: number
): StockStatus {
  if (quantity <= 0) return "out-of-stock";
  if (quantity <= minStock) return "low-stock";
  return "in-stock";
}

export function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export function getCategoryBreakdown(items: InventoryItem[]) {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([category, count]) => ({ label: category, value: count }))
    .sort((a, b) => b.value - a.value);
}

export function getAdminStats(items: InventoryItem[], userCount: number) {
  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const lowStock = items.filter(
    (i) => i.status === "low-stock" || i.status === "out-of-stock"
  ).length;
  const categories = new Set(items.map((i) => i.category)).size;
  return { totalItems, totalQuantity, lowStock, categories, totalUsers: userCount };
}

export function getUserStats(items: InventoryItem[]) {
  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const lowStock = items.filter(
    (i) => i.status === "low-stock" || i.status === "out-of-stock"
  ).length;
  const categories = new Set(items.map((i) => i.category)).size;
  return { totalItems, totalQuantity, lowStock, categories };
}

export const CATEGORIES = [
  "Electronics",
  "Furniture",
  "Supplies",
  "Equipment",
  "Safety",
] as const;

export const UNITS = ["units", "pairs", "reams", "boxes", "sets"] as const;

export type ItemFormInput = {
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minStock: number;
  unit: string;
  location: string;
  ownerId: string;
};

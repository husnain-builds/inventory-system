import type { ActivityEntry, InventoryItem } from "@/lib/mock-data";

export type ReorderPriority = "critical" | "high" | "medium";

export interface ReorderSuggestion {
  itemId: string;
  itemName: string;
  sku: string;
  currentQty: number;
  minStock: number;
  unit: string;
  location: string;
  status: InventoryItem["status"];
  suggestedQty: number;
  priority: ReorderPriority;
  daysUntilEmpty: number | null;
  reason: string;
  ownerName?: string;
}

function estimateWeeklyRemovals(
  itemName: string,
  activity: ActivityEntry[]
): number {
  let total = 0;
  const pattern = new RegExp(
    `removed\\s+(\\d+)×\\s+${escapeRegex(itemName)}|removed\\s+${escapeRegex(itemName)}`,
    "i"
  );

  for (const entry of activity) {
    if (entry.type !== "remove") continue;
    const match = entry.message.match(pattern);
    if (match?.[1]) {
      total += Number.parseInt(match[1], 10) || 1;
    } else if (entry.message.toLowerCase().includes(itemName.toLowerCase())) {
      total += 1;
    }
  }

  return total;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getPriority(
  status: InventoryItem["status"],
  daysUntilEmpty: number | null
): ReorderPriority {
  if (status === "out-of-stock") return "critical";
  if (daysUntilEmpty != null && daysUntilEmpty <= 3) return "critical";
  if (status === "low-stock" || (daysUntilEmpty != null && daysUntilEmpty <= 7)) {
    return "high";
  }
  return "medium";
}

function buildReason(
  item: InventoryItem,
  daysUntilEmpty: number | null,
  weeklyRemovals: number
): string {
  if (item.status === "out-of-stock") {
    return "Out of stock — reorder immediately to avoid downtime.";
  }
  if (daysUntilEmpty != null && weeklyRemovals > 0) {
    return `Based on recent usage (~${weeklyRemovals}/week), stock may run out in ~${daysUntilEmpty} day${daysUntilEmpty === 1 ? "" : "s"}.`;
  }
  if (item.quantity <= item.minStock) {
    return `At or below minimum stock (${item.minStock} ${item.unit}).`;
  }
  return "Approaching minimum stock threshold.";
}

export function getReorderSuggestions(
  items: InventoryItem[],
  activity: ActivityEntry[],
  ownerNames?: Map<string, string>
): ReorderSuggestion[] {
  const alertItems = items.filter((item) => item.status !== "in-stock");

  return alertItems
    .map((item) => {
      const weeklyRemovals = estimateWeeklyRemovals(item.name, activity);
      const dailyUsage = weeklyRemovals > 0 ? weeklyRemovals / 7 : 0;
      const daysUntilEmpty =
        dailyUsage > 0
          ? Math.max(1, Math.floor(item.quantity / dailyUsage))
          : item.status === "out-of-stock"
            ? 0
            : null;

      const targetQty = Math.max(item.minStock * 2, item.minStock + 5);
      const suggestedQty = Math.max(targetQty - item.quantity, item.minStock);

      const priority = getPriority(item.status, daysUntilEmpty);

      return {
        itemId: item.id,
        itemName: item.name,
        sku: item.sku,
        currentQty: item.quantity,
        minStock: item.minStock,
        unit: item.unit,
        location: item.location,
        status: item.status,
        suggestedQty,
        priority,
        daysUntilEmpty,
        reason: buildReason(item, daysUntilEmpty, weeklyRemovals),
        ownerName: ownerNames?.get(item.ownerId),
      };
    })
    .sort((a, b) => {
      const rank = { critical: 0, high: 1, medium: 2 };
      if (rank[a.priority] !== rank[b.priority]) {
        return rank[a.priority] - rank[b.priority];
      }
      const daysA = a.daysUntilEmpty ?? 999;
      const daysB = b.daysUntilEmpty ?? 999;
      return daysA - daysB;
    });
}

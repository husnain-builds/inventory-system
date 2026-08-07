import type { ActivityEntry, InventoryItem, StockStatus } from "@/lib/mock-data";

export interface AIInventoryContext {
  role: "admin" | "user";
  userName: string;
  stats: {
    totalItems: number;
    totalQuantity: number;
    lowStock: number;
    categories: number;
    totalUsers?: number;
  };
  items: Array<{
    name: string;
    sku: string;
    category: string;
    quantity: number;
    minStock: number;
    unit: string;
    location: string;
    status: StockStatus;
    ownerName?: string;
  }>;
  activity: Pick<ActivityEntry, "message" | "type" | "timestamp">[];
}

export function buildAIContext(
  role: "admin" | "user",
  userName: string,
  items: InventoryItem[],
  activity: ActivityEntry[],
  stats: AIInventoryContext["stats"],
  ownerNames?: Map<string, string>
): AIInventoryContext {
  return {
    role,
    userName,
    stats,
    items: items.map((item) => ({
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      minStock: item.minStock,
      unit: item.unit,
      location: item.location,
      status: item.status,
      ownerName: ownerNames?.get(item.ownerId),
    })),
    activity: activity.slice(0, 10).map(({ message, type, timestamp }) => ({
      message,
      type,
      timestamp,
    })),
  };
}

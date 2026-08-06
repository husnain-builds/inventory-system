import type { InventoryItem } from "@/lib/mock-data";
import type { ItemFormInput } from "@/lib/inventory-utils";

export function itemToFormInput(item: InventoryItem): ItemFormInput {
  return {
    name: item.name,
    sku: item.sku,
    category: item.category,
    quantity: item.quantity,
    minStock: item.minStock,
    unit: item.unit,
    location: item.location,
    ownerId: item.ownerId,
  };
}

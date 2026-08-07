import type { InventoryItem } from "@/lib/mock-data";
import { inventoryUsers } from "@/lib/mock-data";
import type { ItemFormInput } from "@/lib/inventory-utils";
import {
  type AutomationAction,
  type AutomationOwner,
  toItemFormInput,
} from "@/lib/ai/automation";
import { itemToFormInput } from "@/lib/ai/automation-helpers";

export interface ExecuteAutomationOptions {
  admin: boolean;
  userId: string;
  items: InventoryItem[];
  addItem: (input: ItemFormInput) => { error?: string; itemId?: string };
  updateItem: (id: string, input: ItemFormInput) => { error?: string };
  deleteItem: (id: string) => void;
  regenerateProductImage: (
    itemId: string,
    options?: { imageHint?: string }
  ) => Promise<{ error?: string }>;
  owners: AutomationOwner[];
}

export interface ExecuteAutomationResult {
  success: boolean;
  message: string;
}

function resolveOwnerId(
  ownerName: string | undefined,
  admin: boolean,
  userId: string,
  owners: AutomationOwner[]
): string {
  if (!admin || !ownerName?.trim()) return userId;

  const match = owners.find(
    (owner) => owner.name.toLowerCase() === ownerName.trim().toLowerCase()
  );
  return match?.id ?? userId;
}

function findItem(
  items: InventoryItem[],
  match?: { sku?: string; name?: string }
): InventoryItem | undefined {
  if (!match) return undefined;

  if (match.sku?.trim()) {
    const bySku = items.find(
      (item) => item.sku.toLowerCase() === match.sku!.trim().toLowerCase()
    );
    if (bySku) return bySku;
  }

  if (match.name?.trim()) {
    const query = match.name.trim().toLowerCase();
    return items.find((item) => item.name.toLowerCase().includes(query));
  }

  return undefined;
}

export function executeAutomationAction(
  action: AutomationAction,
  options: ExecuteAutomationOptions
): ExecuteAutomationResult | Promise<ExecuteAutomationResult> {
  const {
    admin,
    userId,
    items,
    addItem,
    updateItem,
    deleteItem,
    regenerateProductImage,
    owners,
  } = options;

  switch (action.type) {
    case "add_item": {
      if (!action.item?.name?.trim()) {
        return {
          success: false,
          message: "I need a product name to add an item.",
        };
      }

      const ownerId = resolveOwnerId(
        action.item.ownerName,
        admin,
        userId,
        owners
      );
      const input = toItemFormInput(action.item, ownerId);
      const result = addItem(input);

      if (result.error) {
        return { success: false, message: result.error };
      }

      return {
        success: true,
        message: `Added ${input.name} (${input.sku}) — ${input.quantity} ${input.unit} at ${input.location}. Generating product image…`,
      };
    }

    case "update_quantity": {
      const item = findItem(items, action.match);
      if (!item) {
        return {
          success: false,
          message: "I couldn't find that item. Try including the SKU or full name.",
        };
      }

      if (!admin && item.ownerId !== userId) {
        return { success: false, message: "You can only update your own items." };
      }

      const form = itemToFormInput(item);
      const nextQuantity =
        action.quantity != null
          ? Math.max(0, action.quantity)
          : Math.max(0, form.quantity + (action.adjustBy ?? 0));

      const result = updateItem(item.id, { ...form, quantity: nextQuantity });
      if (result.error) {
        return { success: false, message: result.error };
      }

      return {
        success: true,
        message: `Updated ${item.name} quantity to ${nextQuantity} ${item.unit}.`,
      };
    }

    case "update_item": {
      const item = findItem(items, action.match);
      if (!item) {
        return {
          success: false,
          message: "I couldn't find that item to update.",
        };
      }

      if (!admin && item.ownerId !== userId) {
        return { success: false, message: "You can only update your own items." };
      }

      const form = itemToFormInput(item);
      const updates = action.updates ?? {};
      const ownerId = resolveOwnerId(
        updates.ownerName,
        admin,
        form.ownerId,
        owners
      );

      const result = updateItem(item.id, {
        ...form,
        name: updates.name?.trim() || form.name,
        sku: updates.sku?.trim().toUpperCase() || form.sku,
        category: updates.category ?? form.category,
        unit: updates.unit ?? form.unit,
        location: updates.location?.trim() || form.location,
        quantity: updates.quantity ?? form.quantity,
        minStock: updates.minStock ?? form.minStock,
        ownerId,
      });

      if (result.error) {
        return { success: false, message: result.error };
      }

      return {
        success: true,
        message: `Updated ${updates.name?.trim() || item.name} successfully.`,
      };
    }

    case "delete_item": {
      const item = findItem(items, action.match);
      if (!item) {
        return {
          success: false,
          message: "I couldn't find that item to delete.",
        };
      }

      if (!admin && item.ownerId !== userId) {
        return { success: false, message: "You can only delete your own items." };
      }

      deleteItem(item.id);
      return {
        success: true,
        message: `Removed ${item.name} from inventory.`,
      };
    }

    case "regenerate_image": {
      const item = findItem(items, action.match);
      if (!item) {
        return {
          success: false,
          message: "I couldn't find that item to regenerate its image.",
        };
      }

      if (!admin && item.ownerId !== userId) {
        return {
          success: false,
          message: "You can only update images for your own items.",
        };
      }

      return regenerateProductImage(item.id, {
        imageHint: action.imageHint,
      }).then((result) => {
        if (result.error) {
          return { success: false, message: result.error };
        }
        return {
          success: true,
          message: `Regenerating image for ${item.name}${action.imageHint ? ` (${action.imageHint})` : ""}…`,
        };
      });
    }

    default:
      return { success: false, message: "Unsupported action." };
  }
}

export function getAutomationOwners(admin: boolean): AutomationOwner[] {
  if (!admin) return [];
  return inventoryUsers
    .filter((user) => user.role === "user")
    .map((user) => ({ id: user.id, name: user.name }));
}

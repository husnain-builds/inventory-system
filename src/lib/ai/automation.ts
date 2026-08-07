import type { ItemFormInput } from "@/lib/inventory-utils";
import { CATEGORIES, UNITS } from "@/lib/inventory-utils";
import type { AIInventoryContext } from "./types";

export type AutomationIntent = "action" | "chat";

export type AutomationActionType =
  | "add_item"
  | "update_quantity"
  | "update_item"
  | "delete_item"
  | "regenerate_image";

export interface AutomationItemPayload {
  name: string;
  sku?: string;
  category?: string;
  quantity?: number;
  minStock?: number;
  unit?: string;
  location?: string;
  ownerName?: string;
}

export interface AutomationMatch {
  sku?: string;
  name?: string;
}

export interface AutomationAction {
  type: AutomationActionType;
  item?: AutomationItemPayload;
  match?: AutomationMatch;
  quantity?: number;
  adjustBy?: number;
  updates?: Partial<AutomationItemPayload>;
  imageHint?: string;
}

export interface AutomationPlan {
  intent: AutomationIntent;
  reply: string;
  action?: AutomationAction;
}

export interface AutomationOwner {
  id: string;
  name: string;
}

export function buildAutomationSystemPrompt(
  context: AIInventoryContext,
  owners: AutomationOwner[]
): string {
  return `You are StockFlow Automation AI. Parse user requests into inventory actions OR answer questions.

Current user: ${context.userName} (${context.role})

Valid categories: ${CATEGORIES.join(", ")}
Valid units: ${UNITS.join(", ")}
Warehouse users: ${owners.map((owner) => owner.name).join(", ") || "none"}

Existing inventory (${context.items.length} items):
${context.items
  .slice(0, 30)
  .map(
    (item) =>
      `- ${item.name} | SKU: ${item.sku} | ${item.quantity} ${item.unit} | ${item.location}${item.ownerName ? ` | ${item.ownerName}` : ""}`
  )
  .join("\n")}

Supported actions:
- add_item — create a new product (needs at least name; infer sku/category/quantity/location from context)
- update_quantity — set or adjust stock for an existing item (use match.sku or match.name)
- update_item — change fields on an existing item
- delete_item — remove an item (use match.sku or match.name)
- regenerate_image — create a new AI product photo for an existing item (use match.sku or match.name; optional imageHint for style/details)

Rules:
- If the user wants to DO something (add, create, update, remove, restock, delete, regenerate image, change photo), intent is "action".
- If they are asking a question or chatting, intent is "chat" and omit action.
- For vague "add a product" with no details, intent "chat" and ask for name, quantity, and location in reply.
- Non-admin users cannot assign items to other owners.
- Use realistic defaults: minStock 5, unit "units", category "Supplies" when unknown.
- Generate sku like "NAME-001" from product name if not provided.

Respond with ONLY valid JSON:
{
  "intent": "action" | "chat",
  "reply": "short user-facing message",
  "action": {
    "type": "add_item" | "update_quantity" | "update_item" | "delete_item" | "regenerate_image",
    "item": { "name", "sku", "category", "quantity", "minStock", "unit", "location", "ownerName" },
    "match": { "sku", "name" },
    "quantity": number,
    "adjustBy": number,
    "updates": { ... },
    "imageHint": "optional description for new product photo"
  }
}

Include "action" only when intent is "action".`;
}

function stripJsonFence(raw: string): string {
  return raw.replace(/^```json\s*|\s*```$/g, "").trim();
}

export function parseAutomationPlan(raw: string): AutomationPlan | null {
  try {
    const parsed = JSON.parse(stripJsonFence(raw)) as Partial<AutomationPlan> & {
      action?: Partial<AutomationAction>;
    };

    if (
      parsed.intent !== "action" &&
      parsed.intent !== "chat"
    ) {
      return null;
    }

    if (typeof parsed.reply !== "string" || !parsed.reply.trim()) {
      return null;
    }

    if (parsed.intent === "chat") {
      return { intent: "chat", reply: parsed.reply.trim() };
    }

    const action = parsed.action;
    if (!action?.type) return null;

    const validTypes: AutomationActionType[] = [
      "add_item",
      "update_quantity",
      "update_item",
      "delete_item",
      "regenerate_image",
    ];
    if (!validTypes.includes(action.type)) return null;

    return {
      intent: "action",
      reply: parsed.reply.trim(),
      action: action as AutomationAction,
    };
  } catch {
    return null;
  }
}

export function normalizeCategory(value?: string): string {
  if (!value?.trim()) return CATEGORIES[0];
  const match = CATEGORIES.find(
    (category) => category.toLowerCase() === value.trim().toLowerCase()
  );
  return match ?? CATEGORIES[0];
}

export function normalizeUnit(value?: string): string {
  if (!value?.trim()) return UNITS[0];
  const match = UNITS.find(
    (unit) => unit.toLowerCase() === value.trim().toLowerCase()
  );
  return match ?? UNITS[0];
}

export function generateSku(name: string): string {
  const base = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 12);
  const suffix = Date.now().toString(36).slice(-4).toUpperCase();
  return `${base || "ITEM"}-${suffix}`;
}

export function toItemFormInput(
  payload: AutomationItemPayload,
  ownerId: string
): ItemFormInput {
  return {
    name: payload.name.trim(),
    sku: (payload.sku?.trim() || generateSku(payload.name)).toUpperCase(),
    category: normalizeCategory(payload.category),
    quantity: Math.max(0, payload.quantity ?? 0),
    minStock: Math.max(0, payload.minStock ?? 5),
    unit: normalizeUnit(payload.unit),
    location: payload.location?.trim() || "Warehouse A",
    ownerId,
  };
}

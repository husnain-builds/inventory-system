import { completePrompt } from "@/lib/ai/client";
import { normalizeCategory } from "@/lib/ai/automation";
import { CATEGORIES } from "@/lib/inventory-utils";

export interface CategorySuggestion {
  category: string;
  reason: string;
  alternatives: string[];
}

function parseCategorySuggestion(raw: string, name: string): CategorySuggestion {
  try {
    const json = raw.replace(/^```json\s*|\s*```$/g, "").trim();
    const parsed = JSON.parse(json) as {
      category?: string;
      reason?: string;
      alternatives?: string[];
    };

    const category = normalizeCategory(parsed.category);
    const alternatives = (parsed.alternatives ?? [])
      .map((value) => normalizeCategory(value))
      .filter((value, index, list) => list.indexOf(value) === index && value !== category)
      .slice(0, 2);

    return {
      category,
      reason: parsed.reason?.trim() || `Best fit for "${name}".`,
      alternatives,
    };
  } catch {
    return fallbackSuggestion(name);
  }
}

function fallbackSuggestion(name: string): CategorySuggestion {
  const lower = name.toLowerCase();
  let category = "Supplies";

  if (/mouse|keyboard|monitor|laptop|phone|cable|electronic|usb|battery/.test(lower)) {
    category = "Electronics";
  } else if (/chair|desk|table|shelf|furniture|cabinet/.test(lower)) {
    category = "Furniture";
  } else if (/helmet|glove|vest|mask|safety|harness/.test(lower)) {
    category = "Safety";
  } else if (/drill|printer|scanner|tool|equipment|machine/.test(lower)) {
    category = "Equipment";
  }

  const alternatives = CATEGORIES.filter((entry) => entry !== category).slice(0, 2);
  return {
    category,
    reason: `Suggested from the product name "${name}".`,
    alternatives,
  };
}

export async function suggestProductCategory(name: string): Promise<CategorySuggestion> {
  const trimmed = name.trim();
  if (!trimmed) {
    return {
      category: CATEGORIES[0],
      reason: "Enter a product name to get a category suggestion.",
      alternatives: [],
    };
  }

  try {
    const result = await completePrompt(
      `Pick the best inventory category for this product name: "${trimmed}"

Valid categories: ${CATEGORIES.join(", ")}

Return ONLY JSON:
{
  "category": "one of the valid categories",
  "reason": "short reason",
  "alternatives": ["optional second choice", "optional third choice"]
}`,
      {
        system:
          "You classify warehouse products into categories. Respond with valid JSON only.",
        maxTokens: 180,
      }
    );

    return parseCategorySuggestion(result.reply, trimmed);
  } catch {
    return fallbackSuggestion(trimmed);
  }
}

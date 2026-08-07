import type { InventoryItem, StockStatus } from "@/lib/mock-data";
import { CATEGORIES } from "@/lib/inventory-utils";

export interface NLSearchFilters {
  searchTerms: string[];
  categories: string[];
  statuses: StockStatus[];
  locations: string[];
  ownerNames: string[];
}

export interface NLSearchResult {
  filters: NLSearchFilters;
  explanation: string;
  usedAi: boolean;
}

const EMPTY_FILTERS: NLSearchFilters = {
  searchTerms: [],
  categories: [],
  statuses: [],
  locations: [],
  ownerNames: [],
};

export function parseNaturalLanguageQuery(query: string): NLSearchResult {
  const q = query.toLowerCase().trim();
  if (!q) {
    return {
      filters: EMPTY_FILTERS,
      explanation: "Showing all items.",
      usedAi: false,
    };
  }

  const filters: NLSearchFilters = {
    searchTerms: [],
    categories: [],
    statuses: [],
    locations: [],
    ownerNames: [],
  };

  if (
    q.includes("out of stock") ||
    q.includes("out-of-stock") ||
    q.includes("empty")
  ) {
    filters.statuses.push("out-of-stock");
  }
  if (q.includes("low stock") || q.includes("low-stock") || q.includes("running low")) {
    filters.statuses.push("low-stock");
  }
  if (
    q.includes("in stock") ||
    q.includes("healthy") ||
    q.includes("available")
  ) {
    filters.statuses.push("in-stock");
  }
  if (q.includes("alert") || q.includes("urgent") || q.includes("attention")) {
    filters.statuses.push("low-stock", "out-of-stock");
  }

  for (const category of CATEGORIES) {
    if (q.includes(category.toLowerCase())) {
      filters.categories.push(category);
    }
  }

  const locationMatch = q.match(
    /(?:in|at|warehouse|location)\s+([a-z0-9\s-]+)/i
  );
  if (locationMatch?.[1]) {
    filters.locations.push(locationMatch[1].trim());
  }

  if (q.includes("warehouse a")) filters.locations.push("warehouse a");
  if (q.includes("warehouse b")) filters.locations.push("warehouse b");
  if (q.includes("retail")) filters.locations.push("retail");

  const ownerPatterns = [
    "elena",
    "marcus",
    "sarah",
    "james",
    "admin",
  ];
  for (const name of ownerPatterns) {
    if (q.includes(name)) filters.ownerNames.push(name);
  }

  const stopWords = new Set([
    "show",
    "me",
    "my",
    "all",
    "the",
    "with",
    "that",
    "have",
    "has",
    "are",
    "is",
    "in",
    "at",
    "for",
    "and",
    "or",
    "items",
    "item",
    "inventory",
    "stock",
    "low",
    "out",
    "of",
    "warehouse",
    "location",
    "which",
    "who",
    "most",
  ]);

  const words = q
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  for (const word of words) {
    const isCategory = CATEGORIES.some((c) =>
      c.toLowerCase().includes(word)
    );
    const isStatus =
      word === "alert" ||
      word === "urgent" ||
      filters.statuses.length > 0;
    if (!isCategory && !isStatus && !filters.ownerNames.includes(word)) {
      filters.searchTerms.push(word);
    }
  }

  filters.statuses = [...new Set(filters.statuses)];
  filters.categories = [...new Set(filters.categories)];
  filters.locations = [...new Set(filters.locations)];
  filters.ownerNames = [...new Set(filters.ownerNames)];
  filters.searchTerms = [...new Set(filters.searchTerms)];

  const parts: string[] = [];
  if (filters.statuses.length) parts.push(`status: ${filters.statuses.join(", ")}`);
  if (filters.categories.length) parts.push(`categories: ${filters.categories.join(", ")}`);
  if (filters.locations.length) parts.push(`locations matching "${filters.locations.join(", ")}"`);
  if (filters.ownerNames.length) parts.push(`owners matching "${filters.ownerNames.join(", ")}"`);
  if (filters.searchTerms.length) parts.push(`keywords: ${filters.searchTerms.join(", ")}`);

  return {
    filters,
    explanation: parts.length
      ? `Filtering by ${parts.join(" · ")}`
      : `Searching for "${query}" across names, SKUs, and locations.`,
    usedAi: false,
  };
}

export function applyNLSearchFilters(
  items: InventoryItem[],
  filters: NLSearchFilters,
  ownerNames?: Map<string, string>
): InventoryItem[] {
  const hasFilters =
    filters.searchTerms.length > 0 ||
    filters.categories.length > 0 ||
    filters.statuses.length > 0 ||
    filters.locations.length > 0 ||
    filters.ownerNames.length > 0;

  if (!hasFilters) return items;

  return items.filter((item) => {
    if (
      filters.statuses.length > 0 &&
      !filters.statuses.includes(item.status)
    ) {
      return false;
    }

    if (
      filters.categories.length > 0 &&
      !filters.categories.some(
        (c) => c.toLowerCase() === item.category.toLowerCase()
      )
    ) {
      return false;
    }

    if (filters.locations.length > 0) {
      const loc = item.location.toLowerCase();
      if (!filters.locations.some((l) => loc.includes(l.toLowerCase()))) {
        return false;
      }
    }

    if (filters.ownerNames.length > 0) {
      const owner = ownerNames?.get(item.ownerId)?.toLowerCase() ?? "";
      if (!filters.ownerNames.some((n) => owner.includes(n.toLowerCase()))) {
        return false;
      }
    }

    if (filters.searchTerms.length > 0) {
      const haystack = [
        item.name,
        item.sku,
        item.category,
        item.location,
        ownerNames?.get(item.ownerId) ?? "",
      ]
        .join(" ")
        .toLowerCase();

      if (
        !filters.searchTerms.every((term) => haystack.includes(term.toLowerCase()))
      ) {
        return false;
      }
    }

    return true;
  });
}

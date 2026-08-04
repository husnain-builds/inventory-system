"use client";

import { useCallback, useMemo, useState } from "react";
import { Search, Sparkles, X } from "lucide-react";
import type { InventoryItem } from "@/lib/mock-data";
import {
  applyNLSearchFilters,
  parseNaturalLanguageQuery,
  type NLSearchResult,
} from "@/lib/ai/natural-language-search";
import { inventoryUsers } from "@/lib/mock-data";

const EXAMPLES = [
  "low stock safety items",
  "out of stock in warehouse A",
  "electronics",
  "items assigned to elena",
];

interface NaturalLanguageSearchBarProps {
  items: InventoryItem[];
  admin?: boolean;
  onResults: (filtered: InventoryItem[], meta: NLSearchResult | null) => void;
}

export function NaturalLanguageSearchBar({
  items,
  admin = false,
  onResults,
}: NaturalLanguageSearchBarProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<NLSearchResult | null>(null);

  const ownerNames = useMemo(
    () => new Map(inventoryUsers.map((u) => [u.id, u.name])),
    []
  );

  const runSearch = useCallback(
    async (rawQuery: string) => {
      const trimmed = rawQuery.trim();
      if (!trimmed) {
        setMeta(null);
        onResults(items, null);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: trimmed,
            owners: admin
              ? inventoryUsers.filter((u) => u.role === "user").map((u) => u.name)
              : [],
          }),
        });

        const result = (await res.json()) as NLSearchResult;
        const filtered = applyNLSearchFilters(
          items,
          result.filters,
          admin ? ownerNames : undefined
        );
        setMeta(result);
        onResults(filtered, result);
      } catch {
        const fallback = parseNaturalLanguageQuery(trimmed);
        const filtered = applyNLSearchFilters(
          items,
          fallback.filters,
          admin ? ownerNames : undefined
        );
        setMeta(fallback);
        onResults(filtered, fallback);
      } finally {
        setLoading(false);
      }
    },
    [items, admin, ownerNames, onResults]
  );

  function clearSearch() {
    setQuery("");
    setMeta(null);
    onResults(items, null);
  }

  return (
    <div className="mb-4">
      <form
        className="relative"
        onSubmit={(e) => {
          e.preventDefault();
          void runSearch(query);
        }}
      >
        <Sparkles className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-accent-primary" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Try "low stock safety items in warehouse A"'
          className="w-full rounded-xl border border-border bg-surface-elevated py-2.5 pl-10 pr-24 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-accent-primary/50 focus:ring-2 focus:ring-accent-primary/15"
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex h-8 items-center gap-1 rounded-lg bg-accent-primary px-3 text-xs font-semibold text-white disabled:opacity-60"
          >
            <Search className="h-3.5 w-3.5" />
            {loading ? "…" : "Search"}
          </button>
        </div>
      </form>

      {meta && (
        <p className="mt-2 text-xs text-text-muted">
          {meta.explanation}
          {meta.usedAi ? " · AI parsed" : " · Smart filter"}
        </p>
      )}

      {!query && (
        <div className="mt-2 flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                setQuery(example);
                void runSearch(example);
              }}
              className="rounded-full border border-border bg-surface px-2.5 py-1 text-[10px] font-medium text-text-secondary transition-colors hover:border-accent-primary/30 hover:text-accent-primary"
            >
              {example}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

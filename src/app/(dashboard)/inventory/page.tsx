"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-provider";
import { isAdmin } from "@/lib/auth";
import { useInventory } from "@/context/inventory-provider";
import { PageHeader } from "@/components/inventory/page-header";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { NaturalLanguageSearchBar } from "@/components/ai/natural-language-search-bar";
import type { InventoryItem } from "@/lib/mock-data";
import type { NLSearchResult } from "@/lib/ai/natural-language-search";

export default function InventoryPage() {
  const { user } = useAuth();
  const admin = isAdmin(user);
  const { getVisibleItems } = useInventory();

  const allItems = getVisibleItems(admin, user?.id ?? "");
  const [displayItems, setDisplayItems] = useState<InventoryItem[]>(allItems);
  const [searchMeta, setSearchMeta] = useState<NLSearchResult | null>(null);

  const handleResults = useCallback(
    (filtered: InventoryItem[], meta: NLSearchResult | null) => {
      setDisplayItems(filtered);
      setSearchMeta(meta);
    },
    []
  );

  useEffect(() => {
    if (!searchMeta) {
      setDisplayItems(allItems);
    }
  }, [allItems, searchMeta]);

  return (
    <div className="page-shell">
      <PageHeader
        title={admin ? "All Inventory" : "My Inventory"}
        subtitle={
          admin
            ? "Complete stock list across all users and warehouse locations."
            : "All items currently assigned to your account."
        }
        showAddItem
      />

      <NaturalLanguageSearchBar
        items={allItems}
        admin={admin}
        onResults={handleResults}
      />

      {searchMeta && displayItems.length === 0 && (
        <p className="mb-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-muted">
          No items match your search. Try a different phrase or clear the filter.
        </p>
      )}

      <InventoryTable items={displayItems} showOwner={admin} />
    </div>
  );
}

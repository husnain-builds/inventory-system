"use client";

import { useCallback, useMemo, useState } from "react";
import { useAuth } from "@/context/auth-provider";
import { isAdmin } from "@/lib/auth";
import { useInventory } from "@/context/inventory-provider";
import { PageHeader } from "@/components/inventory/page-header";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { NaturalLanguageSearchBar } from "@/components/ai/natural-language-search-bar";
import {
  applyNLSearchFilters,
  type NLSearchResult,
} from "@/lib/ai/natural-language-search";
import { inventoryUsers } from "@/lib/mock-data";

export default function InventoryPage() {
  const { user } = useAuth();
  const admin = isAdmin(user);
  const { getVisibleItems } = useInventory();

  const allItems = getVisibleItems(admin, user?.id ?? "");
  const [searchMeta, setSearchMeta] = useState<NLSearchResult | null>(null);

  const ownerNames = useMemo(
    () => new Map(inventoryUsers.map((u) => [u.id, u.name])),
    []
  );

  const displayItems = useMemo(() => {
    if (!searchMeta) return allItems;
    return applyNLSearchFilters(
      allItems,
      searchMeta.filters,
      admin ? ownerNames : undefined
    );
  }, [allItems, searchMeta, admin, ownerNames]);

  const handleSearchMeta = useCallback((meta: NLSearchResult | null) => {
    setSearchMeta(meta);
  }, []);

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

      <NaturalLanguageSearchBar admin={admin} onSearchMeta={handleSearchMeta} />

      {searchMeta && displayItems.length === 0 && (
        <p className="mb-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-muted">
          No items match your search. Try a different phrase or clear the filter.
        </p>
      )}

      <InventoryTable items={displayItems} showOwner={admin} />
    </div>
  );
}

"use client";

import { useAuth } from "@/context/auth-provider";
import { isAdmin } from "@/lib/auth";
import { useInventory } from "@/context/inventory-provider";
import { PageHeader } from "@/components/inventory/page-header";
import { InventoryTable } from "@/components/inventory/inventory-table";

export default function InventoryPage() {
  const { user } = useAuth();
  const admin = isAdmin(user);
  const { getVisibleItems } = useInventory();

  const items = getVisibleItems(admin, user?.id ?? "");

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
      <InventoryTable items={items} showOwner={admin} />
    </div>
  );
}

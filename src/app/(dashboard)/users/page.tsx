"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-provider";
import { isAdmin } from "@/lib/auth";
import { useInventory } from "@/context/inventory-provider";
import { inventoryUsers } from "@/lib/mock-data";
import { PageHeader } from "@/components/inventory/page-header";
import { Package, Mail, Building2 } from "lucide-react";

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const admin = isAdmin(user);
  const { items } = useInventory();

  useEffect(() => {
    if (user && !admin) {
      router.replace("/");
    }
  }, [user, admin, router]);

  if (!admin) return null;

  const users = inventoryUsers.filter((u) => u.role === "user");

  return (
    <div className="page-shell">
      <PageHeader
        title="All Users"
        subtitle="Manage team members and view each user's assigned inventory."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {users.map((u) => {
          const userItems = items.filter((i) => i.ownerId === u.id);
          const lowStock = userItems.filter(
            (i) => i.status !== "in-stock"
          ).length;
          const totalQty = userItems.reduce((s, i) => s + i.quantity, 0);

          return (
            <div
              key={u.id}
              className="glass-card glass-card-glow overflow-hidden rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="border-b border-border bg-surface p-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-primary text-sm font-bold text-white shadow-sm">
                    {u.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-bold text-text-primary">
                      {u.name}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-text-muted">
                      <Mail className="h-3 w-3" />
                      {u.email}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-text-secondary">
                      <Building2 className="h-3 w-3" />
                      {u.department}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
                <div className="px-3 py-3 text-center">
                  <p className="text-lg font-bold text-text-primary">
                    {userItems.length}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                    Items
                  </p>
                </div>
                <div className="px-3 py-3 text-center">
                  <p className="text-lg font-bold text-text-primary">
                    {totalQty}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                    Units
                  </p>
                </div>
                <div className="px-3 py-3 text-center">
                  <p
                    className={`text-lg font-bold ${lowStock > 0 ? "text-accent-warning" : "text-accent-success"}`}
                  >
                    {lowStock}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                    Alerts
                  </p>
                </div>
              </div>

              <div className="p-3.5">
                <p className="section-label mb-2">Inventory</p>
                {userItems.length === 0 ? (
                  <p className="text-sm text-text-muted">No items assigned</p>
                ) : (
                  <ul className="space-y-2">
                    {userItems.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5 text-sm"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <Package className="h-4 w-4 shrink-0 text-accent-primary" />
                          <span className="truncate text-text-secondary">
                            {item.name}
                          </span>
                        </div>
                        <span className="shrink-0 font-semibold text-text-primary">
                          {item.quantity} {item.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

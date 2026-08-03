"use client";

import { useAuth } from "@/context/auth-provider";
import { isAdmin } from "@/lib/auth";
import { useInventory } from "@/context/inventory-provider";
import { PageHeader } from "@/components/inventory/page-header";
import { StatCard } from "@/components/inventory/stat-card";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { CategoryBarChart } from "@/components/inventory/charts/category-bar-chart";
import {
  Package,
  Users,
  Layers,
  ArrowUpRight,
  Activity,
  Boxes,
} from "lucide-react";
import Link from "next/link";

const activityColors = {
  add: "bg-accent-success-light text-accent-success",
  remove: "bg-accent-danger-light text-accent-danger",
  alert: "bg-accent-warning-light text-accent-warning",
  update: "bg-accent-info-light text-accent-info",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const admin = isAdmin(user);
  const {
    activity,
    getVisibleItems,
    getCategoryData,
    getStats,
  } = useInventory();

  const userId = user?.id ?? "";
  const items = getVisibleItems(admin, userId);
  const stats = getStats(admin, userId);
  const categoryData = getCategoryData(admin, userId);

  return (
    <div className="page-shell">
      <PageHeader
        title={
          admin
            ? "Inventory Overview"
            : `Hello, ${user?.name?.split(" ")[0] ?? "there"}`
        }
        subtitle={
          admin
            ? "Monitor stock levels, users, and alerts across your organization."
            : "Track your assigned inventory and stock alerts."
        }
        showAddItem
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {admin && "totalUsers" in stats ? (
          <StatCard
            label="Total Users"
            value={stats.totalUsers}
            icon={Users}
            trend="Active warehouse staff"
            variant="info"
          />
        ) : (
          <StatCard
            label="Total Units"
            value={stats.totalQuantity}
            icon={Boxes}
            trend="Across all your items"
            variant="info"
          />
        )}
        <StatCard
          label="Total Items"
          value={stats.totalItems}
          icon={Package}
          trend={`${stats.totalQuantity} units in stock`}
        />
        <StatCard
          label="Categories"
          value={stats.categories}
          icon={Layers}
          trend="Product types"
          variant="success"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 xl:gap-5">
        <div className="xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-text-primary">
              {admin ? "Recent Inventory" : "My Inventory"}
            </h2>
            <Link
              href="/inventory"
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-accent-primary transition-colors hover:bg-accent-primary-light"
            >
              View all
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <InventoryTable items={items.slice(0, 6)} showOwner={admin} />

          <div className="mt-4 glass-card rounded-2xl p-4 sm:p-5">
            <h3 className="mb-4 text-sm font-bold text-text-primary">
              Recent Activity
            </h3>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {activity.slice(0, 4).map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-start gap-3 rounded-xl border border-border bg-surface px-3 py-3 transition-colors hover:border-accent-primary/20 hover:bg-surface-hover/50"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${activityColors[entry.type]}`}
                  >
                    <Activity className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm leading-relaxed text-text-secondary">
                      {entry.message}
                    </p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {entry.timestamp}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="min-w-0">
          <div className="glass-card glass-card-glow rounded-2xl p-4 transition-shadow hover:shadow-md sm:p-5">
            <h3 className="mb-1 text-sm font-bold text-text-primary">
              By Category
            </h3>
            <p className="mb-4 text-[10px] text-text-muted">
              Hover to explore · {categoryData.length}{" "}
              {categoryData.length === 1 ? "category" : "categories"}
            </p>
            {categoryData.length > 0 ? (
              <CategoryBarChart
                data={categoryData}
                layout="horizontal"
              />
            ) : (
              <p className="py-8 text-center text-sm text-text-muted">
                No items yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useAuth } from "@/context/auth-provider";
import { isAdmin } from "@/lib/auth";
import { useInventory } from "@/context/inventory-provider";
import { stockTrend } from "@/lib/mock-data";
import { PageHeader } from "@/components/inventory/page-header";
import { StockTrendChart } from "@/components/inventory/charts/stock-trend-chart";
import { CategoryBarChart } from "@/components/inventory/charts/category-bar-chart";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const admin = isAdmin(user);
  const { getVisibleItems, getCategoryData } = useInventory();

  const items = getVisibleItems(admin, user?.id ?? "");
  const categoryData = getCategoryData(admin, user?.id ?? "");

  const inStock = items.filter((i) => i.status === "in-stock").length;
  const lowStock = items.filter((i) => i.status === "low-stock").length;
  const outOfStock = items.filter((i) => i.status === "out-of-stock").length;

  const trendData = stockTrend.map((m) => ({
    label: m.month,
    value: m.value,
  }));

  const statusCards = [
    {
      label: "In Stock",
      value: inStock,
      icon: CheckCircle2,
      color: "text-accent-success",
      bg: "bg-accent-success-light",
      border: "border-accent-success/20",
    },
    {
      label: "Low Stock",
      value: lowStock,
      icon: AlertTriangle,
      color: "text-accent-warning",
      bg: "bg-accent-warning-light",
      border: "border-accent-warning/20",
    },
    {
      label: "Out of Stock",
      value: outOfStock,
      icon: XCircle,
      color: "text-accent-danger",
      bg: "bg-accent-danger-light",
      border: "border-accent-danger/20",
    },
  ];

  return (
    <div className="page-shell">
      <PageHeader
        title="Analytics"
        subtitle={
          admin
            ? "Organization-wide inventory performance and trends."
            : "Performance insights for your inventory."
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {statusCards.map((card) => (
          <div
            key={card.label}
            className={`glass-card flex items-center gap-3 rounded-xl border p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${card.border}`}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}
            >
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              <p className="text-sm font-medium text-text-secondary">
                {card.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="glass-card glass-card-glow rounded-xl p-4 transition-shadow hover:shadow-lg sm:p-5">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">
              Stock Volume Trend
            </h3>
            <span className="rounded-full bg-accent-primary-light px-2 py-0.5 text-[10px] font-bold text-accent-primary">
              6 months
            </span>
          </div>
          <p className="mb-3 text-xs text-text-muted">
            Hover bars to see monthly totals
          </p>
          <StockTrendChart data={trendData} height={220} />
        </div>

        <div className="glass-card glass-card-glow rounded-xl p-4 transition-shadow hover:shadow-lg sm:p-5">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">
              Items by Category
            </h3>
            <span className="rounded-full bg-accent-success-light px-2 py-0.5 text-[10px] font-bold text-accent-success">
              {categoryData.length} categories
            </span>
          </div>
          <p className="mb-2 text-xs text-text-muted">
            Hover bars to compare categories
          </p>
          {categoryData.length > 0 ? (
            <CategoryBarChart data={categoryData} layout="horizontal" />
          ) : (
            <p className="py-8 text-center text-sm text-text-muted">
              Add items to see category breakdown
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

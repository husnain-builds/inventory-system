"use client";

import { Plus } from "lucide-react";
import { useInventory } from "@/context/inventory-provider";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showAddItem?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  showAddItem = false,
}: PageHeaderProps) {
  const { openCreateModal } = useInventory();

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
        )}
      </div>
      {showAddItem && (
        <button
          type="button"
          onClick={openCreateModal}
          className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-accent-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-accent-primary/90 hover:shadow-md glow-primary sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      )}
    </div>
  );
}

"use client";

import type { InventoryItem, StockStatus } from "@/lib/mock-data";
import { getUserById } from "@/lib/mock-data";
import { useInventory } from "@/context/inventory-provider";
import { AlertTriangle, MapPin, Package, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

const statusStyles: Record<
  StockStatus,
  { badge: string; label: string }
> = {
  "in-stock": {
    badge: "bg-accent-success-light text-accent-success ring-accent-success/20",
    label: "In Stock",
  },
  "low-stock": {
    badge: "bg-accent-warning-light text-accent-warning ring-accent-warning/20",
    label: "Low Stock",
  },
  "out-of-stock": {
    badge: "bg-accent-danger-light text-accent-danger ring-accent-danger/20",
    label: "Out of Stock",
  },
};

function ItemActions({ item }: { item: InventoryItem }) {
  const { openEditModal, deleteItem } = useInventory();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (confirmDelete) {
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => {
            deleteItem(item.id);
            setConfirmDelete(false);
          }}
          className="rounded-lg bg-accent-danger px-2 py-1 text-[10px] font-bold text-white"
        >
          Confirm
        </button>
        <button
          type="button"
          onClick={() => setConfirmDelete(false)}
          className="rounded-lg border border-border px-2 py-1 text-[10px] font-medium text-text-muted"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => openEditModal(item)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-accent-primary-light hover:text-accent-primary"
        aria-label="Edit item"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setConfirmDelete(true)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-accent-danger-light hover:text-accent-danger"
        aria-label="Delete item"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function InventoryCard({
  item,
  showOwner,
}: {
  item: InventoryItem;
  showOwner?: boolean;
}) {
  const owner = getUserById(item.ownerId);
  const style = statusStyles[item.status];

  return (
    <div className="glass-card rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-primary/20 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-primary-light">
            <Package className="h-4 w-4 text-accent-primary" />
          </div>
          <div>
            <p className="font-semibold text-text-primary">{item.name}</p>
            <p className="font-mono text-xs text-text-muted">{item.sku}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ring-1 ring-inset ${style.badge}`}
          >
            {style.label}
          </span>
          <ItemActions item={item} />
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-surface px-3 py-2">
          <p className="text-text-muted">Quantity</p>
          <p className="font-bold text-text-primary">
            {item.quantity}{" "}
            <span className="font-normal text-text-muted">{item.unit}</span>
          </p>
        </div>
        <div className="rounded-lg bg-surface px-3 py-2">
          <p className="text-text-muted">Category</p>
          <p className="font-semibold text-text-primary">{item.category}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {item.location}
        </span>
        {showOwner && owner && (
          <span className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-primary-light text-[9px] font-bold text-accent-primary">
              {owner.avatar}
            </span>
            {owner.name}
          </span>
        )}
      </div>

      {item.status !== "in-stock" && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-accent-warning-light px-3 py-2 text-xs text-accent-warning">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Min stock: {item.minStock} {item.unit}
        </div>
      )}
    </div>
  );
}

interface InventoryTableProps {
  items: InventoryItem[];
  showOwner?: boolean;
}

export function InventoryTable({ items, showOwner = false }: InventoryTableProps) {
  if (items.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center rounded-2xl py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-hover">
          <Package className="h-7 w-7 text-text-muted" />
        </div>
        <p className="font-semibold text-text-primary">No inventory items</p>
        <p className="mt-1 text-sm text-text-muted">
          Click &quot;Add Item&quot; to create your first entry
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden">
        {items.map((item) => (
          <InventoryCard key={item.id} item={item} showOwner={showOwner} />
        ))}
      </div>

      <div className="glass-card hidden overflow-hidden rounded-2xl md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs uppercase tracking-wider text-text-muted">
                <th className="px-5 py-3.5 font-semibold">Item</th>
                <th className="px-5 py-3.5 font-semibold">SKU</th>
                <th className="px-5 py-3.5 font-semibold">Category</th>
                {showOwner && (
                  <th className="px-5 py-3.5 font-semibold">Owner</th>
                )}
                <th className="px-5 py-3.5 font-semibold">Qty</th>
                <th className="px-5 py-3.5 font-semibold">Location</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const owner = getUserById(item.ownerId);
                const style = statusStyles[item.status];
                return (
                  <tr
                    key={item.id}
                    className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface-hover/60"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-primary-light">
                          <Package className="h-4 w-4 text-accent-primary" />
                        </div>
                        <span className="font-semibold text-text-primary">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-text-muted">
                      {item.sku}
                    </td>
                    <td className="px-5 py-4 text-text-secondary">
                      {item.category}
                    </td>
                    {showOwner && (
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-primary-light text-[10px] font-bold text-accent-primary">
                            {owner?.avatar}
                          </span>
                          <span className="text-text-secondary">
                            {owner?.name}
                          </span>
                        </div>
                      </td>
                    )}
                    <td className="px-5 py-4">
                      <span className="font-bold text-text-primary">
                        {item.quantity}
                      </span>
                      <span className="ml-1 text-xs text-text-muted">
                        {item.unit}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-text-muted">
                      {item.location}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ring-1 ring-inset ${style.badge}`}
                      >
                        {style.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <ItemActions item={item} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

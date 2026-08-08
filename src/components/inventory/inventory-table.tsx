"use client";

import type { InventoryItem, StockStatus } from "@/lib/mock-data";
import { getUserById } from "@/lib/mock-data";
import { useInventory } from "@/context/inventory-provider";
import { ProductImageThumb } from "@/components/inventory/product-image-thumb";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Package,
  Pencil,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE_OPTIONS = [10, 50, 100] as const;

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
    <div className="glass-card rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-primary/20 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <ProductImageThumb
            name={item.name}
            imageUrl={item.imageUrl}
            pending={item.imagePending}
            size="md"
          />
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

      <div className="mb-2.5 grid grid-cols-2 gap-1.5 text-xs">
        <div className="rounded-md bg-surface px-2.5 py-1.5">
          <p className="text-text-muted">Quantity</p>
          <p className="font-bold text-text-primary">
            {item.quantity}{" "}
            <span className="font-normal text-text-muted">{item.unit}</span>
          </p>
        </div>
        <div className="rounded-md bg-surface px-2.5 py-1.5">
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
        <div className="mt-2.5 flex items-center gap-2 rounded-md bg-accent-warning-light px-2.5 py-1.5 text-xs text-accent-warning">
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
  /** When false, shows a fixed slice without pagination controls (e.g. dashboard preview). */
  paginate?: boolean;
  /** Max rows when paginate is false. */
  limit?: number;
  defaultPageSize?: (typeof PAGE_SIZE_OPTIONS)[number];
}

function TablePagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 border-t border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-text-muted">
        Showing{" "}
        <span className="font-semibold text-text-secondary">
          {start}–{end}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-text-secondary">{totalItems}</span>{" "}
        items
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="page-size" className="text-xs text-text-muted">
            Per page
          </label>
          <select
            id="page-size"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-lg border border-border bg-surface-elevated px-2.5 py-1.5 text-xs font-medium text-text-primary outline-none transition-colors focus:border-accent-primary/40"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[4.5rem] text-center text-xs font-medium text-text-secondary">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function InventoryTable({
  items,
  showOwner = false,
  paginate = true,
  limit,
  defaultPageSize = 10,
}: InventoryTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);

  const allItems = useMemo(() => {
    if (!paginate && limit != null) return items.slice(0, limit);
    return items;
  }, [items, paginate, limit]);

  const totalPages = Math.max(1, Math.ceil(allItems.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const visibleItems = useMemo(() => {
    if (!paginate) return allItems;
    const start = (safePage - 1) * pageSize;
    return allItems.slice(start, start + pageSize);
  }, [allItems, paginate, safePage, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [items.length, pageSize, paginate, limit]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  if (items.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center rounded-xl py-12 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-hover">
          <Package className="h-6 w-6 text-text-muted" />
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
        {visibleItems.map((item) => (
          <InventoryCard key={item.id} item={item} showOwner={showOwner} />
        ))}
      </div>

      <div className="glass-card hidden overflow-hidden rounded-xl md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-[11px] uppercase tracking-wider text-text-muted">
                <th className="px-4 py-3 font-semibold">Item</th>
                <th className="px-4 py-3 font-semibold">SKU</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                {showOwner && (
                  <th className="px-4 py-3 font-semibold">Owner</th>
                )}
                <th className="px-4 py-3 font-semibold">Qty</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item) => {
                const owner = getUserById(item.ownerId);
                const style = statusStyles[item.status];
                return (
                  <tr
                    key={item.id}
                    className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface-hover/60"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductImageThumb
                          name={item.name}
                          imageUrl={item.imageUrl}
                          pending={item.imagePending}
                        />
                        <span className="font-semibold text-text-primary">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-text-muted">
                      {item.sku}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {item.category}
                    </td>
                    {showOwner && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-primary-light text-[10px] font-bold text-accent-primary">
                            {owner?.avatar}
                          </span>
                          <span className="text-text-secondary">
                            {owner?.name}
                          </span>
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <span className="font-bold text-text-primary">
                        {item.quantity}
                      </span>
                      <span className="ml-1 text-xs text-text-muted">
                        {item.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {item.location}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ring-inset ${style.badge}`}
                      >
                        {style.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ItemActions item={item} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {paginate && allItems.length > 0 && (
          <TablePagination
            page={safePage}
            pageSize={pageSize}
            totalItems={allItems.length}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        )}
      </div>

      {paginate && allItems.length > 0 && (
        <div className="glass-card mt-3 overflow-hidden rounded-xl md:hidden">
          <TablePagination
            page={safePage}
            pageSize={pageSize}
            totalItems={allItems.length}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>
      )}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useInventory } from "@/context/inventory-provider";
import { useAuth } from "@/context/auth-provider";
import { isAdmin } from "@/lib/auth";
import { inventoryUsers } from "@/lib/mock-data";
import { CATEGORIES, UNITS, type ItemFormInput } from "@/lib/inventory-utils";
import type { InventoryItem } from "@/lib/mock-data";

const inputClass =
  "w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm text-text-primary outline-none transition-all focus:border-accent-primary/50 focus:ring-2 focus:ring-accent-primary/15";

function emptyForm(ownerId: string): ItemFormInput {
  return {
    name: "",
    sku: "",
    category: CATEGORIES[0],
    quantity: 0,
    minStock: 5,
    unit: UNITS[0],
    location: "",
    ownerId,
  };
}

function itemToForm(item: InventoryItem): ItemFormInput {
  return {
    name: item.name,
    sku: item.sku,
    category: item.category,
    quantity: item.quantity,
    minStock: item.minStock,
    unit: item.unit,
    location: item.location,
    ownerId: item.ownerId,
  };
}

export function ItemFormModal() {
  const { user } = useAuth();
  const admin = isAdmin(user);
  const { modalItem, isModalOpen, closeModal, addItem, updateItem } =
    useInventory();

  const [form, setForm] = useState<ItemFormInput>(
    emptyForm(user?.id ?? "u-elena")
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isModalOpen) return;
    setError("");
    if (modalItem) {
      setForm(itemToForm(modalItem));
    } else {
      setForm(emptyForm(user?.id ?? "u-elena"));
    }
  }, [isModalOpen, modalItem, user]);

  if (!isModalOpen) return null;

  function handleChange(
    field: keyof ItemFormInput,
    value: string | number
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = modalItem
      ? updateItem(modalItem.id, form)
      : addItem(form);
    if (result.error) setError(result.error);
  }

  const users = inventoryUsers.filter((u) => u.role === "user");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-text-primary/20 backdrop-blur-sm"
        onClick={closeModal}
        aria-label="Close"
      />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface-elevated p-5 shadow-xl sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">
            {modalItem ? "Edit Item" : "Add Item"}
          </h2>
          <button
            type="button"
            onClick={closeModal}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-text-muted hover:bg-surface-hover"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-accent-danger/20 bg-accent-danger-light px-4 py-3 text-sm text-accent-danger">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-text-secondary">
                Item Name
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={inputClass}
                placeholder="Wireless Mouse"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">
                SKU
              </label>
              <input
                required
                value={form.sku}
                onChange={(e) => handleChange("sku", e.target.value)}
                className={inputClass}
                placeholder="WM-2041"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">
                Quantity
              </label>
              <input
                required
                type="number"
                min={0}
                value={form.quantity}
                onChange={(e) =>
                  handleChange("quantity", parseInt(e.target.value) || 0)
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">
                Min Stock
              </label>
              <input
                required
                type="number"
                min={0}
                value={form.minStock}
                onChange={(e) =>
                  handleChange("minStock", parseInt(e.target.value) || 0)
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">
                Unit
              </label>
              <select
                value={form.unit}
                onChange={(e) => handleChange("unit", e.target.value)}
                className={inputClass}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">
                Location
              </label>
              <input
                required
                value={form.location}
                onChange={(e) => handleChange("location", e.target.value)}
                className={inputClass}
                placeholder="Shelf A-12"
              />
            </div>
            {admin && (
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Assigned User
                </label>
                <select
                  value={form.ownerId}
                  onChange={(e) => handleChange("ownerId", e.target.value)}
                  className={inputClass}
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.department}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-text-secondary hover:bg-surface-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-accent-primary py-2.5 text-sm font-semibold text-white hover:bg-accent-primary/90"
            >
              {modalItem ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

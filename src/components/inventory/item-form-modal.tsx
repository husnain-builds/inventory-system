"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Loader2, Sparkles, X } from "lucide-react";
import { useInventory } from "@/context/inventory-provider";
import { useAuth } from "@/context/auth-provider";
import { isAdmin } from "@/lib/auth";
import { inventoryUsers } from "@/lib/mock-data";
import { CATEGORIES, UNITS, type ItemFormInput } from "@/lib/inventory-utils";
import type { InventoryItem } from "@/lib/mock-data";
import { ProductImageThumb } from "@/components/inventory/product-image-thumb";

const inputClass =
  "w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm text-text-primary outline-none transition-all focus:border-accent-primary/50 focus:ring-2 focus:ring-accent-primary/15";

interface CategorySuggestion {
  category: string;
  reason: string;
  alternatives: string[];
}

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
    imageUrl: item.imageUrl,
  };
}

export function ItemFormModal() {
  const { user } = useAuth();
  const admin = isAdmin(user);
  const { modalItem, isModalOpen, closeModal, addItem, updateItem, items, regenerateProductImage } =
    useInventory();

  const [form, setForm] = useState<ItemFormInput>(
    emptyForm(user?.id ?? "u-elena")
  );
  const [error, setError] = useState("");
  const [imageHint, setImageHint] = useState("");
  const [imageBusy, setImageBusy] = useState(false);
  const [imageMessage, setImageMessage] = useState("");
  const [previewImageUrl, setPreviewImageUrl] = useState<string | undefined>();
  const [categorySuggestion, setCategorySuggestion] =
    useState<CategorySuggestion | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const liveItem = modalItem
    ? items.find((entry) => entry.id === modalItem.id) ?? modalItem
    : null;

  const displayImageUrl = modalItem ? liveItem?.imageUrl : previewImageUrl;
  const imagePending = modalItem ? liveItem?.imagePending : imageBusy;

  useEffect(() => {
    if (!isModalOpen) return;
    setError("");
    setImageHint("");
    setImageMessage("");
    setPreviewImageUrl(undefined);
    setCategorySuggestion(null);
    if (modalItem) {
      setForm(itemToForm(modalItem));
    } else {
      setForm(emptyForm(user?.id ?? "u-elena"));
    }
  }, [isModalOpen, modalItem, user]);

  useEffect(() => {
    if (!isModalOpen) return;

    const trimmed = form.name.trim();
    if (trimmed.length < 3) {
      setCategorySuggestion(null);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setCategoryLoading(true);
      try {
        const res = await fetch("/api/suggest-category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmed }),
        });
        const data = (await res.json()) as CategorySuggestion & { error?: string };
        if (!cancelled && res.ok) {
          setCategorySuggestion(data);
        }
      } catch {
        if (!cancelled) setCategorySuggestion(null);
      } finally {
        if (!cancelled) setCategoryLoading(false);
      }
    }, 700);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [form.name, isModalOpen]);

  if (!isModalOpen) return null;

  function handleChange(field: keyof ItemFormInput, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function applyCategory(category: string) {
    handleChange("category", category);
    setImageMessage("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = modalItem
      ? updateItem(modalItem.id, form)
      : addItem({ ...form, imageUrl: previewImageUrl });
    if (result.error) setError(result.error);
  }

  async function handleGenerateImage() {
    if (!form.name.trim()) {
      setError("Enter a product name before generating an image.");
      return;
    }

    setImageBusy(true);
    setImageMessage("");
    setError("");

    try {
      if (modalItem && liveItem) {
        const result = await regenerateProductImage(modalItem.id, {
          imageHint: imageHint.trim() || undefined,
        });
        if (result.error) {
          setError(result.error);
          return;
        }
        setImageMessage("New image is generating — it will appear in the table shortly.");
        setImageHint("");
        return;
      }

      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category,
          imageHint: imageHint.trim() || undefined,
          regenerate: Boolean(previewImageUrl),
        }),
      });
      const data = (await res.json()) as { imageUrl?: string; error?: string };
      if (!res.ok || !data.imageUrl) {
        throw new Error(data.error ?? "Failed to generate image.");
      }

      setPreviewImageUrl(data.imageUrl);
      setImageMessage("Preview ready — it will be saved when you add the item.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate image.");
    } finally {
      setImageBusy(false);
    }
  }

  const users = inventoryUsers.filter((u) => u.role === "user");
  const suggestedCategories = categorySuggestion
    ? [categorySuggestion.category, ...categorySuggestion.alternatives]
    : [];

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
              {(categoryLoading || categorySuggestion) && form.name.trim().length >= 3 && (
                <div className="mt-2 rounded-xl border border-accent-primary/20 bg-accent-primary-light/40 px-3 py-2.5">
                  <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-accent-primary">
                    <Sparkles className="h-3 w-3" />
                    AI category suggestions
                    {categoryLoading && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                  </div>
                  {categorySuggestion && (
                    <>
                      <p className="mb-2 text-xs text-text-secondary">
                        {categorySuggestion.reason}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedCategories.map((category) => (
                          <button
                            key={category}
                            type="button"
                            onClick={() => applyCategory(category)}
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                              form.category === category
                                ? "bg-accent-primary text-white"
                                : "border border-border bg-surface-elevated text-text-secondary hover:border-accent-primary/30 hover:text-accent-primary"
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
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

          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
              Product Image
            </p>
            <div className="flex items-start gap-4">
              <ProductImageThumb
                name={form.name.trim() || "New product"}
                imageUrl={displayImageUrl}
                pending={imagePending}
                size="md"
              />
              <div className="min-w-0 flex-1 space-y-3">
                <input
                  value={imageHint}
                  onChange={(e) => setImageHint(e.target.value)}
                  className={inputClass}
                  placeholder='Optional: "red packaging, side angle, on wooden desk"'
                  disabled={imageBusy || Boolean(liveItem?.imagePending)}
                />
                <button
                  type="button"
                  onClick={() => void handleGenerateImage()}
                  disabled={imageBusy || !form.name.trim() || Boolean(liveItem?.imagePending)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs font-semibold text-text-secondary transition-colors hover:border-accent-primary/30 hover:text-accent-primary disabled:opacity-50"
                >
                  {imageBusy || liveItem?.imagePending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ImagePlus className="h-3.5 w-3.5" />
                  )}
                  {displayImageUrl ? "Regenerate image" : "Generate image"}
                </button>
                {imageMessage && (
                  <p className="text-xs text-accent-success">{imageMessage}</p>
                )}
                {!modalItem && (
                  <p className="text-[11px] text-text-muted">
                    Generate a preview now, or leave blank to auto-generate after adding.
                  </p>
                )}
              </div>
            </div>
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

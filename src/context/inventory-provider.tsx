"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  inventoryItems as seedItems,
  recentActivity as seedActivity,
  inventoryUsers,
  type InventoryItem,
  type ActivityEntry,
} from "@/lib/mock-data";
import {
  computeStatus,
  formatRelativeTime,
  getCategoryBreakdown,
  getAdminStats,
  getUserStats,
  type ItemFormInput,
} from "@/lib/inventory-utils";
import { useAuth } from "@/context/auth-provider";

const ITEMS_KEY = "stockflow_inventory";
const ACTIVITY_KEY = "stockflow_activity";

interface InventoryContextValue {
  items: InventoryItem[];
  activity: ActivityEntry[];
  isLoading: boolean;
  modalItem: InventoryItem | null;
  isModalOpen: boolean;
  openCreateModal: () => void;
  openEditModal: (item: InventoryItem) => void;
  closeModal: () => void;
  addItem: (input: ItemFormInput) => { error?: string; itemId?: string };
  updateItem: (id: string, input: ItemFormInput) => { error?: string };
  deleteItem: (id: string) => void;
  regenerateProductImage: (
    itemId: string,
    options?: { imageHint?: string }
  ) => Promise<{ error?: string }>;
  getVisibleItems: (admin: boolean, userId: string) => InventoryItem[];
  getCategoryData: (admin: boolean, userId: string) => { label: string; value: number }[];
  getStats: (admin: boolean, userId: string) => ReturnType<typeof getAdminStats> | ReturnType<typeof getUserStats>;
  getAlertItems: (admin: boolean, userId: string) => InventoryItem[];
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

function loadItems(): InventoryItem[] {
  if (typeof window === "undefined") return seedItems;
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    return raw ? (JSON.parse(raw) as InventoryItem[]) : seedItems;
  } catch {
    return seedItems;
  }
}

function normalizeActivity(entries: ActivityEntry[]): ActivityEntry[] {
  const seen = new Set<string>();

  return entries.map((entry) => {
    if (!seen.has(entry.id)) {
      seen.add(entry.id);
      return entry;
    }

    const uniqueId = `${entry.id}-${Math.random().toString(36).slice(2, 8)}`;
    seen.add(uniqueId);
    return { ...entry, id: uniqueId };
  });
}

function loadActivity(): ActivityEntry[] {
  if (typeof window === "undefined") return seedActivity;
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    const parsed = raw ? (JSON.parse(raw) as ActivityEntry[]) : seedActivity;
    return normalizeActivity(parsed);
  } catch {
    return seedActivity;
  }
}

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>(seedItems);
  const [activity, setActivity] = useState<ActivityEntry[]>(seedActivity);
  const [isLoading, setIsLoading] = useState(true);
  const [modalItem, setModalItem] = useState<InventoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadedItems = loadItems();
    const loadedActivity = loadActivity();
    setItems(loadedItems);
    setActivity(loadedActivity);
    if (typeof window !== "undefined") {
      localStorage.setItem(ACTIVITY_KEY, JSON.stringify(loadedActivity));
    }
    setIsLoading(false);
  }, []);

  const persistItems = useCallback((next: InventoryItem[]) => {
    setItems(next);
    localStorage.setItem(ITEMS_KEY, JSON.stringify(next));
  }, []);

  const pushActivity = useCallback(
    (entry: Omit<ActivityEntry, "id" | "timestamp">) => {
      const newEntry: ActivityEntry = {
        ...entry,
        id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: formatRelativeTime(new Date()),
      };
      setActivity((prev) => {
        const next = normalizeActivity([
          newEntry,
          ...prev.filter((item) => item.id !== newEntry.id),
        ]).slice(0, 20);
        localStorage.setItem(ACTIVITY_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const openCreateModal = useCallback(() => {
    setModalItem(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((item: InventoryItem) => {
    setModalItem(item);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalItem(null);
  }, []);

  const buildItem = useCallback(
    (input: ItemFormInput, existing?: InventoryItem): InventoryItem => ({
      id: existing?.id ?? `i-${Date.now()}`,
      name: input.name.trim(),
      sku: input.sku.trim().toUpperCase(),
      category: input.category,
      quantity: input.quantity,
      minStock: input.minStock,
      unit: input.unit,
      location: input.location.trim(),
      ownerId: input.ownerId,
      lastUpdated: formatRelativeTime(new Date()),
      status: computeStatus(input.quantity, input.minStock),
      imageUrl: input.imageUrl ?? existing?.imageUrl,
      imagePending: existing?.imagePending,
    }),
    []
  );

  const attachProductImage = useCallback(
    async (
      itemId: string,
      name: string,
      category: string,
      options?: { imageHint?: string; regenerate?: boolean }
    ) => {
      setItems((prev) => {
        const next = prev.map((item) =>
          item.id === itemId ? { ...item, imagePending: true } : item
        );
        localStorage.setItem(ITEMS_KEY, JSON.stringify(next));
        return next;
      });

      try {
        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            category,
            imageHint: options?.imageHint,
            regenerate: options?.regenerate ?? Boolean(options?.imageHint),
          }),
        });
        const data = (await res.json()) as { imageUrl?: string; error?: string };
        if (!res.ok || !data.imageUrl) {
          throw new Error(data.error ?? "Failed to generate image.");
        }

        setItems((prev) => {
          const next = prev.map((item) =>
            item.id === itemId
              ? { ...item, imageUrl: data.imageUrl, imagePending: false }
              : item
          );
          localStorage.setItem(ITEMS_KEY, JSON.stringify(next));
          return next;
        });
      } catch {
        setItems((prev) => {
          const next = prev.map((item) =>
            item.id === itemId ? { ...item, imagePending: false } : item
          );
          localStorage.setItem(ITEMS_KEY, JSON.stringify(next));
          return next;
        });
      }
    },
    []
  );

  const regenerateProductImage = useCallback(
    async (itemId: string, options?: { imageHint?: string }) => {
      const item = items.find((entry) => entry.id === itemId);
      if (!item) return { error: "Item not found." };
      if (user?.role !== "admin" && item.ownerId !== user?.id) {
        return { error: "You can only update images for your own items." };
      }

      await attachProductImage(item.id, item.name, item.category, {
        imageHint: options?.imageHint,
        regenerate: true,
      });

      pushActivity({
        message: `${user?.name ?? "User"} regenerated image for ${item.name}`,
        type: "update",
      });

      return {};
    },
    [items, user, attachProductImage, pushActivity]
  );

  const addItem = useCallback(
    (input: ItemFormInput) => {
      if (!input.name.trim()) return { error: "Item name is required." };
      if (!input.sku.trim()) return { error: "SKU is required." };
      const ownerId =
        user?.role === "admin" ? input.ownerId : (user?.id ?? input.ownerId);
      const payload = { ...input, ownerId };
      if (items.some((i) => i.sku.toLowerCase() === payload.sku.trim().toLowerCase())) {
        return { error: "SKU already exists." };
      }
      const item = buildItem(payload);
      const hasPreviewImage = Boolean(input.imageUrl?.trim());
      const nextItem = hasPreviewImage
        ? { ...item, imageUrl: input.imageUrl!.trim(), imagePending: false }
        : { ...item, imagePending: true };

      persistItems([nextItem, ...items]);
      if (!hasPreviewImage) {
        void attachProductImage(item.id, item.name, item.category);
      }
      pushActivity({
        message: `${user?.name ?? "User"} added ${item.quantity}× ${item.name}`,
        type: "add",
      });
      closeModal();
      return { itemId: item.id };
    },
    [items, buildItem, persistItems, pushActivity, user, closeModal, attachProductImage]
  );

  const updateItem = useCallback(
    (id: string, input: ItemFormInput) => {
      if (!input.name.trim()) return { error: "Item name is required." };
      const existing = items.find((i) => i.id === id);
      if (!existing) return { error: "Item not found." };
      if (user?.role !== "admin" && existing.ownerId !== user?.id) {
        return { error: "You can only edit your own items." };
      }
      const ownerId =
        user?.role === "admin" ? input.ownerId : existing.ownerId;
      const payload = { ...input, ownerId };
      const duplicate = items.find(
        (i) =>
          i.id !== id &&
          i.sku.toLowerCase() === payload.sku.trim().toLowerCase()
      );
      if (duplicate) return { error: "SKU already exists." };
      const updated = buildItem(payload, existing);
      persistItems(items.map((i) => (i.id === id ? updated : i)));
      pushActivity({
        message: `${user?.name ?? "User"} updated ${updated.name}`,
        type: "update",
      });
      if (updated.status !== "in-stock" && existing.status === "in-stock") {
        pushActivity({
          message: `${updated.name} dropped below minimum stock`,
          type: "alert",
        });
      }
      closeModal();
      return {};
    },
    [items, buildItem, persistItems, pushActivity, user, closeModal]
  );

  const deleteItem = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;
      if (user?.role !== "admin" && item.ownerId !== user?.id) return;
      persistItems(items.filter((i) => i.id !== id));
      pushActivity({
        message: `${user?.name ?? "User"} removed ${item.name}`,
        type: "remove",
      });
    },
    [items, persistItems, pushActivity, user]
  );

  const getVisibleItems = useCallback(
    (admin: boolean, userId: string) =>
      admin ? items : items.filter((i) => i.ownerId === userId),
    [items]
  );

  const getCategoryData = useCallback(
    (admin: boolean, userId: string) =>
      getCategoryBreakdown(getVisibleItems(admin, userId)),
    [getVisibleItems]
  );

  const getStats = useCallback(
    (admin: boolean, userId: string) => {
      const visible = getVisibleItems(admin, userId);
      if (admin) {
        return getAdminStats(
          items,
          inventoryUsers.filter((u) => u.role === "user").length
        );
      }
      return getUserStats(visible);
    },
    [items, getVisibleItems]
  );

  const getAlertItems = useCallback(
    (admin: boolean, userId: string) =>
      getVisibleItems(admin, userId).filter((i) => i.status !== "in-stock"),
    [getVisibleItems]
  );

  const value = useMemo(
    () => ({
      items,
      activity,
      isLoading,
      modalItem,
      isModalOpen,
      openCreateModal,
      openEditModal,
      closeModal,
      addItem,
      updateItem,
      deleteItem,
      regenerateProductImage,
      getVisibleItems,
      getCategoryData,
      getStats,
      getAlertItems,
    }),
    [
      items,
      activity,
      isLoading,
      modalItem,
      isModalOpen,
      openCreateModal,
      openEditModal,
      closeModal,
      addItem,
      updateItem,
      deleteItem,
      regenerateProductImage,
      getVisibleItems,
      getCategoryData,
      getStats,
      getAlertItems,
    ]
  );

  return (
    <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory must be used within InventoryProvider");
  return ctx;
}

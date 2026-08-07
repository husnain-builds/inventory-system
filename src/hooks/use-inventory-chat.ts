"use client";

import { useCallback, useMemo, useState } from "react";
import { useAuth } from "@/context/auth-provider";
import { useInventory } from "@/context/inventory-provider";
import { isAdmin } from "@/lib/auth";
import { inventoryUsers } from "@/lib/mock-data";
import { buildAIContext } from "@/lib/ai/types";
import type { AutomationAction } from "@/lib/ai/automation";
import {
  executeAutomationAction,
  getAutomationOwners,
} from "@/lib/ai/execute-automation";

export interface InventoryChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  actionExecuted?: boolean;
}

export function useAIInventoryContext() {
  const { user } = useAuth();
  const admin = isAdmin(user);
  const { getVisibleItems, getStats, activity } = useInventory();

  return useMemo(() => {
    if (!user) return null;

    const items = getVisibleItems(admin, user.id);
    const stats = getStats(admin, user.id);
    const ownerNames = new Map(
      inventoryUsers.map((u) => [u.id, u.name])
    );

    return buildAIContext(
      admin ? "admin" : "user",
      user.name,
      items,
      activity,
      stats,
      admin ? ownerNames : undefined
    );
  }, [user, admin, getVisibleItems, getStats, activity]);
}

export function useInventoryChat() {
  const { user } = useAuth();
  const admin = isAdmin(user);
  const context = useAIInventoryContext();
  const { addItem, updateItem, deleteItem, getVisibleItems, regenerateProductImage } =
    useInventory();

  const [messages, setMessages] = useState<InventoryChatMessage[]>([]);
  const [status, setStatus] = useState<"ready" | "submitted" | "error">("ready");
  const [error, setError] = useState<Error | null>(null);
  const [provider, setProvider] = useState<string | null>(null);

  const sendInventoryMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !context || !user) return;

      const userMessage: InventoryChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      };

      setMessages((current) => [...current, userMessage]);
      setStatus("submitted");
      setError(null);

      try {
        const res = await fetch("/api/automation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: trimmed,
            context,
            owners: getAutomationOwners(admin),
          }),
        });

        const data = (await res.json()) as {
          intent?: "action" | "chat";
          reply?: string;
          action?: AutomationAction;
          provider?: string;
          error?: string;
        };

        if (!res.ok || !data.reply) {
          throw new Error(data.error ?? "Failed to get a response.");
        }

        setProvider(data.provider ?? null);

        let assistantContent = data.reply;

        if (data.intent === "action" && data.action) {
          const visibleItems = getVisibleItems(admin, user.id);
          const result = await Promise.resolve(
            executeAutomationAction(data.action, {
              admin,
              userId: user.id,
              items: visibleItems,
              addItem,
              updateItem,
              deleteItem,
              regenerateProductImage,
              owners: getAutomationOwners(admin),
            })
          );

          assistantContent = result.success
            ? result.message
            : `${result.message} ${data.reply}`;

          setMessages((current) => [
            ...current,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: assistantContent,
              actionExecuted: result.success,
            },
          ]);
        } else {
          setMessages((current) => [
            ...current,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: assistantContent,
            },
          ]);
        }

        setStatus("ready");
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to get a response."));
        setStatus("error");
      }
    },
    [
      context,
      user,
      admin,
      getVisibleItems,
      addItem,
      updateItem,
      deleteItem,
      regenerateProductImage,
    ]
  );

  return {
    messages,
    sendInventoryMessage,
    status,
    error,
    provider,
  };
}

"use client";

import { useCallback, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useAuth } from "@/context/auth-provider";
import { useInventory } from "@/context/inventory-provider";
import { isAdmin } from "@/lib/auth";
import { inventoryUsers } from "@/lib/mock-data";
import { buildAIContext } from "@/lib/ai/types";

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
  const context = useAIInventoryContext();
  const chat = useChat({
    transport: useMemo(
      () => new DefaultChatTransport({ api: "/api/chat" }),
      []
    ),
  });

  const sendInventoryMessage = useCallback(
    async (text: string) => {
      await chat.sendMessage({ text }, { body: { context } });
    },
    [chat, context]
  );

  return { ...chat, sendInventoryMessage };
}

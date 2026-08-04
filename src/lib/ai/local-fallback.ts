import type { AIInventoryContext } from "./types";

export function getLocalChatResponse(
  prompt: string,
  context: AIInventoryContext
): string {
  const q = prompt.toLowerCase().trim();

  const alerts = context.items.filter((i) => i.status !== "in-stock");
  const outOfStock = alerts.filter((i) => i.status === "out-of-stock");
  const lowStock = alerts.filter((i) => i.status === "low-stock");

  if (
    q.includes("summarize") ||
    q.includes("summary") ||
    q.includes("overview") ||
    q.includes("health")
  ) {
    const healthy = context.stats.totalItems - context.stats.lowStock;
    return `Here's your inventory snapshot:\n\n• ${context.stats.totalItems} items (${context.stats.totalQuantity} total units)\n• ${healthy} items are healthy, ${context.stats.lowStock} need attention\n• ${context.stats.categories} categories tracked\n\n${
      alerts.length > 0
        ? `Priority: ${outOfStock.length} out of stock, ${lowStock.length} low stock.`
        : "Everything looks healthy right now."
    }`;
  }

  if (
    q.includes("restock") ||
    q.includes("reorder") ||
    q.includes("low stock") ||
    q.includes("urgent") ||
    q.includes("attention") ||
    q.includes("first")
  ) {
    if (alerts.length === 0) {
      return "No items need restocking right now. All tracked inventory is above minimum stock levels.";
    }
    const sorted = [...alerts].sort((a, b) => {
      if (a.status === "out-of-stock" && b.status !== "out-of-stock") return -1;
      if (b.status === "out-of-stock" && a.status !== "out-of-stock") return 1;
      return a.quantity / Math.max(a.minStock, 1) - b.quantity / Math.max(b.minStock, 1);
    });
    const lines = sorted.slice(0, 5).map(
      (item) =>
        `• **${item.name}** (${item.sku}) — ${item.quantity}/${item.minStock} ${item.unit}, ${item.location} [${item.status.replace("-", " ")}]`
    );
    return `Restock these first:\n\n${lines.join("\n")}${
      alerts.length > 5 ? `\n\n…and ${alerts.length - 5} more.` : ""
    }`;
  }

  if (q.includes("activity") || q.includes("recent") || q.includes("happened")) {
    if (context.activity.length === 0) {
      return "No recent activity to report.";
    }
    return `Recent activity:\n\n${context.activity
      .slice(0, 5)
      .map((e) => `• ${e.message} (${e.timestamp})`)
      .join("\n")}`;
  }

  if (q.includes("category") || q.includes("categories")) {
    const counts = new Map<string, number>();
    for (const item of context.items) {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    }
    const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    if (ranked.length === 0) return "No inventory items to analyze by category.";
    return `Items by category:\n\n${ranked.map(([cat, n]) => `• ${cat}: ${n} item${n === 1 ? "" : "s"}`).join("\n")}`;
  }

  if (context.role === "admin" && (q.includes("user") || q.includes("team"))) {
    const byOwner = new Map<string, number>();
    for (const item of context.items) {
      const owner = item.ownerName ?? "Unassigned";
      byOwner.set(owner, (byOwner.get(owner) ?? 0) + 1);
    }
    return `Items by owner:\n\n${[...byOwner.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([owner, n]) => `• ${owner}: ${n} item${n === 1 ? "" : "s"}`)
      .join("\n")}`;
  }

  return `I can help with inventory summaries, restock priorities, recent activity, and category breakdowns. Try asking:\n\n• "Summarize inventory health"\n• "What should I restock first?"\n• "Show recent activity"\n\nTip: Add \`AI_GATEWAY_API_KEY\` for full AI-powered responses.`;
}

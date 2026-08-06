import { completePrompt } from "@/lib/ai/client";
import { buildChatSystemPrompt } from "@/lib/ai/prompts";
import type { AIInventoryContext } from "@/lib/ai/types";

export const maxDuration = 15;

export async function POST(req: Request) {
  const { context } = (await req.json()) as {
    context?: AIInventoryContext;
  };

  if (!context) {
    return Response.json({ error: "Missing inventory context." }, { status: 400 });
  }

  const prompt = `Summarize today's inventory status in 2-3 concise sentences for ${context.userName} (${context.role}).

Stats: ${context.stats.totalItems} items, ${context.stats.totalQuantity} units, ${context.stats.lowStock} need attention.

Items needing attention:
${
  context.items
    .filter((item) => item.status !== "in-stock")
    .slice(0, 8)
    .map((item) => `- ${item.name}: ${item.quantity}/${item.minStock} (${item.status})`)
    .join("\n") || "None — all items are healthy."
}`;

  try {
    const result = await completePrompt(prompt, {
      system: buildChatSystemPrompt(context),
      maxTokens: 256,
    });
    return Response.json({ text: result.reply, ...result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate summary.";
    return Response.json({ error: message }, { status: 503 });
  }
}

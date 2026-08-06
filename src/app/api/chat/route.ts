import { completeChat } from "@/lib/ai/client";
import type { ChatMessage } from "@/lib/ai/client";
import { buildChatSystemPrompt } from "@/lib/ai/prompts";
import type { AIInventoryContext } from "@/lib/ai/types";

export const maxDuration = 30;

export interface InventoryChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    messages?: InventoryChatMessage[];
    context?: AIInventoryContext;
  };

  if (!body.context) {
    return Response.json({ error: "Missing inventory context." }, { status: 400 });
  }

  const history = (body.messages ?? []).filter((message) => message.content?.trim());
  if (history.length === 0) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  const messages: ChatMessage[] = [
    { role: "system", content: buildChatSystemPrompt(body.context) },
    ...history.map((message) => ({
      role: message.role,
      content: message.content.trim(),
    })),
  ];

  try {
    const result = await completeChat(messages);
    return Response.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate a response.";
    return Response.json({ error: message }, { status: 503 });
  }
}

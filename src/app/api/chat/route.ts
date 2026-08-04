import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from "ai";
import { buildChatSystemPrompt } from "@/lib/ai/prompts";
import { getLocalChatResponse } from "@/lib/ai/local-fallback";
import type { AIInventoryContext } from "@/lib/ai/types";

export const maxDuration = 30;

function hasAiGateway(): boolean {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY ||
      process.env.VERCEL_OIDC_TOKEN ||
      process.env.AI_SDK_DEFAULT_PROVIDER
  );
}

function getLastUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role !== "user") continue;
    const text = message.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");
    if (text.trim()) return text.trim();
  }
  return "";
}

function localFallbackStream(text: string, messages: UIMessage[]) {
  const stream = createUIMessageStream({
    originalMessages: messages,
    execute: ({ writer }) => {
      const id = "local-response";
      writer.write({ type: "text-start", id });
      writer.write({ type: "text-delta", id, delta: text });
      writer.write({ type: "text-end", id });
    },
  });
  return createUIMessageStreamResponse({ stream });
}

export async function POST(req: Request) {
  const body = await req.json();
  const messages = (body.messages ?? []) as UIMessage[];
  const context = body.context as AIInventoryContext | undefined;

  if (!context) {
    return Response.json({ error: "Missing inventory context." }, { status: 400 });
  }

  const lastUserMessage = getLastUserText(messages);

  if (!hasAiGateway()) {
    const text = getLocalChatResponse(lastUserMessage || "help", context);
    return localFallbackStream(text, messages);
  }

  const result = streamText({
    model: "google/gemini-2.5-flash",
    system: buildChatSystemPrompt(context),
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 1024,
  });

  return result.toUIMessageStreamResponse();
}

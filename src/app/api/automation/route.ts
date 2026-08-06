import { completePrompt } from "@/lib/ai/client";
import {
  buildAutomationSystemPrompt,
  parseAutomationPlan,
  type AutomationOwner,
} from "@/lib/ai/automation";
import { buildChatSystemPrompt } from "@/lib/ai/prompts";
import type { AIInventoryContext } from "@/lib/ai/types";

export const maxDuration = 30;

export async function POST(req: Request) {
  const body = (await req.json()) as {
    prompt?: string;
    context?: AIInventoryContext;
    owners?: AutomationOwner[];
  };

  const prompt = body.prompt?.trim();
  if (!prompt) {
    return Response.json({ error: "Prompt is required." }, { status: 400 });
  }

  if (!body.context) {
    return Response.json({ error: "Missing inventory context." }, { status: 400 });
  }

  const owners = body.owners ?? [];

  try {
    const result = await completePrompt(prompt, {
      system: buildAutomationSystemPrompt(body.context, owners),
      maxTokens: 768,
    });

    const plan = parseAutomationPlan(result.reply);
    if (plan) {
      return Response.json({
        intent: plan.intent,
        reply: plan.reply,
        action: plan.action,
        provider: result.provider,
        model: result.model,
      });
    }

    const chat = await completePrompt(prompt, {
      system: buildChatSystemPrompt(body.context),
    });

    return Response.json({
      intent: "chat",
      reply: chat.reply,
      provider: chat.provider,
      model: chat.model,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to process automation.";
    return Response.json({ error: message }, { status: 503 });
  }
}

import type { CompletionResult } from "@/lib/ai/client";

export interface AskAIOptions {
  system?: string;
  model?: string;
}

export async function askAI(
  prompt: string,
  options?: AskAIOptions
): Promise<CompletionResult> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      system: options?.system,
      model: options?.model,
    }),
  });

  const data = (await res.json()) as CompletionResult & { error?: string };
  if (!res.ok || !data.reply) {
    throw new Error(data.error ?? "Failed to get a response.");
  }

  return data;
}

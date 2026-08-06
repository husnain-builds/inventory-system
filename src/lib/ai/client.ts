import {
  getConfiguredProviders,
  resolveProvider,
  type AIProviderConfig,
  type AIProviderId,
} from "./providers";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CompletionResult {
  reply: string;
  provider: AIProviderId;
  model: string;
}

function readApiKey(envName: string): string | undefined {
  const raw = process.env[envName]?.trim();
  if (!raw) return undefined;
  return raw.replace(/^['"]|['"]$/g, "").trim() || undefined;
}

async function callProvider(
  provider: AIProviderConfig,
  messages: ChatMessage[],
  options?: { model?: string; maxTokens?: number }
): Promise<CompletionResult> {
  const apiKey = readApiKey(provider.apiKeyEnv);
  if (!apiKey) {
    throw new Error(`${provider.label} API key is missing.`);
  }

  const model = options?.model ?? provider.defaultModel;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  if (provider.id === "openrouter") {
    headers["HTTP-Referer"] =
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    headers["X-Title"] = "StockFlow";
  }

  const response = await fetch(provider.baseUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages,
      max_tokens: options?.maxTokens ?? 1024,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`${provider.label} error (${response.status}): ${detail.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    throw new Error(`${provider.label} returned an empty response.`);
  }

  return { reply, provider: provider.id, model };
}

export async function completeChat(
  messages: ChatMessage[],
  options?: { model?: string; maxTokens?: number }
): Promise<CompletionResult> {
  const providers = getConfiguredProviders();
  if (providers.length === 0) {
    throw new Error(
      "No AI provider configured. Add GROQ_API_KEY (free) to .env.local."
    );
  }

  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      return await callProvider(provider, messages, options);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError ?? new Error("All configured AI providers failed.");
}

export async function completePrompt(
  prompt: string,
  options?: { system?: string; model?: string; maxTokens?: number }
): Promise<CompletionResult> {
  const messages: ChatMessage[] = [];
  if (options?.system?.trim()) {
    messages.push({ role: "system", content: options.system.trim() });
  }
  messages.push({ role: "user", content: prompt.trim() });
  return completeChat(messages, options);
}

export function getActiveProviderLabel(): string | null {
  try {
    return resolveProvider().label;
  } catch {
    return null;
  }
}

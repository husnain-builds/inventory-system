export type AIProviderId = "groq" | "openrouter" | "github" | "cerebras";

export interface AIProviderConfig {
  id: AIProviderId;
  label: string;
  baseUrl: string;
  apiKeyEnv: string;
  defaultModel: string;
  signupUrl: string;
}

export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: "groq",
    label: "Groq",
    baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    apiKeyEnv: "GROQ_API_KEY",
    defaultModel: "llama-3.3-70b-versatile",
    signupUrl: "https://console.groq.com/keys",
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    apiKeyEnv: "OPENROUTER_API_KEY",
    defaultModel: "meta-llama/llama-3.3-70b-instruct:free",
    signupUrl: "https://openrouter.ai/settings/keys",
  },
  {
    id: "github",
    label: "GitHub Models",
    baseUrl: "https://models.github.ai/inference/chat/completions",
    apiKeyEnv: "GITHUB_TOKEN",
    defaultModel: "meta-llama/Llama-3.3-70B-Instruct",
    signupUrl: "https://github.com/settings/tokens",
  },
  {
    id: "cerebras",
    label: "Cerebras",
    baseUrl: "https://api.cerebras.ai/v1/chat/completions",
    apiKeyEnv: "CEREBRAS_API_KEY",
    defaultModel: "llama-3.3-70b",
    signupUrl: "https://cloud.cerebras.ai",
  },
];

function readEnv(name: string): string | undefined {
  const raw = process.env[name]?.trim();
  if (!raw) return undefined;
  // Strip accidental quotes from dashboard / .env paste: "gsk_..."
  return raw.replace(/^['"]|['"]$/g, "").trim() || undefined;
}

export function getConfiguredProviders(): AIProviderConfig[] {
  const forced = readEnv("AI_PROVIDER") as AIProviderId | undefined;

  const available = AI_PROVIDERS.filter((provider) =>
    Boolean(readEnv(provider.apiKeyEnv))
  );

  if (forced) {
    const match = available.find((provider) => provider.id === forced);
    return match ? [match] : [];
  }

  return available;
}

export function resolveProvider(): AIProviderConfig {
  const providers = getConfiguredProviders();
  if (providers.length === 0) {
    throw new Error(
      "No AI provider configured. Add a free API key to .env.local (GROQ_API_KEY recommended)."
    );
  }
  return providers[0];
}

export function hasAIProvider(): boolean {
  return getConfiguredProviders().length > 0;
}

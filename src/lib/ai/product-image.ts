import { completePrompt } from "@/lib/ai/client";
import { hasAIProvider } from "@/lib/ai/providers";

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export interface ProductImageOptions {
  imageHint?: string;
  regenerate?: boolean;
}

export async function buildProductImagePrompt(
  name: string,
  category: string,
  imageHint?: string
): Promise<string> {
  if (imageHint?.trim()) {
    return `Professional e-commerce product photo of ${name}, ${category} inventory item. ${imageHint.trim()}. Single product centered, clean white background, studio lighting, photorealistic, no text or watermark`;
  }

  const fallback = `Professional e-commerce product photo of ${name}, ${category} inventory item, single product centered, clean white background, studio lighting, sharp focus, photorealistic, no text or watermark`;

  if (!hasAIProvider()) return fallback;

  try {
    const result = await completePrompt(
      `Write one image-generation prompt for a product photo of "${name}" (${category} category). Single product, white background, photorealistic e-commerce style. Reply with the prompt only, no quotes.`,
      { maxTokens: 120 }
    );
    const prompt = result.reply.replace(/^["']|["']$/g, "").trim();
    return prompt || fallback;
  } catch {
    return fallback;
  }
}

export function buildProductImageUrl(
  prompt: string,
  seed: string,
  regenerate = false
): string {
  const encoded = encodeURIComponent(prompt);
  const seedValue = regenerate
    ? `${hashString(seed)}-${Date.now()}`
    : hashString(seed);
  return `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&nologo=true&seed=${seedValue}`;
}

export async function generateProductImageUrl(
  name: string,
  category: string,
  options?: ProductImageOptions
): Promise<{ imageUrl: string; prompt: string }> {
  const prompt = await buildProductImagePrompt(name, category, options?.imageHint);
  const imageUrl = buildProductImageUrl(
    prompt,
    `${name}-${category}`,
    options?.regenerate ?? Boolean(options?.imageHint)
  );
  return { imageUrl, prompt };
}

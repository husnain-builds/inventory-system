import { generateText, Output } from "ai";
import { z } from "zod";
import {
  parseNaturalLanguageQuery,
  type NLSearchFilters,
  type NLSearchResult,
} from "@/lib/ai/natural-language-search";
import { CATEGORIES } from "@/lib/inventory-utils";

export const maxDuration = 15;

const filterSchema = z.object({
  searchTerms: z.array(z.string()),
  categories: z.array(z.string()),
  statuses: z.array(z.enum(["in-stock", "low-stock", "out-of-stock"])),
  locations: z.array(z.string()),
  ownerNames: z.array(z.string()),
  explanation: z.string(),
});

function hasAiGateway(): boolean {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY ||
      process.env.VERCEL_OIDC_TOKEN ||
      process.env.AI_SDK_DEFAULT_PROVIDER
  );
}

export async function POST(req: Request) {
  const { query, owners } = (await req.json()) as {
    query?: string;
    owners?: string[];
  };

  if (!query?.trim()) {
    return Response.json({
      filters: {
        searchTerms: [],
        categories: [],
        statuses: [],
        locations: [],
        ownerNames: [],
      },
      explanation: "Showing all items.",
      usedAi: false,
    } satisfies NLSearchResult);
  }

  if (!hasAiGateway()) {
    return Response.json(parseNaturalLanguageQuery(query));
  }

  try {
    const { output } = await generateText({
      model: "google/gemini-2.5-flash",
      output: Output.object({ schema: filterSchema }),
      prompt: `Convert this natural language inventory search into structured filters.

Query: "${query}"

Valid categories: ${CATEGORIES.join(", ")}
Known owners: ${(owners ?? []).join(", ") || "none"}

Return JSON filters. Use empty arrays when not specified.
Map informal phrases: "needs attention" → low-stock + out-of-stock, "electronics" → Electronics category.`,
      maxOutputTokens: 512,
    });

    const filters: NLSearchFilters = {
      searchTerms: output.searchTerms,
      categories: output.categories,
      statuses: output.statuses,
      locations: output.locations,
      ownerNames: output.ownerNames,
    };

    return Response.json({
      filters,
      explanation: output.explanation,
      usedAi: true,
    } satisfies NLSearchResult);
  } catch {
    return Response.json(parseNaturalLanguageQuery(query));
  }
}

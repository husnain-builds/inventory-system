import { completePrompt } from "@/lib/ai/client";
import { hasAIProvider } from "@/lib/ai/providers";
import {
  parseNaturalLanguageQuery,
  type NLSearchFilters,
  type NLSearchResult,
} from "@/lib/ai/natural-language-search";
import { CATEGORIES } from "@/lib/inventory-utils";

export const maxDuration = 15;

function parseSearchFilters(raw: string): {
  filters: NLSearchFilters;
  explanation: string;
} | null {
  try {
    const jsonText = raw.replace(/^```json\s*|\s*```$/g, "").trim();
    const parsed = JSON.parse(jsonText) as Partial<NLSearchFilters> & {
      explanation?: string;
    };

    const statuses = (parsed.statuses ?? []).filter(
      (status): status is NLSearchFilters["statuses"][number] =>
        status === "in-stock" || status === "low-stock" || status === "out-of-stock"
    );

    return {
      filters: {
        searchTerms: Array.isArray(parsed.searchTerms)
          ? parsed.searchTerms.filter((term): term is string => typeof term === "string")
          : [],
        categories: Array.isArray(parsed.categories)
          ? parsed.categories.filter((category): category is string => typeof category === "string")
          : [],
        statuses,
        locations: Array.isArray(parsed.locations)
          ? parsed.locations.filter((location): location is string => typeof location === "string")
          : [],
        ownerNames: Array.isArray(parsed.ownerNames)
          ? parsed.ownerNames.filter((owner): owner is string => typeof owner === "string")
          : [],
      },
      explanation:
        typeof parsed.explanation === "string"
          ? parsed.explanation
          : "Parsed your search with AI.",
    };
  } catch {
    return null;
  }
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

  if (!hasAIProvider()) {
    return Response.json(parseNaturalLanguageQuery(query));
  }

  try {
    const result = await completePrompt(
      `Convert this natural language inventory search into JSON filters.

Query: "${query}"

Valid categories: ${CATEGORIES.join(", ")}
Known owners: ${(owners ?? []).join(", ") || "none"}

Return ONLY JSON:
{
  "searchTerms": string[],
  "categories": string[],
  "statuses": ("in-stock" | "low-stock" | "out-of-stock")[],
  "locations": string[],
  "ownerNames": string[],
  "explanation": string
}`,
      {
        system:
          "You convert inventory search queries into JSON filters. Respond with valid JSON only.",
        maxTokens: 512,
      }
    );

    const parsed = parseSearchFilters(result.reply);
    if (!parsed) {
      return Response.json(parseNaturalLanguageQuery(query));
    }

    return Response.json({
      filters: parsed.filters,
      explanation: parsed.explanation,
      usedAi: true,
    } satisfies NLSearchResult);
  } catch {
    return Response.json(parseNaturalLanguageQuery(query));
  }
}

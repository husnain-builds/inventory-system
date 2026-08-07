import { suggestProductCategory } from "@/lib/ai/suggest-category";

export const maxDuration = 15;

export async function POST(req: Request) {
  const { name } = (await req.json()) as { name?: string };

  if (!name?.trim()) {
    return Response.json({ error: "Product name is required." }, { status: 400 });
  }

  try {
    const suggestion = await suggestProductCategory(name);
    return Response.json(suggestion);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to suggest category.";
    return Response.json({ error: message }, { status: 503 });
  }
}

import { generateProductImageUrl } from "@/lib/ai/product-image";

export const maxDuration = 30;

export async function POST(req: Request) {
  const body = (await req.json()) as {
    name?: string;
    category?: string;
    imageHint?: string;
    regenerate?: boolean;
  };

  const name = body.name?.trim();
  const category = body.category?.trim() || "General";

  if (!name) {
    return Response.json({ error: "Product name is required." }, { status: 400 });
  }

  try {
    const result = await generateProductImageUrl(name, category, {
      imageHint: body.imageHint,
      regenerate: body.regenerate ?? Boolean(body.imageHint),
    });
    return Response.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate product image.";
    return Response.json({ error: message }, { status: 503 });
  }
}

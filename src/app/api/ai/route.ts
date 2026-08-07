import { completePrompt } from "@/lib/ai/client";

export const maxDuration = 30;

export async function POST(req: Request) {
  const body = (await req.json()) as {
    prompt?: string;
    system?: string;
    model?: string;
  };

  const prompt = body.prompt?.trim();
  if (!prompt) {
    return Response.json({ error: "Prompt is required." }, { status: 400 });
  }

  try {
    const result = await completePrompt(prompt, {
      system: body.system,
      model: body.model,
    });
    return Response.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate a response.";
    return Response.json({ error: message }, { status: 503 });
  }
}

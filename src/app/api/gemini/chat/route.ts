import { NextRequest } from "next/server";
import { createGeminiClient, CHAT_MODEL, ASSISTED_SYSTEM_INSTRUCTION } from "@/lib/gemini";

interface ChatRequestBody {
  messages: Array<{
    role: "user" | "model";
    parts: Array<
      | { type: "text"; content: string }
      | { type: "image"; content: string; mimeType?: string }
    >;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey =
      request.headers.get("x-api-key") || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "No API key configured" },
        { status: 401 }
      );
    }

    const body: ChatRequestBody = await request.json();

    if (!body.messages || body.messages.length === 0) {
      return Response.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    const client = createGeminiClient(apiKey);

    // Convert our message format to Gemini SDK format
    const contents = body.messages.map((msg) => ({
      role: msg.role,
      parts: msg.parts.map((part) => {
        if (part.type === "text") {
          return { text: part.content };
        }
        return {
          inlineData: {
            mimeType: part.mimeType || "image/jpeg",
            data: part.content,
          },
        };
      }),
    }));

    // Use streaming for chat responses
    const response = await client.models.generateContentStream({
      model: CHAT_MODEL,
      contents,
      config: {
        systemInstruction: ASSISTED_SYSTEM_INSTRUCTION,
      },
    });

    // Create a readable stream to send chunks to the client
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Stream error";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: message })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}

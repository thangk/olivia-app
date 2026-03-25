import { NextRequest } from "next/server";
import { createGeminiClient, IMAGE_MODEL } from "@/lib/gemini";
import type { AspectRatio, ImageResolution } from "@/types";

interface ImageRequestBody {
  prompt: string;
  referenceImage?: string; // base64
  referenceImageMimeType?: string;
  previousImage?: string; // base64 of previous generation for iteration
  previousImageMimeType?: string;
  resolution: ImageResolution;
  aspectRatio: AspectRatio;
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

    const body: ImageRequestBody = await request.json();

    if (!body.prompt) {
      return Response.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const client = createGeminiClient(apiKey);

    // Build content parts
    const parts: Array<
      | { text: string }
      | { inlineData: { mimeType: string; data: string } }
    > = [];

    // Add reference/product image if provided
    if (body.referenceImage) {
      parts.push({
        inlineData: {
          mimeType: body.referenceImageMimeType || "image/jpeg",
          data: body.referenceImage,
        },
      });
    }

    // Add previous generated image for iteration
    if (body.previousImage) {
      parts.push({
        inlineData: {
          mimeType: body.previousImageMimeType || "image/png",
          data: body.previousImage,
        },
      });
    }

    // Add text prompt
    parts.push({ text: body.prompt });

    const response = await client.models.generateContent({
      model: IMAGE_MODEL,
      contents: [{ role: "user", parts }],
      config: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: {
          imageSize: body.resolution,
          aspectRatio: body.aspectRatio,
        },
      },
    });

    // Extract image and text from response
    const candidate = response.candidates?.[0];
    if (!candidate?.content?.parts) {
      return Response.json(
        { error: "No response from model" },
        { status: 500 }
      );
    }

    let imageBase64: string | null = null;
    let imageMimeType = "image/png";
    let responseText = "";

    for (const part of candidate.content.parts) {
      if (part.text) {
        responseText += part.text;
      } else if (part.inlineData) {
        imageBase64 = part.inlineData.data || null;
        imageMimeType = part.inlineData.mimeType || "image/png";
      }
    }

    if (!imageBase64) {
      return Response.json(
        {
          error: "No image generated. The model may have refused the prompt. Try rephrasing.",
          text: responseText,
        },
        { status: 422 }
      );
    }

    return Response.json({
      imageBase64,
      imageMimeType,
      text: responseText,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}

export const maxDuration = 240;

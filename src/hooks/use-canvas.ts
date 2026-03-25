"use client";

import { useCallback, useState } from "react";
import { saveAsset } from "@/lib/storage";
import { compressImage } from "@/lib/image-utils";
import { canGenerate, recordGeneration } from "@/lib/rate-limit";
import type {
  AspectRatio,
  GeneratedAsset,
  ImageResolution,
} from "@/types";

interface UseCanvasOptions {
  effectiveApiKey: string;
  activeConversationId: string | null;
  assets: GeneratedAsset[];
  addAsset: (asset: GeneratedAsset) => void;
}

export function useCanvas({
  effectiveApiKey,
  activeConversationId,
  assets,
  addAsset,
}: UseCanvasOptions) {
  const [resolution, setResolution] = useState<ImageResolution>("1K");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [productImage, setProductImage] = useState<{
    base64: string;
    mimeType: string;
  } | null>(null);
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeImage = (() => {
    if (activeAssetId) {
      const asset = assets.find((a) => a.id === activeAssetId);
      if (asset) return { base64: asset.base64, mimeType: asset.mimeType };
    }
    if (assets.length > 0) {
      const last = assets[assets.length - 1];
      return { base64: last.base64, mimeType: last.mimeType };
    }
    return productImage;
  })();

  const handleUpload = useCallback(async (base64: string, mimeType: string) => {
    // Compress for API usage
    const compressed = await compressImage(base64, mimeType);
    setProductImage(compressed);
    setActiveAssetId(null);
  }, []);

  const generateImage = useCallback(
    async (prompt: string, refImage?: { base64: string; mimeType: string } | null, overrideConversationId?: string): Promise<GeneratedAsset | null> => {
      const effectiveConvId = overrideConversationId || activeConversationId;
      if (!effectiveConvId) return null;

      // Rate limit check
      const rateStatus = canGenerate();
      if (!rateStatus.allowed) {
        setError(
          `Rate limit reached. Try again in ${rateStatus.nextAvailableIn}s.`
        );
        return null;
      }

      setIsGenerating(true);
      setError(null);

      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (effectiveApiKey) {
          headers["x-api-key"] = effectiveApiKey;
        }

        const body: Record<string, unknown> = {
          prompt,
          resolution,
          aspectRatio,
        };

        // If a ref image was explicitly provided (from Iterate or file upload), use it
        // Otherwise fall back to productImage + previous asset
        if (refImage) {
          body.referenceImage = refImage.base64;
          body.referenceImageMimeType = refImage.mimeType;
        } else {
          if (productImage) {
            body.referenceImage = productImage.base64;
            body.referenceImageMimeType = productImage.mimeType;
          }

          const previousAsset =
            assets.length > 0 ? assets[assets.length - 1] : null;
          if (previousAsset) {
            body.previousImage = previousAsset.base64;
            body.previousImageMimeType = previousAsset.mimeType;
          }
        }

        const response = await fetch("/api/gemini/image", {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Image generation failed");
        }

        recordGeneration();

        const asset: GeneratedAsset = {
          id: crypto.randomUUID(),
          conversationId: effectiveConvId,
          base64: data.imageBase64,
          mimeType: data.imageMimeType || "image/png",
          prompt,
          resolution,
          aspectRatio,
          timestamp: Date.now(),
        };

        await saveAsset(asset);
        addAsset(asset);
        setActiveAssetId(asset.id);
        return asset;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Image generation failed";
        setError(message);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [
      activeConversationId,
      effectiveApiKey,
      resolution,
      aspectRatio,
      productImage,
      assets,
      addAsset,
    ]
  );

  const selectAsset = useCallback((id: string) => {
    setActiveAssetId(id);
  }, []);

  return {
    resolution,
    aspectRatio,
    productImage,
    activeImage,
    activeAssetId,
    isGenerating,
    error,
    setResolution,
    setAspectRatio,
    handleUpload,
    generateImage,
    selectAsset,
  };
}

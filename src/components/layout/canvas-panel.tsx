"use client";

import { useState } from "react";
import { Download, ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AssetLightbox } from "@/components/canvas/asset-lightbox";
import type { GeneratedAsset } from "@/types";

interface CanvasPanelProps {
  title?: string;
  assets: GeneratedAsset[];
  isGenerating: boolean;
}

export function CanvasPanel({
  title = "Assets",
  assets,
  isGenerating,
}: CanvasPanelProps) {
  const [lightboxAssetId, setLightboxAssetId] = useState<string | null>(null);

  const handleDownload = (e: React.MouseEvent, asset: GeneratedAsset) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = `data:${asset.mimeType};base64,${asset.base64}`;
    link.download = `olivia-ad-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center border-b px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          {title} ({assets.length})
        </span>
      </div>

      <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto">
        <div className="p-2">
          {assets.length === 0 && !isGenerating && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                Generated images will appear here
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-1.5">
            {isGenerating && (
              <Skeleton className="aspect-square rounded-lg" />
            )}
            {[...assets].reverse().map((asset) => (
              <div
                key={asset.id}
                role="button"
                tabIndex={0}
                onClick={() => setLightboxAssetId(asset.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setLightboxAssetId(asset.id);
                  }
                }}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg"
                aria-label={`View: ${asset.prompt.slice(0, 30)}`}
              >
                <img
                  src={`data:${asset.mimeType};base64,${asset.base64}`}
                  alt={asset.prompt.slice(0, 50)}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20">
                  <button
                    onClick={(e) => handleDownload(e, asset)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-md bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Download"
                  >
                    <Download className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {lightboxAssetId && (
        <AssetLightbox
          assets={assets}
          initialAssetId={lightboxAssetId}
          onClose={() => setLightboxAssetId(null)}
        />
      )}
    </div>
  );
}

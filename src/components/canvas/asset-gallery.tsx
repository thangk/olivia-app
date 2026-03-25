"use client";

import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { GeneratedAsset } from "@/types";

interface AssetGalleryProps {
  assets: GeneratedAsset[];
  activeAssetId: string | null;
  onSelectAsset: (id: string) => void;
}

export function AssetGallery({
  assets,
  activeAssetId,
  onSelectAsset,
}: AssetGalleryProps) {
  if (assets.length === 0) return null;

  return (
    <div className="border-t p-3">
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        Assets ({assets.length})
      </p>
      <ScrollArea className="w-full">
        <div className="flex gap-2">
          {assets.map((asset) => (
            <button
              key={asset.id}
              onClick={() => onSelectAsset(asset.id)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all hover:border-primary/50",
                activeAssetId === asset.id
                  ? "border-primary ring-1 ring-primary/20"
                  : "border-transparent"
              )}
              aria-label={`View asset: ${asset.prompt.slice(0, 30)}`}
            >
              <img
                src={`data:${asset.mimeType};base64,${asset.base64}`}
                alt={asset.prompt.slice(0, 50)}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

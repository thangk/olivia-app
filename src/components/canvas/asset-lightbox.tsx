"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GeneratedAsset } from "@/types";

interface AssetLightboxProps {
  assets: GeneratedAsset[];
  initialAssetId: string;
  onClose: () => void;
}

export function AssetLightbox({
  assets: rawAssets,
  initialAssetId,
  onClose,
}: AssetLightboxProps) {
  // Reverse so latest asset is first (leftmost)
  const assets = [...rawAssets].reverse();

  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.max(0, assets.findIndex((a) => a.id === initialAssetId))
  );

  const current = assets[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < assets.length - 1;

  const goNext = useCallback(() => {
    if (hasNext) setCurrentIndex((i) => i + 1);
  }, [hasNext]);

  const goPrev = useCallback(() => {
    if (hasPrev) setCurrentIndex((i) => i - 1);
  }, [hasPrev]);

  const handleDownload = useCallback(() => {
    if (!current) return;
    const link = document.createElement("a");
    link.href = `data:${current.mimeType};base64,${current.base64}`;
    link.download = `olivia-ad-${Date.now()}.png`;
    link.click();
  }, [current]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, goNext, goPrev]);

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex h-screen w-screen flex-col overflow-hidden bg-black/90"
      role="dialog"
      aria-label="Asset viewer"
    >
      {/* Top bar */}
      <div className="flex h-12 shrink-0 items-center justify-between px-4">
        <span className="text-sm text-white/70">
          {currentIndex + 1} / {assets.length}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white"
            onClick={handleDownload}
            aria-label="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main image */}
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-16"
        onClick={onClose}
      >
        <img
          src={`data:${current.mimeType};base64,${current.base64}`}
          alt={current.prompt}
          className="max-h-full max-w-full rounded-lg object-contain"
          onClick={(e) => e.stopPropagation()}
        />

        {hasPrev && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 h-10 w-10 rounded-full bg-black/40 text-white hover:bg-black/60 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        {hasNext && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 h-10 w-10 rounded-full bg-black/40 text-white hover:bg-black/60 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Thumbnail strip */}
      {assets.length > 1 && (
        <div className="flex h-16 shrink-0 items-center justify-center gap-2 px-4">
          {assets.map((asset, i) => (
            <button
              key={asset.id}
              onClick={() => setCurrentIndex(i)}
              className={`h-10 w-10 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                i === currentIndex
                  ? "border-white"
                  : "border-transparent opacity-50 hover:opacity-80"
              }`}
              aria-label={`View asset ${i + 1}`}
            >
              <img
                src={`data:${asset.mimeType};base64,${asset.base64}`}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { AspectRatioSelect } from "./aspect-ratio-select";
import { ResolutionBadges } from "./resolution-badges";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getRateLimitStatus } from "@/lib/rate-limit";
import type { AspectRatio, ImageResolution } from "@/types";

interface CanvasToolbarProps {
  resolution: ImageResolution;
  aspectRatio: AspectRatio;
  onResolutionChange: (resolution: ImageResolution) => void;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  isGenerating: boolean;
}

export function CanvasToolbar({
  resolution,
  aspectRatio,
  onResolutionChange,
  onAspectRatioChange,
  isGenerating,
}: CanvasToolbarProps) {
  const [rateStatus, setRateStatus] = useState(getRateLimitStatus());

  useEffect(() => {
    setRateStatus(getRateLimitStatus());
    const interval = setInterval(() => {
      setRateStatus(getRateLimitStatus());
    }, 5000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  return (
    <div className="flex items-center justify-between gap-3 border-b px-3 py-2">
      <div className="flex items-center gap-3">
        <ResolutionBadges value={resolution} onChange={onResolutionChange} />
        <div className="h-4 w-px bg-border" aria-hidden="true" />
        <AspectRatioSelect value={aspectRatio} onChange={onAspectRatioChange} />
      </div>
      <Tooltip>
        <TooltipTrigger className="cursor-default">
          <div className="text-[11px] text-muted-foreground">
            {!rateStatus.allowed && rateStatus.nextAvailableIn !== null ? (
              <span className="text-destructive">
                Limit reached &middot; {rateStatus.nextAvailableIn}s
              </span>
            ) : (
              <span>
                {rateStatus.minuteRemaining}/min &middot;{" "}
                {rateStatus.hourRemaining}/hr
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          Image generation rate limit: max 5 per minute, 30 per hour
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import type { AspectRatio } from "@/types";

interface AspectRatioSelectProps {
  value: AspectRatio;
  onChange: (ratio: AspectRatio) => void;
}

const RATIOS: { value: AspectRatio; w: number; h: number }[] = [
  { value: "1:1", w: 1, h: 1 },
  { value: "9:16", w: 9, h: 16 },
  { value: "16:9", w: 16, h: 9 },
  { value: "3:4", w: 3, h: 4 },
  { value: "4:3", w: 4, h: 3 },
  { value: "3:2", w: 3, h: 2 },
  { value: "2:3", w: 2, h: 3 },
  { value: "5:4", w: 5, h: 4 },
  { value: "4:5", w: 4, h: 5 },
  { value: "21:9", w: 21, h: 9 },
];

function RatioIcon({
  w,
  h,
  active,
}: {
  w: number;
  h: number;
  active: boolean;
}) {
  const maxSize = 24;
  const scale = maxSize / Math.max(w, h);
  const width = Math.round(w * scale);
  const height = Math.round(h * scale);
  const x = (maxSize - width) / 2;
  const y = (maxSize - height) / 2;

  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 28 28"
      className="shrink-0"
      aria-hidden="true"
    >
      <rect
        x={x + 2}
        y={y + 2}
        width={width}
        height={height}
        rx={2}
        className={cn(
          "transition-colors",
          active
            ? "fill-primary/20 stroke-primary"
            : "fill-muted stroke-muted-foreground/40"
        )}
        strokeWidth={1.5}
      />
    </svg>
  );
}

export function AspectRatioSelect({ value, onChange }: AspectRatioSelectProps) {
  const [open, setOpen] = useState(false);
  const activeRatio = RATIOS.find((r) => r.value === value) || RATIOS[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 border-0"
            aria-label={`Aspect ratio: ${value}`}
          />
        }
      >
        <RatioIcon w={activeRatio.w} h={activeRatio.h} active />
        <span className="text-xs">{value}</span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start" side="top" sideOffset={8}>
        <div className="grid grid-cols-5 gap-1">
          {RATIOS.map((ratio) => (
            <button
              key={ratio.value}
              onClick={() => { onChange(ratio.value); setOpen(false); }}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md px-2 py-1.5 transition-colors hover:bg-accent",
                value === ratio.value && "bg-accent"
              )}
              aria-label={`${ratio.value} aspect ratio`}
              aria-pressed={value === ratio.value}
            >
              <RatioIcon
                w={ratio.w}
                h={ratio.h}
                active={value === ratio.value}
              />
              <span className="text-[10px] text-muted-foreground">
                {ratio.value}
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

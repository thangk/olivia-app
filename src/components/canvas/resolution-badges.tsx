"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { ImageResolution } from "@/types";

interface ResolutionBadgesProps {
  value: ImageResolution;
  onChange: (resolution: ImageResolution) => void;
}

const RESOLUTIONS: { value: ImageResolution; label: string; desc: string }[] = [
  { value: "1K", label: "1K", desc: "Standard" },
  { value: "2K", label: "2K", desc: "High quality" },
  { value: "4K", label: "4K", desc: "Maximum" },
];

export function ResolutionBadges({ value, onChange }: ResolutionBadgesProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 border-0 text-xs"
            aria-label={`Resolution: ${value}`}
          />
        }
      >
        <span className="inline-block w-5 text-center font-semibold">{value}</span>
      </PopoverTrigger>
      <PopoverContent className="w-36 p-1.5" align="start" side="top" sideOffset={8}>
        {RESOLUTIONS.map((res) => {
          const isActive = value === res.value;
          return (
            <button
              key={res.value}
              onClick={() => {
                onChange(res.value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-accent",
                isActive && "bg-accent font-medium"
              )}
              aria-label={`${res.label} resolution`}
            >
              <span>{res.label}</span>
              <span className="text-[11px] text-muted-foreground">{res.desc}</span>
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

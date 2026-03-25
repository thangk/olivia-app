"use client";

import { useState } from "react";
import { Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { GenerationMode } from "@/types";

interface ModeSelectorProps {
  value: GenerationMode;
  onChange: (mode: GenerationMode) => void;
}

const MODES = [
  {
    value: "assisted" as const,
    label: "Assisted",
    description: "Ad specialist asks about your product, audience, and style before generating",
    icon: Sparkles,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    activeBg: "bg-amber-500/15",
  },
  {
    value: "generate" as const,
    label: "Generate",
    description: "Skip the conversation, generate images straight from your prompt",
    icon: Zap,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    activeBg: "bg-cyan-500/15",
  },
];

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  const [open, setOpen] = useState(false);
  const active = MODES.find((m) => m.value === value) || MODES[0];
  const ActiveIcon = active.icon;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className={cn("w-24 gap-1.5 border-0 text-xs", active.bg)}
            aria-label={`Mode: ${active.label}`}
          />
        }
      >
        <ActiveIcon className={cn("h-3.5 w-3.5", active.color)} />
        <span>{active.label}</span>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1.5" align="start" side="top" sideOffset={8}>
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isActive = value === mode.value;
          return (
            <button
              key={mode.value}
              onClick={() => {
                onChange(mode.value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-accent",
                isActive && mode.activeBg
              )}
            >
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", mode.color)} />
              <div>
                <p className={cn("text-sm", isActive && "font-medium")}>
                  {mode.label}
                </p>
                <p className="text-[11px] leading-tight text-muted-foreground">
                  {mode.description}
                </p>
              </div>
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

export function getModeColor(mode: GenerationMode) {
  return mode === "assisted"
    ? "ring-amber-500/40 border-amber-500/30"
    : "ring-cyan-500/40 border-cyan-500/30";
}

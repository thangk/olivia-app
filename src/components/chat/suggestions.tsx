"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

const DEFAULT_SUGGESTIONS = [
  "Product hero shot on clean white, ready for Amazon listing",
  "Instagram ad with lifestyle setting and 'Shop Now' text overlay",
  "Before & after comparison banner for a skincare product",
  "Black Friday promo card with bold discount badge",
];

export function Suggestions({ suggestions, onSelect }: SuggestionsProps) {
  const items = suggestions.length > 0 ? suggestions : DEFAULT_SUGGESTIONS;

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Sparkles className="h-3 w-3" />
        <span>Suggested prompts</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((suggestion) => (
          <Button
            key={suggestion}
            variant="outline"
            size="sm"
            className="h-auto whitespace-normal text-left text-xs"
            onClick={() => onSelect(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
}

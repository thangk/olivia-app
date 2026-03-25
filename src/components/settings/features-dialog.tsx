"use client";

import {
  MessageSquare,
  ImagePlus,
  Wand2,
  Sparkles,
  FolderOpen,
  Download,
  Palette,
  Shield,
  Zap,
  Trash2,
  Search,
  Maximize2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FeaturesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FEATURES = [
  {
    icon: Zap,
    title: "Two Modes",
    description:
      "Assisted mode with an AI creative director, or Generate mode for direct image generation.",
  },
  {
    icon: ImagePlus,
    title: "AI Image Generation",
    description:
      "Studio-quality ad visuals up to 4K, powered by Nano Banana Pro.",
  },
  {
    icon: Wand2,
    title: "Iterate on Images",
    description:
      "Click Iterate on any image to set it as reference, then describe your changes.",
  },
  {
    icon: Sparkles,
    title: "Smart Suggestions",
    description:
      "Auto-detects your product and suggests ad directions, prompt improvements, and layouts.",
  },
  {
    icon: Palette,
    title: "Resolution & Ratios",
    description:
      "1K, 2K, or 4K resolution. 10 aspect ratios from square to ultrawide with visual previews.",
  },
  {
    icon: FolderOpen,
    title: "Projects & Chats",
    description:
      "Organize work into projects or standalone chats. Settings persist per conversation.",
  },
  {
    icon: Maximize2,
    title: "Lightbox Viewer",
    description:
      "Click any image for a full-screen view with keyboard navigation across all assets.",
  },
  {
    icon: Search,
    title: "Search & Navigate",
    description:
      "Search conversations by title. URL state lets you refresh without losing your place.",
  },
  {
    icon: Trash2,
    title: "Trash Bin",
    description:
      "Deleted conversations go to trash first. Restore or permanently delete anytime.",
  },
  {
    icon: Download,
    title: "Fully Local",
    description:
      "All data stays in your browser. Download any generated image with one click.",
  },
  {
    icon: MessageSquare,
    title: "Conversational AI",
    description:
      "Chat naturally to describe, refine, and iterate on your ad creatives.",
  },
  {
    icon: Shield,
    title: "Bring Your Own Key",
    description:
      "Use your own Gemini API key. Keys are stored locally, never sent to our servers.",
  },
] as const;

export function FeaturesDialog({ open, onOpenChange }: FeaturesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Features</DialogTitle>
          <DialogDescription>
            What Olivia Ad Studio can do for you.
          </DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[60vh] gap-3 overflow-y-auto py-2 scrollbar-none sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <feature.icon className="h-4 w-4 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium leading-tight">
                  {feature.title}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

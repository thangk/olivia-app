"use client";

import { useRef, useState, useEffect, type KeyboardEvent } from "react";
import { ImagePlus, SendHorizonal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ResolutionBadges } from "@/components/canvas/resolution-badges";
import { AspectRatioSelect } from "@/components/canvas/aspect-ratio-select";
import { ModeSelector, getModeColor } from "./mode-selector";
import { cn } from "@/lib/utils";
import type { AspectRatio, GenerationMode, ImageResolution } from "@/types";

interface ChatInputProps {
  onSend: (text: string, image?: { base64: string; mimeType: string }) => void;
  disabled?: boolean;
  resolution: ImageResolution;
  aspectRatio: AspectRatio;
  mode: GenerationMode;
  onResolutionChange: (resolution: ImageResolution) => void;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  onModeChange: (mode: GenerationMode) => void;
  /** Externally set ref image (e.g., from "Iterate" click) */
  refImage?: { base64: string; mimeType: string } | null;
  onRefImageChange?: (img: { base64: string; mimeType: string } | null) => void;
}

export function ChatInput({
  onSend,
  disabled,
  resolution,
  aspectRatio,
  mode,
  onResolutionChange,
  onAspectRatioChange,
  onModeChange,
  refImage,
  onRefImageChange,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync external ref image
  const [localRefImage, setLocalRefImage] = useState<{
    base64: string;
    mimeType: string;
  } | null>(null);

  useEffect(() => {
    if (refImage) setLocalRefImage(refImage);
  }, [refImage]);

  const currentImage = localRefImage;

  const clearRefImage = () => {
    setLocalRefImage(null);
    onRefImageChange?.(null);
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && !currentImage) return;

    onSend(
      trimmed,
      currentImage ? { base64: currentImage.base64, mimeType: currentImage.mimeType } : undefined
    );
    setText("");
    // Don't clear ref image on send — user may want to iterate multiple times
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      const img = { base64, mimeType: file.type };
      setLocalRefImage(img);
      onRefImageChange?.(img);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const modeColor = getModeColor(mode);
  const previewSrc = currentImage
    ? `data:${currentImage.mimeType};base64,${currentImage.base64}`
    : null;

  return (
    <div className="border-t p-3">
      {/* Ref image preview */}
      {previewSrc && (
        <div className="mb-2 flex items-center gap-2">
          <div className="relative">
            <img
              src={previewSrc}
              alt="Reference image"
              className="h-10 w-10 rounded-md border object-cover"
            />
            <button
              onClick={clearRefImage}
              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
              aria-label="Remove reference image"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
          <span className="text-[11px] text-muted-foreground">Reference image</span>
        </div>
      )}
      {/* Row 1: Textarea + Send */}
      <div className="flex items-stretch gap-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === "generate"
              ? "Describe the image to generate..."
              : "Describe the ad you want to create..."
          }
          className={cn("min-h-[40px] max-h-[160px] resize-none focus-visible:ring-2", modeColor)}
          rows={1}
          disabled={disabled}
          aria-label="Chat message"
        />
        <Button
          onClick={handleSend}
          disabled={disabled || (!text.trim() && !currentImage)}
          aria-label="Send message"
          className="h-auto w-10 shrink-0 rounded-lg"
        >
          <SendHorizonal className="h-4 w-4" />
        </Button>
      </div>
      {/* Row 2: Mode + Attach + Resolution + Aspect Ratio */}
      <div className="mt-2 flex items-center gap-2">
        <ModeSelector value={mode} onChange={onModeChange} />
        <div className="h-4 w-px bg-border" aria-hidden="true" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
          aria-label="Upload image"
        />
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                aria-label="Attach image"
              />
            }
          >
            <ImagePlus className="h-3.5 w-3.5" />
          </TooltipTrigger>
          <TooltipContent>Attach reference image</TooltipContent>
        </Tooltip>
        <div className="h-4 w-px bg-border" aria-hidden="true" />
        <ResolutionBadges value={resolution} onChange={onResolutionChange} />
        <div className="h-4 w-px bg-border" aria-hidden="true" />
        <AspectRatioSelect value={aspectRatio} onChange={onAspectRatioChange} />
      </div>
    </div>
  );
}

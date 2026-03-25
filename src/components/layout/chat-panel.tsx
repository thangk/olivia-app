"use client";

import { useState, useCallback } from "react";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { Suggestions } from "@/components/chat/suggestions";
import { AssetLightbox } from "@/components/canvas/asset-lightbox";
import type { AspectRatio, ChatMessage, GeneratedAsset, GenerationMode, ImageResolution } from "@/types";

interface ChatPanelProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  suggestions: string[];
  onSend: (text: string, image?: { base64: string; mimeType: string }) => void;
  onSelectSuggestion: (suggestion: string) => void;
  resolution: ImageResolution;
  aspectRatio: AspectRatio;
  mode: GenerationMode;
  onResolutionChange: (resolution: ImageResolution) => void;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  onModeChange: (mode: GenerationMode) => void;
  assets: GeneratedAsset[];
  refImage?: { base64: string; mimeType: string } | null;
  onRefImageChange?: (img: { base64: string; mimeType: string } | null) => void;
}

export function ChatPanel({
  messages,
  isStreaming,
  suggestions,
  onSend,
  onSelectSuggestion,
  resolution,
  aspectRatio,
  mode,
  onResolutionChange,
  onAspectRatioChange,
  onModeChange,
  assets,
  refImage,
  onRefImageChange,
}: ChatPanelProps) {
  const [lightboxAssetId, setLightboxAssetId] = useState<string | null>(null);

  const handleImageClick = useCallback(
    (base64: string) => {
      const match = assets.find((a) => a.base64 === base64) || assets[0];
      if (match) {
        setLightboxAssetId(match.id);
      }
    },
    [assets]
  );

  const handleIterate = useCallback(
    (base64: string, mimeType: string) => {
      onRefImageChange?.({ base64, mimeType });
    },
    [onRefImageChange]
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
          <div className="text-center">
            <h2 className="text-lg font-medium">Start a conversation</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Describe the ad you want to create, or attach a product photo.
            </p>
          </div>
          <Suggestions
            suggestions={suggestions}
            onSelect={onSelectSuggestion}
          />
        </div>
      ) : (
        <ChatMessages
          messages={messages}
          isStreaming={isStreaming}
          onImageClick={handleImageClick}
          onIterate={handleIterate}
        />
      )}
      <ChatInput
        onSend={onSend}
        disabled={isStreaming}
        resolution={resolution}
        aspectRatio={aspectRatio}
        mode={mode}
        onResolutionChange={onResolutionChange}
        onAspectRatioChange={onAspectRatioChange}
        onModeChange={onModeChange}
        refImage={refImage}
        onRefImageChange={onRefImageChange}
      />

      {lightboxAssetId && assets.length > 0 && (
        <AssetLightbox
          assets={assets}
          initialAssetId={lightboxAssetId}
          onClose={() => setLightboxAssetId(null)}
        />
      )}
    </div>
  );
}

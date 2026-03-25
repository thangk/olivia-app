"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ImageViewerProps {
  src: string;
  mimeType?: string;
  alt?: string;
}

export function ImageViewer({
  src,
  mimeType = "image/png",
  alt = "Generated image",
}: ImageViewerProps) {
  const dataUrl = src.startsWith("data:") ? src : `data:${mimeType};base64,${src}`;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `olivia-ad-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="relative flex flex-1 items-center justify-center bg-[repeating-conic-gradient(var(--color-muted)_0%_25%,transparent_0%_50%)] bg-[length:16px_16px] p-4">
      <img
        src={dataUrl}
        alt={alt}
        className="max-h-full max-w-full rounded-lg object-contain shadow-sm transition-opacity duration-200"
      />
      <div className="absolute right-3 top-3">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 shadow-sm"
                onClick={handleDownload}
                aria-label="Download image"
              />
            }
          >
            <Download className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent>Download</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

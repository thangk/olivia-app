"use client";

import Markdown from "react-markdown";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatMessage } from "@/types";

interface MessageBubbleProps {
  message: ChatMessage;
  onImageClick?: (base64: string, mimeType: string) => void;
  onIterate?: (base64: string, mimeType: string) => void;
}

/** Strip ```generation and ```suggestions JSON blocks from display */
function cleanModelText(text: string): string {
  return text
    .replace(/```generation\s*\n[\s\S]*?\n```/g, "")
    .replace(/```suggestions\s*\n[\s\S]*?\n```/g, "")
    .trim();
}

export function MessageBubble({ message, onImageClick, onIterate }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex animate-in fade-in slide-in-from-bottom-2 duration-200",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {message.parts.map((part, i) => {
          if (part.type === "text") {
            const display = isUser ? part.content : cleanModelText(part.content);
            if (!display) return null;
            if (isUser) {
              return (
                <p key={i} className="whitespace-pre-wrap text-sm leading-relaxed">
                  {display}
                </p>
              );
            }
            return (
              <Markdown
                key={i}
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0 text-sm leading-relaxed">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  ul: ({ children }) => <ul className="mb-2 ml-4 list-disc last:mb-0 text-sm">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal last:mb-0 text-sm">{children}</ol>,
                  li: ({ children }) => <li className="mb-0.5 leading-relaxed">{children}</li>,
                  code: ({ children }) => <code className="rounded bg-black/10 px-1 py-0.5 text-xs dark:bg-white/10">{children}</code>,
                }}
              >
                {display}
              </Markdown>
            );
          }
          if (part.type === "image") {
            const mimeType = part.mimeType || "image/png";
            return (
              <div key={i} className="mt-2">
                <button
                  onClick={() => onImageClick?.(part.content, mimeType)}
                  className="cursor-pointer overflow-hidden rounded-lg transition-opacity hover:opacity-95"
                  aria-label="View image in lightbox"
                >
                  <img
                    src={`data:${mimeType};base64,${part.content}`}
                    alt="Generated image"
                    className="h-64 w-64 max-w-xs rounded-lg object-cover"
                  />
                </button>
                {!isUser && onIterate && (
                  <div className="mt-1 flex justify-end">
                    <button
                      onClick={() => onIterate(part.content, mimeType)}
                      aria-label="Use this image as reference"
                    >
                      <Badge
                        variant="secondary"
                        className="cursor-pointer text-[11px]"
                      >
                        Iterate
                      </Badge>
                    </button>
                  </div>
                )}
              </div>
            );
          }
          if (part.type === "generating") {
            return (
              <div key={i} className="mt-2 flex flex-col items-center gap-2">
                <Skeleton className="h-64 w-64 rounded-lg" />
                <p className="animate-pulse text-xs text-muted-foreground">
                  Generating image...
                </p>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

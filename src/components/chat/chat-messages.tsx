"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./message-bubble";
import type { ChatMessage } from "@/types";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  onImageClick?: (base64: string, mimeType: string) => void;
  onIterate?: (base64: string, mimeType: string) => void;
}

export function ChatMessages({ messages, isStreaming, onImageClick, onIterate }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  return (
    <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto">
      <div className="flex flex-col gap-4 p-4" role="log" aria-live="polite">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} onImageClick={onImageClick} onIterate={onIterate} />
        ))}
        {isStreaming && (
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

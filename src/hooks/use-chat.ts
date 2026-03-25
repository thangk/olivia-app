"use client";

import { useCallback, useRef, useState } from "react";
import { saveMessage } from "@/lib/storage";
import type { ChatMessage, GenerationMode, MessagePart } from "@/types";

interface UseChatOptions {
  effectiveApiKey: string;
  activeConversationId: string | null;
  messages: ChatMessage[];
  mode: GenerationMode;
  addMessage: (msg: ChatMessage) => void;
  updateLastModelMessage: (text: string) => void;
  onGenerationIntent?: (prompt: string, style?: string) => void;
  onDirectGenerate?: (prompt: string, image?: { base64: string; mimeType: string }) => void;
  onSuggestionsReceived?: (suggestions: string[]) => void;
  onConversationCreated?: (title: string) => Promise<string>;
  updateConversationTitle?: (id: string, title: string) => void;
}

export function useChat({
  effectiveApiKey,
  activeConversationId,
  messages,
  mode,
  addMessage,
  updateLastModelMessage,
  onGenerationIntent,
  onDirectGenerate,
  onSuggestionsReceived,
  onConversationCreated,
  updateConversationTitle,
}: UseChatOptions) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (
      text: string,
      image?: { base64: string; mimeType: string }
    ) => {
      setError(null);

      // Determine conversation ID — create if needed
      let convId = activeConversationId;
      if (!convId && onConversationCreated) {
        convId = await onConversationCreated(text.slice(0, 40) || "New Chat");
      }
      if (!convId) return;

      // Build user message — text only for display
      const displayParts: MessagePart[] = [];
      if (text) displayParts.push({ type: "text", content: text });

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        conversationId: convId,
        role: "user",
        parts: displayParts,
        timestamp: Date.now(),
      };

      addMessage(userMessage);
      await saveMessage(userMessage);

      // Build full message with ref image for API (not stored/displayed)
      const apiParts: MessagePart[] = [...displayParts];
      if (image) {
        apiParts.push({
          type: "image",
          content: image.base64,
          mimeType: image.mimeType,
        });
      }

      // Update title from first message
      if (messages.length === 0 && text && updateConversationTitle) {
        updateConversationTitle(convId, text.slice(0, 40));
      }

      // Generate mode — skip chat, go straight to image generation
      if (mode === "generate") {
        if (onDirectGenerate) {
          onDirectGenerate(text, image);
        }
        return;
      }

      // Create placeholder model message for streaming
      const modelMessage: ChatMessage = {
        id: crypto.randomUUID(),
        conversationId: convId,
        role: "model",
        parts: [{ type: "text", content: "" }],
        timestamp: Date.now(),
      };
      addMessage(modelMessage);

      // Assisted mode — stream from chat API
      setIsStreaming(true);
      abortRef.current = new AbortController();

      try {
        // Build message history for API (filter out generating/empty parts)
        // Use apiParts for the current message (includes ref image), display parts for history
        const currentApiMsg = {
          role: "user" as const,
          parts: apiParts
            .filter((p) => p.type === "text" || p.type === "image")
            .filter((p) => p.content)
            .map((p) => ({
              type: p.type as "text" | "image",
              content: p.content,
              mimeType: p.mimeType,
            })),
        };
        const apiMessages = [
          ...messages
            .filter((msg) => msg.parts.some((p) => p.type === "text" || p.type === "image"))
            .map((msg) => ({
              role: msg.role,
              parts: msg.parts
                .filter((p) => p.type === "text" || p.type === "image")
                .filter((p) => p.content)
                .map((p) => ({
                  type: p.type as "text" | "image",
                  content: p.content,
                  mimeType: p.mimeType,
                })),
            }))
            .filter((msg) => msg.parts.length > 0),
          currentApiMsg,
        ];

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (effectiveApiKey) {
          headers["x-api-key"] = effectiveApiKey;
        }

        const response = await fetch("/api/gemini/chat", {
          method: "POST",
          headers,
          body: JSON.stringify({ messages: apiMessages }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Failed to get response");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let fullText = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          // Keep the last element — it may be an incomplete line
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
                if (parsed.text) {
                  fullText += parsed.text;
                  updateLastModelMessage(fullText);
                }
              } catch (e) {
                if (e instanceof SyntaxError) continue;
                throw e;
              }
            }
          }
        }

        // Save final model message
        const finalModelMessage: ChatMessage = {
          ...modelMessage,
          parts: [{ type: "text", content: fullText }],
          timestamp: Date.now(),
        };
        await saveMessage(finalModelMessage);

        // Parse for generation intent
        const genMatch = fullText.match(
          /```generation\s*\n([\s\S]*?)\n```/
        );
        if (genMatch && onGenerationIntent) {
          try {
            const gen = JSON.parse(genMatch[1]);
            onGenerationIntent(gen.prompt, gen.style);
          } catch {
            // Invalid JSON in generation block
          }
        }

        // Parse for suggestions
        const sugMatch = fullText.match(
          /```suggestions\s*\n([\s\S]*?)\n```/
        );
        if (sugMatch && onSuggestionsReceived) {
          try {
            const sug = JSON.parse(sugMatch[1]);
            if (sug.suggestions) {
              onSuggestionsReceived(sug.suggestions);
            }
          } catch {
            // Invalid JSON
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // User cancelled
        } else {
          const message =
            err instanceof Error ? err.message : "Failed to get response";
          setError(message);
          updateLastModelMessage(`Error: ${message}`);
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [
      activeConversationId,
      messages,
      mode,
      effectiveApiKey,
      addMessage,
      updateLastModelMessage,
      onGenerationIntent,
      onDirectGenerate,
      onSuggestionsReceived,
      onConversationCreated,
      updateConversationTitle,
    ]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    isStreaming,
    error,
    sendMessage,
    stopStreaming,
  };
}

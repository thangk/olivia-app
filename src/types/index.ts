export type ConversationType = "chat" | "project";
export type GenerationMode = "assisted" | "generate";

export interface Conversation {
  id: string;
  title: string;
  description?: string;
  type: ConversationType;
  projectId?: string; // if type is "chat", optional parent project
  createdAt: number;
  updatedAt: number;
  deletedAt?: number; // soft delete timestamp
  // Per-conversation settings
  mode?: GenerationMode;
  resolution?: ImageResolution;
  aspectRatio?: AspectRatio;
}

export interface MessagePart {
  type: "text" | "image" | "generating";
  content: string; // text content or base64 image data
  mimeType?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: "user" | "model";
  parts: MessagePart[];
  timestamp: number;
}

export interface GeneratedAsset {
  id: string;
  conversationId: string;
  base64: string;
  mimeType: string;
  prompt: string;
  resolution: ImageResolution;
  aspectRatio: AspectRatio;
  timestamp: number;
}

export type ImageResolution = "1K" | "2K" | "4K";

export type AspectRatio =
  | "1:1"
  | "9:16"
  | "16:9"
  | "3:4"
  | "4:3"
  | "3:2"
  | "2:3"
  | "5:4"
  | "4:5"
  | "21:9";

export interface ImageGenerationConfig {
  resolution: ImageResolution;
  aspectRatio: AspectRatio;
}

export interface AppSettings {
  apiKey: string;
  useOwnKey: boolean;
}

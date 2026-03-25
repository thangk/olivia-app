import { get, set, del, keys, clear, createStore } from "idb-keyval";
import type { Conversation, ChatMessage, GeneratedAsset } from "@/types";

// IndexedDB stores
const conversationStore = createStore("olivia-ad-studio", "conversations");
const messageStore = createStore("olivia-ad-studio-messages", "messages");
const assetStore = createStore("olivia-ad-studio-assets", "assets");

// --- Conversations ---

export async function saveConversation(conv: Conversation): Promise<void> {
  await set(conv.id, conv, conversationStore);
}

export async function getConversation(
  id: string
): Promise<Conversation | undefined> {
  return get(id, conversationStore);
}

export async function getAllConversations(): Promise<Conversation[]> {
  const allKeys = await keys(conversationStore);
  const convs = await Promise.all(
    allKeys.map((key) => get<Conversation>(key as string, conversationStore))
  );
  return convs
    .filter((c): c is Conversation => c !== undefined)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function deleteConversation(id: string): Promise<void> {
  await del(id, conversationStore);
  // Also delete associated messages and assets
  const msgKeys = await keys(messageStore);
  for (const key of msgKeys) {
    const msg = await get<ChatMessage>(key as string, messageStore);
    if (msg?.conversationId === id) {
      await del(key, messageStore);
    }
  }
  const assetKeys = await keys(assetStore);
  for (const key of assetKeys) {
    const asset = await get<GeneratedAsset>(key as string, assetStore);
    if (asset?.conversationId === id) {
      await del(key, assetStore);
    }
  }
}

// --- Messages ---

export async function saveMessage(msg: ChatMessage): Promise<void> {
  await set(msg.id, msg, messageStore);
}

export async function getMessagesByConversation(
  conversationId: string
): Promise<ChatMessage[]> {
  const allKeys = await keys(messageStore);
  const msgs = await Promise.all(
    allKeys.map((key) => get<ChatMessage>(key as string, messageStore))
  );
  return msgs
    .filter(
      (m): m is ChatMessage =>
        m !== undefined && m.conversationId === conversationId
    )
    .sort((a, b) => a.timestamp - b.timestamp);
}

// --- Assets ---

export async function saveAsset(asset: GeneratedAsset): Promise<void> {
  await set(asset.id, asset, assetStore);
}

export async function getAssetsByConversation(
  conversationId: string
): Promise<GeneratedAsset[]> {
  const allKeys = await keys(assetStore);
  const assets = await Promise.all(
    allKeys.map((key) => get<GeneratedAsset>(key as string, assetStore))
  );
  return assets
    .filter(
      (a): a is GeneratedAsset =>
        a !== undefined && a.conversationId === conversationId
    )
    .sort((a, b) => a.timestamp - b.timestamp);
}

// --- Clear All ---

export async function clearAllData(): Promise<void> {
  await clear(conversationStore);
  await clear(messageStore);
  await clear(assetStore);
  localStorage.removeItem("olivia:api-key");
  localStorage.removeItem("olivia:use-own-key");
}

// --- localStorage helpers ---

export function getLocalItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage full or unavailable
  }
}

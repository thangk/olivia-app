"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  saveConversation,
  getAllConversations,
  deleteConversation as deleteConvFromDB,
  getMessagesByConversation,
  getAssetsByConversation,
  clearAllData,
} from "@/lib/storage";
import type { Conversation, ChatMessage, GeneratedAsset } from "@/types";

export function useConversations() {
  const [allConversations, setAllConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Split into active and trashed
  const conversations = useMemo(
    () => allConversations.filter((c) => !c.deletedAt),
    [allConversations]
  );
  const trashedConversations = useMemo(
    () =>
      allConversations
        .filter((c) => !!c.deletedAt)
        .sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0)),
    [allConversations]
  );

  // Load conversations on mount
  useEffect(() => {
    getAllConversations().then((convs) => {
      setAllConversations(convs);
      setLoaded(true);
    });
  }, []);

  // Load messages and assets when active conversation changes
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      setAssets([]);
      return;
    }
    Promise.all([
      getMessagesByConversation(activeConversationId),
      getAssetsByConversation(activeConversationId),
    ]).then(([msgs, assts]) => {
      setMessages(msgs);
      setAssets(assts);
    });
  }, [activeConversationId]);

  const createConversation = useCallback(
    async (
      title: string = "New Chat",
      type: "chat" | "project" = "chat",
      description?: string,
      projectId?: string
    ): Promise<string> => {
      const id = crypto.randomUUID();
      const conv: Conversation = {
        id,
        title: title.slice(0, 60),
        description,
        type,
        projectId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await saveConversation(conv);
      setAllConversations((prev) => [conv, ...prev]);
      setActiveConversationId(id);
      setMessages([]);
      setAssets([]);
      return id;
    },
    []
  );

  const selectConversation = useCallback((id: string) => {
    setActiveConversationId(id || null);
  }, []);

  // Soft delete — moves to trash
  const deleteConversation = useCallback(
    async (id: string) => {
      const now = Date.now();
      let convToSave: Conversation | undefined;
      setAllConversations((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            const updated = { ...c, deletedAt: now };
            convToSave = updated;
            return updated;
          }
          return c;
        })
      );
      if (convToSave) await saveConversation(convToSave);
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
        setAssets([]);
      }
    },
    [activeConversationId]
  );

  // Restore from trash
  const restoreConversation = useCallback(
    async (id: string) => {
      let convToSave: Conversation | undefined;
      setAllConversations((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          const { deletedAt: _, ...rest } = c;
          const updated = { ...rest, deletedAt: undefined };
          convToSave = updated;
          return updated;
        })
      );
      if (convToSave) await saveConversation(convToSave);
    },
    []
  );

  // Permanent delete — removes from DB
  const permanentlyDeleteConversation = useCallback(
    async (id: string) => {
      await deleteConvFromDB(id);
      setAllConversations((prev) => prev.filter((c) => c.id !== id));
    },
    []
  );

  // Permanently delete all trashed
  const emptyTrash = useCallback(async () => {
    let trashedIds: string[] = [];
    setAllConversations((prev) => {
      trashedIds = prev.filter((c) => !!c.deletedAt).map((c) => c.id);
      return prev.filter((c) => !c.deletedAt);
    });
    await Promise.all(trashedIds.map((id) => deleteConvFromDB(id)));
  }, []);

  const updateConversationTitle = useCallback(
    async (id: string, title: string) => {
      let convToSave: Conversation | undefined;
      setAllConversations((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            const updated = { ...c, title: title.slice(0, 60), updatedAt: Date.now() };
            convToSave = updated;
            return updated;
          }
          return c;
        })
      );
      if (convToSave) await saveConversation(convToSave);
    },
    []
  );

  // Update per-conversation settings (mode, resolution, aspectRatio)
  const updateConversationSettings = useCallback(
    async (id: string, settings: Partial<Pick<Conversation, "mode" | "resolution" | "aspectRatio">>) => {
      let convToSave: Conversation | undefined;
      setAllConversations((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            const updated = { ...c, ...settings, updatedAt: Date.now() };
            convToSave = updated;
            return updated;
          }
          return c;
        })
      );
      if (convToSave) await saveConversation(convToSave);
    },
    []
  );

  // Prefetch cache — preload messages/assets on hover
  const prefetchCache = useRef<Set<string>>(new Set());
  const prefetch = useCallback(async (id: string) => {
    if (prefetchCache.current.has(id)) return;
    prefetchCache.current.add(id);
    // Preload into browser cache (results are discarded but cached by idb-keyval)
    await Promise.all([
      getMessagesByConversation(id),
      getAssetsByConversation(id),
    ]);
  }, []);

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const replaceMessage = useCallback(async (id: string, msg: ChatMessage) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? msg : m)));
    // Persist to IndexedDB
    const { saveMessage } = await import("@/lib/storage");
    await saveMessage(msg);
  }, []);

  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateLastModelMessage = useCallback((text: string) => {
    setMessages((prev) => {
      const updated = [...prev];
      for (let i = updated.length - 1; i >= 0; i--) {
        if (updated[i].role === "model") {
          updated[i] = {
            ...updated[i],
            parts: [{ type: "text", content: text }],
          };
          break;
        }
      }
      return updated;
    });
  }, []);

  const addAsset = useCallback((asset: GeneratedAsset) => {
    setAssets((prev) => [...prev, asset]);
  }, []);

  const handleClearAll = useCallback(async () => {
    await clearAllData();
    setAllConversations([]);
    setActiveConversationId(null);
    setMessages([]);
    setAssets([]);
  }, []);

  return {
    conversations,
    trashedConversations,
    activeConversationId,
    messages,
    assets,
    loaded,
    createConversation,
    selectConversation,
    deleteConversation,
    restoreConversation,
    permanentlyDeleteConversation,
    emptyTrash,
    updateConversationTitle,
    updateConversationSettings,
    addMessage,
    replaceMessage,
    removeMessage,
    updateLastModelMessage,
    addAsset,
    prefetch,
    clearAll: handleClearAll,
  };
}

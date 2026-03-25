"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { AppHeader } from "./app-header";
import { Sidebar } from "./sidebar";
import { ChatPanel } from "./chat-panel";
import { CanvasPanel } from "./canvas-panel";
import { ProjectView } from "./project-view";
import { Breadcrumbs } from "./breadcrumbs";
import { SettingsDialog } from "@/components/settings/settings-dialog";
import { FeaturesDialog } from "@/components/settings/features-dialog";
import { useSettings } from "@/hooks/use-settings";
import { useConversations } from "@/hooks/use-conversations";
import { useChat } from "@/hooks/use-chat";
import { useCanvas } from "@/hooks/use-canvas";
import { useUrlState } from "@/hooks/use-url-state";
import { cn } from "@/lib/utils";
import type { GenerationMode } from "@/types";

export function AppLayout() {
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"chat" | "canvas">("chat");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [mode, setMode] = useState<GenerationMode>("assisted");
  const [refImage, setRefImage] = useState<{ base64: string; mimeType: string } | null>(null);
  // Navigation: viewing a project's conversation list vs an active conversation
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Settings
  const settings = useSettings();

  // Conversations, messages, assets
  const convos = useConversations();

  // URL state sync
  const { updateUrl } = useUrlState(
    useCallback(
      (state) => {
        if (state.projectId) setActiveProjectId(state.projectId);
        if (state.conversationId) convos.selectConversation(state.conversationId);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [convos.selectConversation]
    )
  );

  // Update URL when navigation changes
  useEffect(() => {
    updateUrl({
      projectId: activeProjectId,
      conversationId: convos.activeConversationId,
    });
  }, [activeProjectId, convos.activeConversationId, updateUrl]);

  // Derived: active project and its conversations
  const activeProject = useMemo(
    () => convos.conversations.find((c) => c.id === activeProjectId) ?? null,
    [convos.conversations, activeProjectId]
  );
  const projectConversations = useMemo(
    () =>
      activeProjectId
        ? convos.conversations
            .filter((c) => c.projectId === activeProjectId && c.type === "chat")
            .sort((a, b) => b.updatedAt - a.updatedAt)
        : [],
    [convos.conversations, activeProjectId]
  );

  // Are we viewing a project's conversation list (no active conversation)?
  const isProjectView = activeProjectId !== null && convos.activeConversationId === null;

  // Active conversation's parent project (for breadcrumbs)
  const activeConv = useMemo(
    () =>
      convos.activeConversationId
        ? convos.conversations.find((c) => c.id === convos.activeConversationId)
        : null,
    [convos.conversations, convos.activeConversationId]
  );
  const parentProject = useMemo(
    () =>
      activeConv?.projectId
        ? convos.conversations.find((c) => c.id === activeConv.projectId)
        : null,
    [convos.conversations, activeConv]
  );

  // Assets filtered to project if in project context
  const displayAssets = useMemo(() => {
    if (activeProjectId) {
      const projectChatIds = new Set(
        convos.conversations
          .filter((c) => c.projectId === activeProjectId)
          .map((c) => c.id)
      );
      return convos.assets.filter((a) => projectChatIds.has(a.conversationId));
    }
    return convos.assets;
  }, [activeProjectId, convos.conversations, convos.assets]);

  // Canvas
  const canvas = useCanvas({
    effectiveApiKey: settings.effectiveApiKey,
    activeConversationId: convos.activeConversationId,
    assets: displayAssets,
    addAsset: convos.addAsset,
  });

  // Load per-conversation settings when switching conversations
  useEffect(() => {
    if (!activeConv) return;
    if (activeConv.mode) setMode(activeConv.mode);
    if (activeConv.resolution) canvas.setResolution(activeConv.resolution);
    if (activeConv.aspectRatio) canvas.setAspectRatio(activeConv.aspectRatio);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConv?.id]);

  // Persist mode/resolution/ratio changes to conversation
  const handleModeChange = useCallback(
    (newMode: GenerationMode) => {
      setMode(newMode);
      if (convos.activeConversationId) {
        convos.updateConversationSettings(convos.activeConversationId, { mode: newMode });
      }
    },
    [convos]
  );

  const handleResolutionChange = useCallback(
    (resolution: import("@/types").ImageResolution) => {
      canvas.setResolution(resolution);
      if (convos.activeConversationId) {
        convos.updateConversationSettings(convos.activeConversationId, { resolution });
      }
    },
    [canvas, convos]
  );

  const handleAspectRatioChange = useCallback(
    (aspectRatio: import("@/types").AspectRatio) => {
      canvas.setAspectRatio(aspectRatio);
      if (convos.activeConversationId) {
        convos.updateConversationSettings(convos.activeConversationId, { aspectRatio });
      }
    },
    [canvas, convos]
  );

  // Chat
  const chat = useChat({
    effectiveApiKey: settings.effectiveApiKey,
    activeConversationId: convos.activeConversationId,
    messages: convos.messages,
    mode,
    addMessage: convos.addMessage,
    updateLastModelMessage: convos.updateLastModelMessage,
    onConversationCreated: (title) =>
      convos.createConversation(title, "chat", undefined, activeProjectId ?? undefined),
    updateConversationTitle: convos.updateConversationTitle,
    onDirectGenerate: async (prompt, image, conversationId) => {
      const convId = conversationId || convos.activeConversationId || "";
      const genMsgId = crypto.randomUUID();
      convos.addMessage({
        id: genMsgId,
        conversationId: convId,
        role: "model",
        parts: [{ type: "generating", content: "" }],
        timestamp: Date.now(),
      });

      const imgRef = image || refImage;

      setMobileTab("canvas");
      const asset = await canvas.generateImage(prompt, imgRef, convId);

      if (asset) {
        convos.replaceMessage(genMsgId, {
          id: genMsgId,
          conversationId: asset.conversationId,
          role: "model",
          parts: [{ type: "image", content: asset.base64, mimeType: asset.mimeType }],
          timestamp: Date.now(),
        });
      } else {
        convos.removeMessage(genMsgId);
      }
    },
    onGenerationIntent: async (prompt, conversationId) => {
      const convId = conversationId || convos.activeConversationId || "";
      const genMsgId = crypto.randomUUID();
      convos.addMessage({
        id: genMsgId,
        conversationId: convId,
        role: "model",
        parts: [{ type: "generating", content: "" }],
        timestamp: Date.now(),
      });

      setMobileTab("canvas");
      const asset = await canvas.generateImage(prompt, refImage, convId);

      // Replace the generating placeholder with the actual image (or error)
      if (asset) {
        convos.replaceMessage(genMsgId, {
          id: genMsgId,
          conversationId: asset.conversationId,
          role: "model",
          parts: [{ type: "image", content: asset.base64, mimeType: asset.mimeType }],
          timestamp: Date.now(),
        });
      } else {
        convos.removeMessage(genMsgId);
      }
    },
    onSuggestionsReceived: setSuggestions,
  });

  // Show error toasts
  useEffect(() => {
    if (chat.error) toast.error(chat.error);
  }, [chat.error]);

  useEffect(() => {
    if (canvas.error) toast.error(canvas.error);
  }, [canvas.error]);

  const handleSend = useCallback(
    (text: string, image?: { base64: string; mimeType: string }) => {
      chat.sendMessage(text, image);
    },
    [chat]
  );

  const handleSelectSuggestion = useCallback(
    (suggestion: string) => {
      chat.sendMessage(suggestion);
    },
    [chat]
  );

  // Sidebar: select a project or conversation
  const handleSidebarSelect = useCallback(
    (id: string) => {
      const conv = convos.conversations.find((c) => c.id === id);
      if (!conv) return;
      if (conv.type === "project") {
        setActiveProjectId(id);
        convos.selectConversation(""); // deselect any active conversation
      } else {
        setActiveProjectId(conv.projectId ?? null);
        convos.selectConversation(id);
      }
    },
    [convos]
  );

  // Navigate back to project view
  const handleBackToProject = useCallback(() => {
    convos.selectConversation("");
  }, [convos]);

  // New chat (standalone or within project)
  const handleNewChat = useCallback(() => {
    if (activeProjectId) {
      convos.createConversation("New Chat", "chat", undefined, activeProjectId);
    } else {
      convos.createConversation();
    }
  }, [convos, activeProjectId]);

  // New conversation from project view
  const handleNewProjectChat = useCallback(() => {
    if (!activeProjectId) return;
    convos.createConversation("New Chat", "chat", undefined, activeProjectId);
  }, [convos, activeProjectId]);

  const handleClearData = useCallback(async () => {
    await convos.clearAll();
    settings.setApiKey("");
    settings.setUseOwnKey(false);
    setSuggestions([]);
    setActiveProjectId(null);
  }, [convos, settings]);

  // Breadcrumb items
  const breadcrumbs = useMemo(() => {
    if (parentProject && activeConv) {
      return [
        { label: parentProject.title, onClick: handleBackToProject },
        { label: activeConv.title },
      ];
    }
    if (activeProject && isProjectView) {
      return [{ label: activeProject.title }];
    }
    return [];
  }, [parentProject, activeConv, activeProject, isProjectView, handleBackToProject]);

  // Asset panel title
  const assetPanelTitle = activeProjectId ? "Project Assets" : "Assets";

  // Center panel content
  const renderCenterPanel = () => {
    if (isProjectView && activeProject) {
      return (
        <ProjectView
          project={activeProject}
          conversations={projectConversations}
          onSelectConversation={(id) => convos.selectConversation(id)}
          onNewChat={handleNewProjectChat}
        />
      );
    }
    return (
      <ChatPanel
        messages={convos.messages}
        isStreaming={chat.isStreaming}
        suggestions={suggestions}
        onSend={handleSend}
        onSelectSuggestion={handleSelectSuggestion}
        resolution={canvas.resolution}
        aspectRatio={canvas.aspectRatio}
        mode={mode}
        onResolutionChange={handleResolutionChange}
        onAspectRatioChange={handleAspectRatioChange}
        onModeChange={handleModeChange}
        assets={displayAssets}
        refImage={refImage}
        onRefImageChange={setRefImage}
      />
    );
  };

  return (
    <div className="flex h-screen flex-col">
      <AppHeader
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenFeatures={() => setFeaturesOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — desktop */}
        <div
          className={cn(
            "hidden shrink-0 border-r transition-all duration-200 lg:block",
            sidebarOpen ? "w-60" : "w-0 border-r-0"
          )}
        >
          {sidebarOpen && (
            <Sidebar
              conversations={convos.conversations}
              trashedConversations={convos.trashedConversations}
              activeConversationId={convos.activeConversationId}
              activeProjectId={activeProjectId}
              onSelectConversation={handleSidebarSelect}
              onNewChat={handleNewChat}
              onDeleteConversation={convos.deleteConversation}
              onCreateProject={(name, description) => {
                convos.createConversation(name, "project", description);
              }}
              onRestore={convos.restoreConversation}
              onPermanentlyDelete={convos.permanentlyDeleteConversation}
              onEmptyTrash={convos.emptyTrash}
              onPrefetch={convos.prefetch}
            />
          )}
        </div>

        {/* Mobile tabs */}
        <div className="flex flex-1 flex-col lg:hidden">
          <div className="flex border-b">
            <button
              onClick={() => setMobileTab("chat")}
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium transition-colors",
                mobileTab === "chat"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              )}
            >
              Chat
            </button>
            <button
              onClick={() => setMobileTab("canvas")}
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium transition-colors",
                mobileTab === "canvas"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              )}
            >
              Canvas
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            {mobileTab === "chat" ? (
              renderCenterPanel()
            ) : (
              <CanvasPanel
                title={assetPanelTitle}
                assets={displayAssets}
                isGenerating={canvas.isGenerating}
              />
            )}
          </div>
        </div>

        {/* Desktop two-panel layout */}
        <div className="hidden min-h-0 flex-1 lg:flex">
          <div className="flex min-w-0 flex-1 flex-col border-r">
            {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
            {renderCenterPanel()}
          </div>
          <div className="flex w-72 shrink-0 flex-col">
            <CanvasPanel
              title={assetPanelTitle}
              assets={displayAssets}
              isGenerating={canvas.isGenerating}
            />
          </div>
        </div>
      </div>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        apiKey={settings.apiKey}
        useOwnKey={settings.useOwnKey}
        onApiKeyChange={settings.setApiKey}
        onUseOwnKeyChange={settings.setUseOwnKey}
        onClearData={handleClearData}
      />
      <FeaturesDialog open={featuresOpen} onOpenChange={setFeaturesOpen} />
    </div>
  );
}

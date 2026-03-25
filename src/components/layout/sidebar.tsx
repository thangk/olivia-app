"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  MessageSquare,
  Trash2,
  FolderPlus,
  FolderOpen,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TrashBin } from "./trash-bin";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types";

interface SidebarProps {
  conversations: Conversation[];
  trashedConversations: Conversation[];
  activeConversationId: string | null;
  activeProjectId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onCreateProject: (name: string, description: string) => void;
  onRestore: (id: string) => void;
  onPermanentlyDelete: (id: string) => void;
  onEmptyTrash: () => void;
  onPrefetch?: (id: string) => void;
}

export function Sidebar({
  conversations,
  trashedConversations,
  activeConversationId,
  activeProjectId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onCreateProject,
  onRestore,
  onPermanentlyDelete,
  onEmptyTrash,
  onPrefetch,
}: SidebarProps) {
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [search, setSearch] = useState("");

  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, search]);

  const projects = filteredConversations.filter((c) => c.type === "project");
  const chats = filteredConversations.filter((c) => c.type !== "project" && !c.projectId);

  const handleCreateProject = () => {
    if (!projectName.trim()) return;
    onCreateProject(projectName.trim(), projectDescription.trim());
    setProjectName("");
    setProjectDescription("");
    setProjectDialogOpen(false);
  };

  const renderItem = (conv: Conversation) => {
    const isActive =
      activeConversationId === conv.id ||
      (conv.type === "project" && activeProjectId === conv.id);
    return (
    <div
      key={conv.id}
      role="button"
      tabIndex={0}
      onClick={() => onSelectConversation(conv.id)}
      onMouseEnter={() => onPrefetch?.(conv.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectConversation(conv.id);
        }
      }}
      className={cn(
        "group flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-sidebar-accent",
        isActive &&
          "bg-primary/10 text-primary font-medium border-l-2 border-primary"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {conv.type === "project" ? (
        <FolderOpen className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
      ) : (
        <MessageSquare className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
      )}
      <span className="flex-1 truncate">{conv.title}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteConversation(conv.id);
        }}
        aria-label={`Delete ${conv.title}`}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
    );
  };

  return (
    <div className="relative flex h-full flex-col bg-sidebar">
      <div className="flex flex-col gap-1.5 p-3">
        <Button
          onClick={() => setProjectDialogOpen(true)}
          className="w-full justify-start gap-2"
          variant="outline"
          size="sm"
        >
          <FolderPlus className="h-4 w-4" />
          Create Project
        </Button>
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2"
          variant="ghost"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="h-7 pl-7 text-xs"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 scrollbar-none">
        <div className="flex flex-col gap-0.5 pb-12">
          {/* Projects group */}
          {projects.length > 0 && (
            <>
              <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Projects
              </p>
              {projects.map(renderItem)}
            </>
          )}

          {/* Chats group */}
          {chats.length > 0 && (
            <>
              <p className="px-3 pb-1 pt-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Chats
              </p>
              {chats.map(renderItem)}
            </>
          )}

          {conversations.length === 0 && !search && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              No conversations yet
            </p>
          )}

          {filteredConversations.length === 0 && search && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              No results for &ldquo;{search}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* Floating trash icon — bottom right */}
      <div className="absolute bottom-3 right-3">
        <TrashBin
          trashedConversations={trashedConversations}
          onRestore={onRestore}
          onPermanentlyDelete={onPermanentlyDelete}
          onEmptyTrash={onEmptyTrash}
        />
      </div>

      <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
            <DialogDescription>
              Organize your ad creatives into a project.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Summer Campaign 2026"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateProject();
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="project-desc">
                Description{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="project-desc"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Brief description of this project..."
                rows={2}
                className="resize-none"
              />
            </div>
            <Button
              onClick={handleCreateProject}
              disabled={!projectName.trim()}
              className="w-full"
            >
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

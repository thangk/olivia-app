"use client";

import { Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Conversation } from "@/types";

interface ProjectViewProps {
  project: Conversation;
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
}

export function ProjectView({
  project,
  conversations,
  onSelectConversation,
  onNewChat,
}: ProjectViewProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6">
      <div className="flex w-full max-w-md flex-col gap-4">
        <div className="text-center">
          <h2 className="text-lg font-medium">{project.title}</h2>
          {project.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {project.description}
            </p>
          )}
        </div>

        <Button
          onClick={onNewChat}
          variant="outline"
          size="sm"
          className="mx-auto gap-2"
        >
          <Plus className="h-4 w-4" />
          New Conversation
        </Button>

        {conversations.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No conversations yet. Create one to get started.
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className="flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted"
              >
                <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{conv.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

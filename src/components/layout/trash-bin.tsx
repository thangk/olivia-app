"use client";

import { useState, useMemo } from "react";
import {
  Trash2,
  RotateCcw,
  FolderOpen,
  MessageSquare,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types";

interface TrashBinProps {
  trashedConversations: Conversation[];
  onRestore: (id: string) => void;
  onPermanentlyDelete: (id: string) => void;
  onEmptyTrash: () => void;
}

export function TrashBin({
  trashedConversations,
  onRestore,
  onPermanentlyDelete,
  onEmptyTrash,
}: TrashBinProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!search.trim()) return trashedConversations;
    const q = search.toLowerCase();
    return trashedConversations.filter((c) =>
      c.title.toLowerCase().includes(q)
    );
  }, [trashedConversations, search]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((c) => c.id)));
    }
  };

  const deleteSelected = () => {
    selected.forEach((id) => onPermanentlyDelete(id));
    setSelected(new Set());
  };

  const restoreSelected = () => {
    selected.forEach((id) => onRestore(id));
    setSelected(new Set());
  };

  const handleEmptyTrash = () => {
    onEmptyTrash();
    setSelected(new Set());
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setOpen(true)}
              aria-label="Trash bin"
            />
          }
        >
          <div className="relative">
            <Trash2 className="h-4 w-4" />
            {trashedConversations.length > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[8px] font-medium text-destructive-foreground">
                {trashedConversations.length}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>Trash ({trashedConversations.length})</TooltipContent>
      </Tooltip>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) {
            setSearch("");
            setSelected(new Set());
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Trash</DialogTitle>
            <DialogDescription>
              {trashedConversations.length === 0
                ? "Trash is empty."
                : `${trashedConversations.length} item${trashedConversations.length !== 1 ? "s" : ""} in trash.`}
            </DialogDescription>
          </DialogHeader>

          {trashedConversations.length > 0 && (
            <div className="flex flex-col gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search trash..."
                  className="pl-8 text-sm"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Actions bar */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={selectAll}
                >
                  {selected.size === filtered.length && filtered.length > 0
                    ? "Deselect all"
                    : "Select all"}
                </Button>
                <div className="flex-1" />
                {selected.size > 0 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-xs"
                      onClick={restoreSelected}
                    >
                      <RotateCcw className="h-3 w-3" />
                      Restore ({selected.size})
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-xs text-destructive hover:text-destructive"
                      onClick={deleteSelected}
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete ({selected.size})
                    </Button>
                  </>
                )}
                {selected.size === 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-xs text-destructive hover:text-destructive"
                    onClick={handleEmptyTrash}
                  >
                    <Trash2 className="h-3 w-3" />
                    Empty trash
                  </Button>
                )}
              </div>

              {/* List */}
              <ScrollArea className="max-h-64">
                <div className="flex flex-col gap-0.5">
                  {filtered.map((conv) => (
                    <div
                      key={conv.id}
                      className={cn(
                        "group flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted",
                        selected.has(conv.id) && "bg-muted"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(conv.id)}
                        onChange={() => toggleSelect(conv.id)}
                        className="h-3.5 w-3.5 shrink-0 rounded border-border accent-primary"
                        aria-label={`Select ${conv.title}`}
                      />
                      {conv.type === "project" ? (
                        <FolderOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      ) : (
                        <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      )}
                      <span className="flex-1 truncate text-sm">
                        {conv.title}
                      </span>
                      <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onRestore(conv.id)}
                          aria-label={`Restore ${conv.title}`}
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => onPermanentlyDelete(conv.id)}
                          aria-label={`Permanently delete ${conv.title}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filtered.length === 0 && search && (
                    <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                      No results for &ldquo;{search}&rdquo;
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

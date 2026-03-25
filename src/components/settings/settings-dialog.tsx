"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: string;
  useOwnKey: boolean;
  onApiKeyChange: (key: string) => void;
  onUseOwnKeyChange: (use: boolean) => void;
  onClearData: () => void;
}

const THEMES = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

export function SettingsDialog({
  open,
  onOpenChange,
  apiKey,
  useOwnKey,
  onApiKeyChange,
  onUseOwnKeyChange,
  onClearData,
}: SettingsDialogProps) {
  const { theme, setTheme } = useTheme();
  const [showKey, setShowKey] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your Olivia Ad Studio preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-2">
          {/* Theme */}
          <div className="flex flex-col gap-2">
            <Label>Theme</Label>
            <div className="flex gap-1">
              {THEMES.map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "flex-1 gap-1.5",
                    theme === value && "border-primary bg-primary/5"
                  )}
                  onClick={() => setTheme(value)}
                  aria-pressed={theme === value}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* API Key */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="use-own-key">Use your own API key</Label>
              <Switch
                id="use-own-key"
                checked={useOwnKey}
                onCheckedChange={onUseOwnKeyChange}
              />
            </div>
            {useOwnKey && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="api-key" className="text-xs text-muted-foreground">
                  Gemini API Key
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="api-key"
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => onApiKeyChange(e.target.value)}
                    placeholder="Enter your Gemini API key"
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowKey(!showKey)}
                    className="shrink-0"
                    aria-label={showKey ? "Hide API key" : "Show API key"}
                  >
                    {showKey ? "Hide" : "Show"}
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Your key is stored locally in your browser and never sent to
                  our servers.
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Clear Data */}
          <div className="flex flex-col gap-2">
            <Label>Data</Label>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="destructive" size="sm" className="gap-1.5" />
                }
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear all data
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all conversations, generated
                    images, and settings. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onClearData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Clear everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <p className="text-[11px] text-muted-foreground">
              Remove all locally stored conversations, images, and preferences.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

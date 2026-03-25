"use client";

import { useEffect, useState } from "react";
import { HelpCircle, PanelLeftClose, PanelLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getRateLimitStatus } from "@/lib/rate-limit";

interface AppHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onOpenFeatures: () => void;
}

export function AppHeader({
  sidebarOpen,
  onToggleSidebar,
  onOpenSettings,
  onOpenFeatures,
}: AppHeaderProps) {
  const [rateStatus, setRateStatus] = useState(getRateLimitStatus());

  useEffect(() => {
    const interval = setInterval(() => setRateStatus(getRateLimitStatus()), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b px-3">
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onToggleSidebar}
                aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              />
            }
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
          </TooltipTrigger>
          <TooltipContent>
            {sidebarOpen ? "Close sidebar" : "Open sidebar"}
          </TooltipContent>
        </Tooltip>
        <span className="text-sm font-semibold tracking-tight">
          Olivia Ad Studio
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger className="cursor-default">
            <span className="text-[11px] text-muted-foreground">
              {!rateStatus.allowed && rateStatus.nextAvailableIn !== null ? (
                <span className="text-destructive">
                  Limit &middot; {rateStatus.nextAvailableIn}s
                </span>
              ) : (
                <span>{rateStatus.minuteRemaining}/min &middot; {rateStatus.hourRemaining}/hr</span>
              )}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            Image generation rate limit: max 5 per minute, 30 per hour
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onOpenFeatures}
                aria-label="Features"
              />
            }
          >
            <HelpCircle className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent>Features</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onOpenSettings}
                aria-label="Settings"
              />
            }
          >
            <Settings className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}

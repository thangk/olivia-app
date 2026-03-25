"use client";

import { useCallback, useEffect, useRef } from "react";

interface UrlState {
  projectId: string | null;
  conversationId: string | null;
}

/**
 * Syncs navigation state with URL search params.
 * URL format: ?p=projectId&c=conversationId
 */
export function useUrlState(
  onStateFromUrl: (state: UrlState) => void
): {
  updateUrl: (state: UrlState) => void;
} {
  const initialized = useRef(false);

  // Read URL on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("p");
    const conversationId = params.get("c");

    if (projectId || conversationId) {
      onStateFromUrl({ projectId, conversationId });
    }
  }, [onStateFromUrl]);

  // Update URL without navigation
  const updateUrl = useCallback((state: UrlState) => {
    const params = new URLSearchParams();
    if (state.projectId) params.set("p", state.projectId);
    if (state.conversationId) params.set("c", state.conversationId);

    const search = params.toString();
    const url = search ? `?${search}` : window.location.pathname;

    window.history.replaceState(null, "", url);
  }, []);

  return { updateUrl };
}

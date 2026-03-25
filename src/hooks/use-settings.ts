"use client";

import { useState, useEffect, useCallback } from "react";
import { getLocalItem, setLocalItem } from "@/lib/storage";

export function useSettings() {
  const [apiKey, setApiKeyState] = useState("");
  const [useOwnKey, setUseOwnKeyState] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setApiKeyState(getLocalItem("olivia:api-key", ""));
    setUseOwnKeyState(getLocalItem("olivia:use-own-key", false));
    setLoaded(true);
  }, []);

  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key);
    setLocalItem("olivia:api-key", key);
  }, []);

  const setUseOwnKey = useCallback((use: boolean) => {
    setUseOwnKeyState(use);
    setLocalItem("olivia:use-own-key", use);
  }, []);

  // Returns the API key to use in requests (empty string means use server default)
  const effectiveApiKey = useOwnKey && apiKey ? apiKey : "";

  return {
    apiKey,
    useOwnKey,
    effectiveApiKey,
    setApiKey,
    setUseOwnKey,
    loaded,
  };
}

import { useCallback, useEffect, useState } from "react";

/**
 * @param {{
 *   storyId: string | null | undefined;
 *   mediaType: 'image' | 'video' | null | undefined;
 *   isActive: boolean;
 * }} params
 */
export function useUserStoryMediaLoadState({ storyId, mediaType, isActive }) {
  const [loadState, setLoadState] = useState("idle");

  useEffect(() => {
    if (!isActive || !storyId || !mediaType) {
      setLoadState("idle");
      return;
    }

    setLoadState("loading");
  }, [isActive, mediaType, storyId]);

  const markMediaLoading = useCallback(() => {
    setLoadState("loading");
  }, []);

  const markMediaReady = useCallback(() => {
    setLoadState("ready");
  }, []);

  const markMediaError = useCallback(() => {
    setLoadState("error");
  }, []);

  const handleImageLoad = useCallback(() => {
    markMediaReady();
  }, [markMediaReady]);

  const handleImageError = useCallback(() => {
    markMediaError();
  }, [markMediaError]);

  return {
    isMediaLoading: loadState === "loading",
    hasMediaError: loadState === "error",
    isMediaReady: loadState === "ready",
    markMediaLoading,
    markMediaReady,
    markMediaError,
    handleImageLoad,
    handleImageError,
  };
}

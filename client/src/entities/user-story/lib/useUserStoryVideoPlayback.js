import { useCallback, useEffect, useRef } from "react";

/**
 * @param {{
 *   enabled: boolean;
 *   storyId: string | null | undefined;
 *   onEnded?: () => void;
 *   onMediaLoading?: () => void;
 *   onMediaReady?: () => void;
 *   onMediaError?: () => void;
 * }} params
 */
export function useUserStoryVideoPlayback({
  enabled,
  storyId,
  onEnded,
  onMediaLoading,
  onMediaReady,
  onMediaError,
}) {
  const videoRef = useRef(/** @type {HTMLVideoElement | null} */ (null));

  const playWithSound = useCallback(async () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.muted = false;
    try {
      await video.play();
    } catch {
      // autoplay со звуком может быть заблокирован до тапа по viewer
    }
  }, []);

  useEffect(() => {
    if (!enabled || !storyId) {
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    const handleReady = () => {
      onMediaReady?.();
      void playWithSound();
    };

    const handleEnded = () => {
      onEnded?.();
    };

    const handleLoading = () => {
      onMediaLoading?.();
    };

    const handleError = () => {
      onMediaError?.();
    };

    video.addEventListener("loadstart", handleLoading);
    video.addEventListener("waiting", handleLoading);
    video.addEventListener("canplay", handleReady);
    video.addEventListener("playing", handleReady);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      handleReady();
    } else {
      handleLoading();
    }

    return () => {
      video.removeEventListener("loadstart", handleLoading);
      video.removeEventListener("waiting", handleLoading);
      video.removeEventListener("canplay", handleReady);
      video.removeEventListener("playing", handleReady);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
      video.pause();
      video.currentTime = 0;
    };
  }, [
    enabled,
    onEnded,
    onMediaError,
    onMediaLoading,
    onMediaReady,
    playWithSound,
    storyId,
  ]);

  const resumeIfPaused = useCallback(() => {
    void playWithSound();
  }, [playWithSound]);

  return { videoRef, resumeIfPaused };
}

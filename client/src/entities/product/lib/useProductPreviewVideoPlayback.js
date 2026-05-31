import { useEffect, useRef, useState } from "react";

import { PRODUCT_PREVIEW_VIDEO_MAX_DURATION_SEC } from "../model/productConstants.js";

/**
 * Autoplay в viewport + зацикливание первых N секунд.
 *
 * @param {{
 *   enabled?: boolean;
 *   maxDurationSec?: number;
 *   playWhenVisible?: boolean;
 * }} [options]
 */
export function useProductPreviewVideoPlayback({
  enabled = true,
  maxDurationSec = PRODUCT_PREVIEW_VIDEO_MAX_DURATION_SEC,
  playWhenVisible = true,
} = {}) {
  const containerRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const videoRef = useRef(/** @type {HTMLVideoElement | null} */ (null));
  const [isInView, setIsInView] = useState(!playWhenVisible);

  useEffect(() => {
    if (!enabled || !playWhenVisible) return;
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry?.isIntersecting === true);
      },
      { threshold: 0.25, rootMargin: "0px 0px 8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, playWhenVisible]);

  useEffect(() => {
    if (!enabled) return;
    const video = videoRef.current;
    if (!video) return;

    const shouldPlay = playWhenVisible ? isInView : true;

    if (!shouldPlay) {
      video.pause();
      video.currentTime = 0;
      return;
    }

    video.muted = true;
    void video.play().catch(() => {});

    const handleTimeUpdate = () => {
      if (video.currentTime >= maxDurationSec) {
        video.currentTime = 0;
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [enabled, isInView, maxDurationSec, playWhenVisible]);

  return { containerRef, videoRef, isInView };
}

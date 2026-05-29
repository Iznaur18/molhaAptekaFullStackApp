import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useAppIntro } from "../model/AppIntroContext.jsx";
import {
  APP_INTRO_FADE_OUT_MS,
  APP_INTRO_MAX_MS,
  APP_INTRO_MIN_MS,
  APP_INTRO_VIDEO_MP4,
} from "../model/introConstants.js";
import { prefersReducedMotion } from "../lib/prefersReducedMotion.js";
import { APP_INTRO_UI } from "../../../shared/config/appUiCopy.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";

import "./AppIntroSplash.css";

/**
 * @param {{ onDismiss: () => void }} props
 */
function AppIntroSplashContent({ onDismiss }) {
  const videoRef = useRef(/** @type {HTMLVideoElement | null} */ (null));
  const openedAtRef = useRef(0);
  const closingRef = useRef(false);
  const dismissedRef = useRef(false);
  const minTimerRef = useRef(/** @type {ReturnType<typeof setTimeout> | null} */ (null));
  const maxTimerRef = useRef(/** @type {ReturnType<typeof setTimeout> | null} */ (null));

  const [isMuted, setIsMuted] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useScrollLock(true);

  const clearDismissTimers = useCallback(() => {
    if (minTimerRef.current != null) {
      clearTimeout(minTimerRef.current);
      minTimerRef.current = null;
    }
    if (maxTimerRef.current != null) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
  }, []);

  const completeDismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    clearDismissTimers();
    onDismiss();
  }, [clearDismissTimers, onDismiss]);

  const beginDismiss = useCallback(() => {
    if (closingRef.current || dismissedRef.current) return;
    closingRef.current = true;
    clearDismissTimers();

    if (prefersReducedMotion()) {
      completeDismiss();
      return;
    }

    setIsClosing(true);
  }, [clearDismissTimers, completeDismiss]);

  const dismissAfterMinDuration = useCallback(() => {
    if (closingRef.current || dismissedRef.current) return;
    const elapsed = Date.now() - openedAtRef.current;
    const waitMs = Math.max(0, APP_INTRO_MIN_MS - elapsed);
    if (waitMs === 0) {
      beginDismiss();
      return;
    }
    minTimerRef.current = setTimeout(beginDismiss, waitMs);
  }, [beginDismiss]);

  useEffect(() => {
    openedAtRef.current = Date.now();
    closingRef.current = false;
    dismissedRef.current = false;

    maxTimerRef.current = setTimeout(beginDismiss, APP_INTRO_MAX_MS);

    return () => {
      clearDismissTimers();
    };
  }, [beginDismiss, clearDismissTimers]);

  useEffect(() => {
    if (!isClosing) return undefined;
    const fallbackTimer = setTimeout(
      completeDismiss,
      APP_INTRO_FADE_OUT_MS + 80,
    );
    return () => clearTimeout(fallbackTimer);
  }, [completeDismiss, isClosing]);

  const handleTransitionEnd = (event) => {
    if (event.target !== event.currentTarget) return;
    if (event.propertyName !== "opacity") return;
    if (!isClosing) return;
    completeDismiss();
  };

  const handleCanPlay = () => {
    const video = videoRef.current;
    if (!video || videoFailed) return;
    void video.play().catch(() => {
      // autoplay может отклониться — не переключаемся на заглушку
    });
  };

  const handleSkip = () => {
    beginDismiss();
  };

  const handleToggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted) {
      void video.play().catch(() => {
        video.muted = true;
        setIsMuted(true);
      });
    }
  };

  const handleVideoEnded = () => {
    dismissAfterMinDuration();
  };

  const handleVideoError = () => {
    setVideoFailed(true);
  };

  const rootClassName = [
    "app-intro-splash",
    isClosing ? "app-intro-splash_closing" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={rootClassName}
      role="dialog"
      aria-modal="true"
      aria-label={APP_INTRO_UI.ARIA_OVERLAY}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className="app-intro-splash__media">
        {videoFailed ? (
          <div className="app-intro-splash__fallback" aria-hidden="true">
            <p className="app-intro-splash__fallback-title">
              {APP_INTRO_UI.FALLBACK_TITLE}
            </p>
            <p className="app-intro-splash__fallback-hint">
              {APP_INTRO_UI.FALLBACK_HINT}
            </p>
          </div>
        ) : (
          <video
            ref={videoRef}
            className="app-intro-splash__video"
            autoPlay
            muted
            playsInline
            preload="auto"
            aria-label={APP_INTRO_UI.VIDEO_ARIA}
            onCanPlay={handleCanPlay}
            onEnded={handleVideoEnded}
            onError={handleVideoError}
          >
            <source src={APP_INTRO_VIDEO_MP4} type="video/mp4" />
          </video>
        )}
      </div>
      <div className="app-intro-splash__actions">
        {!videoFailed ? (
          <button
            type="button"
            className="app-intro-splash__btn app-intro-splash__btn_secondary"
            onClick={handleToggleSound}
            disabled={isClosing}
          >
            {isMuted ? APP_INTRO_UI.ENABLE_SOUND : APP_INTRO_UI.DISABLE_SOUND}
          </button>
        ) : null}
        <button
          type="button"
          className="app-intro-splash__btn app-intro-splash__btn_primary"
          onClick={handleSkip}
          disabled={isClosing}
        >
          {APP_INTRO_UI.SKIP}
        </button>
      </div>
    </div>
  );
}

export function AppIntroSplash() {
  const { isIntroVisible, dismissIntro } = useAppIntro();

  if (!isIntroVisible) return null;

  return createPortal(
    <AppIntroSplashContent onDismiss={dismissIntro} />,
    document.body,
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import { resolveAppIntroPlaybackConfig } from "../../../entities/app-intro-settings/lib/resolveAppIntroPlaybackConfig.js";
import { useAppIntroSettingsQuery } from "../../../entities/app-intro-settings/model/useAppIntroSettingsQuery.js";
import { useAppIntro } from "../model/AppIntroContext.jsx";
import { prefersReducedMotion } from "../lib/prefersReducedMotion.js";
import { APP_INTRO_UI } from "../../../shared/config/appUiCopy.js";
import { dispatchOpenUserProfileEvent } from "../../../shared/lib/openUserProfileEvent.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";

import "./AppIntroSplash.css";

/**
 * @typedef {import('../../../entities/app-intro-settings/lib/resolveAppIntroPlaybackConfig.js').AppIntroPlaybackConfig} AppIntroPlaybackConfig
 */

/**
 * @param {{ config: AppIntroPlaybackConfig; onDismiss: () => void }} props
 */
function AppIntroSplashContent({ config, onDismiss }) {
  const navigate = useNavigate();
  const videoRef = useRef(/** @type {HTMLVideoElement | null} */ (null));
  const openedAtRef = useRef(0);
  const closingRef = useRef(false);
  const dismissedRef = useRef(false);
  const minTimerRef = useRef(
    /** @type {ReturnType<typeof setTimeout> | null} */ (null),
  );
  const maxTimerRef = useRef(
    /** @type {ReturnType<typeof setTimeout> | null} */ (null),
  );

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
    const waitMs = Math.max(0, config.minMs - elapsed);
    if (waitMs === 0) {
      beginDismiss();
      return;
    }
    minTimerRef.current = setTimeout(beginDismiss, waitMs);
  }, [beginDismiss, config.minMs]);

  useEffect(() => {
    openedAtRef.current = Date.now();
    closingRef.current = false;
    dismissedRef.current = false;
    setVideoFailed(false);
    setIsClosing(false);
    setIsMuted(true);

    maxTimerRef.current = setTimeout(beginDismiss, config.maxMs);

    return () => {
      clearDismissTimers();
    };
  }, [beginDismiss, clearDismissTimers, config.maxMs, config.videoMp4Src]);

  useEffect(() => {
    if (!isClosing) return undefined;
    const fallbackTimer = setTimeout(
      completeDismiss,
      config.fadeOutMs + 80,
    );
    return () => clearTimeout(fallbackTimer);
  }, [completeDismiss, config.fadeOutMs, isClosing]);

  const handleTransitionEnd = (event) => {
    if (event.target !== event.currentTarget) return;
    if (event.propertyName !== "opacity") return;
    if (!isClosing) return;
    completeDismiss();
  };

  const handleCanPlay = () => {
    const video = videoRef.current;
    if (!video || videoFailed) return;
    void video.play().catch(() => {});
  };

  const handleSkip = () => {
    beginDismiss();
  };

  const handleAdvertiserClick = () => {
    if (!config.advertiserId) {
      return;
    }
    beginDismiss();
    if (config.ctaType === "seller_products") {
      navigate(`/seller/${config.advertiserId}`);
      return;
    }
    dispatchOpenUserProfileEvent(config.advertiserId);
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

  const closingStyle =
    isClosing && !prefersReducedMotion()
      ? { transitionDuration: `${config.fadeOutMs}ms` }
      : undefined;

  return (
    <div
      className={rootClassName}
      style={closingStyle}
      role="dialog"
      aria-modal="true"
      aria-label={APP_INTRO_UI.ARIA_OVERLAY}
      onTransitionEnd={handleTransitionEnd}
    >
      {config.isPaidIntro ? (
        <div className="app-intro-splash__ad-badge" aria-hidden="true">
          {APP_INTRO_UI.AD_BADGE}
        </div>
      ) : null}
      <div className="app-intro-splash__media">
        {videoFailed ? (
          <div className="app-intro-splash__fallback" aria-hidden="true">
            <p className="app-intro-splash__fallback-title">{config.fallbackTitle}</p>
            <p className="app-intro-splash__fallback-hint">{config.fallbackHint}</p>
          </div>
        ) : (
          <video
            key={config.videoMp4Src}
            ref={videoRef}
            className="app-intro-splash__video"
            src={config.videoMp4Src}
            autoPlay
            muted
            playsInline
            preload="auto"
            poster={config.posterSrc ?? undefined}
            aria-label={APP_INTRO_UI.VIDEO_ARIA}
            onCanPlay={handleCanPlay}
            onEnded={handleVideoEnded}
            onError={handleVideoError}
          />
        )}
      </div>
      <div className="app-intro-splash__actions">
        {config.isPaidIntro && config.advertiserId ? (
          <button
            type="button"
            className="app-intro-splash__btn app-intro-splash__btn_secondary"
            onClick={handleAdvertiserClick}
            disabled={isClosing}
          >
            {config.ctaType === "seller_products"
              ? APP_INTRO_UI.AD_CTA_SELLER_PRODUCTS
              : APP_INTRO_UI.AD_CTA_PROFILE}
          </button>
        ) : null}
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
  const { isIntroVisible, previewSettings, dismissIntro } = useAppIntro();
  const settingsQuery = useAppIntroSettingsQuery();

  const playbackConfig = useMemo(() => {
    if (previewSettings) {
      return resolveAppIntroPlaybackConfig(previewSettings);
    }

    const paidIntro = settingsQuery.data?.paidIntro ?? null;
    if (paidIntro) {
      return resolveAppIntroPlaybackConfig(paidIntro, {
        isPaidIntro: true,
        advertiserId: paidIntro.advertiserId,
        ctaType: paidIntro.ctaType,
      });
    }

    return resolveAppIntroPlaybackConfig(settingsQuery.data?.settings ?? null);
  }, [previewSettings, settingsQuery.data]);

  if (!isIntroVisible) {
    return null;
  }

  const settingsReady =
    previewSettings != null ||
    settingsQuery.data != null ||
    settingsQuery.isError;

  if (!settingsReady && settingsQuery.isPending) {
    return null;
  }

  return createPortal(
    <AppIntroSplashContent config={playbackConfig} onDismiss={dismissIntro} />,
    document.body,
  );
}

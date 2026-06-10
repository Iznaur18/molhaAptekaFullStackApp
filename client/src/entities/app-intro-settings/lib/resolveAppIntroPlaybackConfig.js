import {
  APP_INTRO_FADE_OUT_MS,
  APP_INTRO_MAX_MS,
  APP_INTRO_MIN_MS,
  APP_INTRO_POSTER,
  APP_INTRO_VIDEO_MP4,
  APP_INTRO_VIDEO_WEBM,
} from "../../../shared/config/appIntroConstants.js";
import { APP_INTRO_UI } from "../../../shared/config/appUiCopy.js";
import { resolveUploadedImageUrlForBrowser } from "../../../shared/lib/resolveUploadedImageUrl.js";

/**
 * @typedef {import('../model/types.js').AppIntroSettings} AppIntroSettings
 */

/**
 * @typedef {Object} AppIntroPlaybackConfig
 * @property {string} videoMp4Src
 * @property {string | null} videoWebmSrc
 * @property {string | null} posterSrc
 * @property {string} fallbackTitle
 * @property {string} fallbackHint
 * @property {number} minMs
 * @property {number} maxMs
 * @property {number} fadeOutMs
 * @property {boolean} [isPaidIntro]
 * @property {string | null} [advertiserId]
 * @property {'seller_products' | 'profile' | null} [ctaType]
 */

/**
 * @param {string | null | undefined} rawUrl
 * @param {string} staticFallback
 */
const resolveMediaSrc = (rawUrl, staticFallback) => {
  const trimmed = String(rawUrl ?? "").trim();
  if (!trimmed) {
    return staticFallback;
  }
  if (trimmed.startsWith("/")) {
    return trimmed;
  }
  const resolved = resolveUploadedImageUrlForBrowser(
    trimmed,
    typeof window !== "undefined" ? window.location.origin : "",
  );
  return resolved || staticFallback;
};

/**
 * @param {AppIntroSettings | IntroAdPaidIntro | null | undefined} settings
 * @param {{ isPaidIntro?: boolean; advertiserId?: string | null; ctaType?: 'seller_products' | 'profile' | null }} [meta]
 * @returns {AppIntroPlaybackConfig}
 */
export function resolveAppIntroPlaybackConfig(settings, meta = {}) {
  const fallbackTitle =
    String(settings?.fallbackTitle ?? "").trim() || APP_INTRO_UI.FALLBACK_TITLE;
  const fallbackHint =
    String(settings?.fallbackHint ?? "").trim() || APP_INTRO_UI.FALLBACK_HINT;

  const customWebm = String(settings?.videoWebmUrl ?? "").trim();

  return {
    videoMp4Src: resolveMediaSrc(settings?.videoMp4Url, APP_INTRO_VIDEO_MP4),
    videoWebmSrc: customWebm
      ? resolveMediaSrc(settings.videoWebmUrl, APP_INTRO_VIDEO_WEBM)
      : null,
    posterSrc: settings?.posterUrl
      ? resolveMediaSrc(settings.posterUrl, APP_INTRO_POSTER)
      : APP_INTRO_POSTER,
    fallbackTitle,
    fallbackHint,
    minMs: Number(settings?.minMs) > 0 ? Number(settings.minMs) : APP_INTRO_MIN_MS,
    maxMs: Number(settings?.maxMs) > 0 ? Number(settings.maxMs) : APP_INTRO_MAX_MS,
    fadeOutMs:
      Number(settings?.fadeOutMs) > 0 ? Number(settings.fadeOutMs) : APP_INTRO_FADE_OUT_MS,
    isPaidIntro: meta.isPaidIntro === true,
    advertiserId: meta.advertiserId ?? null,
    ctaType: meta.ctaType ?? null,
  };
}

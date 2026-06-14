import {
  APP_INTRO_FADE_OUT_MS,
  APP_INTRO_MAX_MS,
  APP_INTRO_MIN_MS,
} from "@/features/app-intro/model/introConstants";
import { APP_INTRO_UI } from "@/shared/config";
import { resolveUploadedMediaUrl } from "@/shared/lib";

import type { AppIntroSettings } from "../model/types";

export type AppIntroPlaybackConfig = {
  videoMp4Src: string;
  posterSrc: string | null;
  fallbackTitle: string;
  fallbackHint: string;
  minMs: number;
  maxMs: number;
  fadeOutMs: number;
  isPaidIntro?: boolean;
  advertiserId?: string | null;
  ctaType?: "seller_products" | "profile" | null;
};

const resolveMediaSrc = (rawUrl: string | null | undefined): string => {
  const trimmed = String(rawUrl ?? "").trim();
  if (!trimmed) {
    return "";
  }
  return resolveUploadedMediaUrl(trimmed);
};

export const resolveAppIntroPlaybackConfig = (
  settings: AppIntroSettings | null | undefined,
  meta: {
    isPaidIntro?: boolean;
    advertiserId?: string | null;
    ctaType?: "seller_products" | "profile" | null;
  } = {},
): AppIntroPlaybackConfig => {
  const fallbackTitle =
    String(settings?.fallbackTitle ?? "").trim() || APP_INTRO_UI.FALLBACK_TITLE;
  const fallbackHint =
    String(settings?.fallbackHint ?? "").trim() || APP_INTRO_UI.FALLBACK_HINT;

  return {
    videoMp4Src: resolveMediaSrc(settings?.videoMp4Url),
    posterSrc: settings?.posterUrl ? resolveMediaSrc(settings.posterUrl) : null,
    fallbackTitle,
    fallbackHint,
    minMs: Number(settings?.minMs) > 0 ? Number(settings?.minMs) : APP_INTRO_MIN_MS,
    maxMs: Number(settings?.maxMs) > 0 ? Number(settings?.maxMs) : APP_INTRO_MAX_MS,
    fadeOutMs:
      Number(settings?.fadeOutMs) > 0 ? Number(settings?.fadeOutMs) : APP_INTRO_FADE_OUT_MS,
    isPaidIntro: meta.isPaidIntro === true,
    advertiserId: meta.advertiserId ?? null,
    ctaType: meta.ctaType ?? null,
  };
};

import {
  APP_INTRO_FADE_OUT_MS_DEFAULT,
  APP_INTRO_MIN_MS_MIN,
  INTRO_AD_VIDEO_MAX_DURATION_SEC,
} from "@molha/api-contract";

import type { AppIntroSettings } from "@/entities/app-intro-settings/model/types";

import type { IntroAdFormState } from "./mapIntroAdFormDefaults";

/**
 * Тайминги показа фиксированы: ролик обрезается сервером до 10 секунд,
 * сплэш закрывается по окончании видео, потолок показа — те же 10 секунд.
 */
const INTRO_AD_FIXED_TIMINGS = {
  minMs: APP_INTRO_MIN_MS_MIN,
  maxMs: INTRO_AD_VIDEO_MAX_DURATION_SEC * 1000,
  fadeOutMs: APP_INTRO_FADE_OUT_MS_DEFAULT,
} as const;

const trimOrNull = (value: string) => {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

export const buildSubmitIntroAdCampaignBody = (form: IntroAdFormState) => ({
  videoMp4Url: form.videoMp4Url.trim(),
  videoWebmUrl: null,
  posterUrl: trimOrNull(form.posterUrl),
  fallbackTitle: form.fallbackTitle.trim(),
  fallbackHint: form.fallbackHint.trim(),
  minMs: INTRO_AD_FIXED_TIMINGS.minMs,
  maxMs: INTRO_AD_FIXED_TIMINGS.maxMs,
  fadeOutMs: INTRO_AD_FIXED_TIMINGS.fadeOutMs,
});

export const introAdFormToPreviewSettings = (
  body: ReturnType<typeof buildSubmitIntroAdCampaignBody>,
): AppIntroSettings => ({
  videoMp4Url: body.videoMp4Url,
  videoWebmUrl: body.videoWebmUrl,
  posterUrl: body.posterUrl,
  fallbackTitle: body.fallbackTitle ?? "",
  fallbackHint: body.fallbackHint ?? "",
  minMs: body.minMs,
  maxMs: body.maxMs,
  fadeOutMs: body.fadeOutMs,
  prioritizePlatformIntro: false,
  updatedAt: null,
});

import type { AppIntroSettings } from "@/entities/app-intro-settings/model/types";

import type { IntroAdFormState } from "./mapIntroAdFormDefaults";

const trimOrNull = (value: string) => {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

export const buildSubmitIntroAdCampaignBody = (form: IntroAdFormState) => ({
  videoMp4Url: form.videoMp4Url.trim(),
  videoWebmUrl: trimOrNull(form.videoWebmUrl),
  posterUrl: trimOrNull(form.posterUrl),
  fallbackTitle: form.fallbackTitle.trim(),
  fallbackHint: form.fallbackHint.trim(),
  minMs: Number(form.minMs),
  maxMs: Number(form.maxMs),
  fadeOutMs: Number(form.fadeOutMs),
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

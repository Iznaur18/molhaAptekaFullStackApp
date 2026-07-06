import {
  APP_INTRO_FADE_OUT_MS_DEFAULT,
  APP_INTRO_MAX_MS_DEFAULT,
  APP_INTRO_MIN_MS_DEFAULT,
} from "@molha/api-contract";

import type { AppIntroSettings } from "@/entities/app-intro-settings/model/types";

type IntroAdCampaignPreviewSource = {
  videoMp4Url?: string | null;
  videoWebmUrl?: string | null;
  posterUrl?: string | null;
  fallbackTitle?: string | null;
  fallbackHint?: string | null;
  minMs?: number | null;
  maxMs?: number | null;
  fadeOutMs?: number | null;
  [key: string]: unknown;
};

export const campaignToIntroAdPreviewSettings = (
  campaign: IntroAdCampaignPreviewSource,
): AppIntroSettings => ({
  videoMp4Url: campaign.videoMp4Url ?? "",
  videoWebmUrl: campaign.videoWebmUrl ?? null,
  posterUrl: campaign.posterUrl ?? null,
  fallbackTitle: campaign.fallbackTitle ?? "",
  fallbackHint: campaign.fallbackHint ?? "",
  minMs: campaign.minMs ?? APP_INTRO_MIN_MS_DEFAULT,
  maxMs: campaign.maxMs ?? APP_INTRO_MAX_MS_DEFAULT,
  fadeOutMs: campaign.fadeOutMs ?? APP_INTRO_FADE_OUT_MS_DEFAULT,
  prioritizePlatformIntro: false,
  updatedAt: null,
});

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
};

export const campaignToIntroAdPreviewSettings = (
  campaign: IntroAdCampaignPreviewSource,
): AppIntroSettings => ({
  videoMp4Url: campaign.videoMp4Url ?? "",
  videoWebmUrl: campaign.videoWebmUrl ?? null,
  posterUrl: campaign.posterUrl ?? null,
  fallbackTitle: campaign.fallbackTitle ?? "",
  fallbackHint: campaign.fallbackHint ?? "",
  minMs: campaign.minMs ?? undefined,
  maxMs: campaign.maxMs ?? undefined,
  fadeOutMs: campaign.fadeOutMs ?? undefined,
  prioritizePlatformIntro: false,
  updatedAt: null,
});

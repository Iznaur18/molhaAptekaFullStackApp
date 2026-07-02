import type { SiteHeaderBannerSlide } from "@/entities/site-header-banner/model/types";

type SiteHeaderBannerCampaignPreviewSource = {
  _id: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  linkPath?: string | null;
  backgroundColor?: string | null;
};

export const campaignToSiteHeaderBannerPreviewSlides = (
  campaign: SiteHeaderBannerCampaignPreviewSource,
): SiteHeaderBannerSlide[] => {
  const imageUrl = String(campaign.imageUrl ?? "").trim();
  if (!imageUrl) {
    return [];
  }

  return [
    {
      id: String(campaign._id),
      imageUrl,
      imageAlt: String(campaign.imageAlt ?? "").trim() || "Баннер",
      linkPath: String(campaign.linkPath ?? "").trim() || null,
      backgroundColor: String(campaign.backgroundColor ?? "").trim() || null,
    },
  ];
};

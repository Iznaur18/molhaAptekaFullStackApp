export const siteHeaderBannerCampaignQueryKeys = {
  all: ["site-header-banner-campaign"] as const,
  myCampaign: () => [...siteHeaderBannerCampaignQueryKeys.all, "me"] as const,
  moderationPending: (limit = 50) =>
    [...siteHeaderBannerCampaignQueryKeys.all, "moderation", "pending", limit] as const,
  moderationManaged: () =>
    [...siteHeaderBannerCampaignQueryKeys.all, "moderation", "managed"] as const,
  moderationCount: () =>
    [...siteHeaderBannerCampaignQueryKeys.all, "moderation", "count"] as const,
};

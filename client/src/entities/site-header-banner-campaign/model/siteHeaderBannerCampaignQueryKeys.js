export const siteHeaderBannerCampaignQueryKeys = {
  all: ["site-header-banner-campaign"],
  myCampaign: () => [...siteHeaderBannerCampaignQueryKeys.all, "my-campaign"],
  moderationCount: () => [...siteHeaderBannerCampaignQueryKeys.all, "moderation-count"],
  moderationPending: (limit) => [
    ...siteHeaderBannerCampaignQueryKeys.all,
    "moderation-pending",
    limit,
  ],
  moderationManaged: () => [...siteHeaderBannerCampaignQueryKeys.all, "moderation-managed"],
};

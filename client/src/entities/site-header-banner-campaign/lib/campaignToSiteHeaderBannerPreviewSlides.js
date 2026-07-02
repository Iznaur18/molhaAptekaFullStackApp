/**
 * @param {{
 *   _id: string;
 *   imageUrl?: string | null;
 *   imageAlt?: string | null;
 *   linkPath?: string | null;
 *   backgroundColor?: string | null;
 * }} campaign
 * @returns {import('../../site-header-banner/model/types.js').SiteHeaderBannerSlide[]}
 */
export function campaignToSiteHeaderBannerPreviewSlides(campaign) {
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
}

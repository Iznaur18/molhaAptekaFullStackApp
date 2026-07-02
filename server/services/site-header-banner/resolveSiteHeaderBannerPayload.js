import { SITE_HEADER_BANNER_SETTINGS_DEFAULTS } from "../../constants/siteHeaderBannerConstants.js";
import {
  SITE_HEADER_BANNER_CAMPAIGN_STATUS_ACTIVE,
} from "../../constants/siteHeaderBannerCampaignConstants.js";
import { SiteHeaderBannerCampaignModel } from "../../models/SiteHeaderBannerCampaignModel.js";

/**
 * @param {import('mongoose').LeanDocument<any> | null | undefined} row
 */
export const resolveSiteHeaderBannerSettingsPayload = (row) => {
  const source = row ?? SITE_HEADER_BANNER_SETTINGS_DEFAULTS;

  return {
    enabled: Boolean(source.enabled),
    items: Array.isArray(source.items)
      ? source.items.map((item) => ({
          id: String(item.id ?? "").trim(),
          enabled: Boolean(item.enabled),
          imageUrl:
            item.imageUrl == null || String(item.imageUrl).trim() === ""
              ? null
              : String(item.imageUrl).trim(),
          imageAlt: String(item.imageAlt ?? "").trim(),
          linkPath:
            item.linkPath == null || String(item.linkPath).trim() === ""
              ? null
              : String(item.linkPath).trim(),
          backgroundColor:
            item.backgroundColor == null || String(item.backgroundColor).trim() === ""
              ? null
              : String(item.backgroundColor).trim(),
        }))
      : [],
    updatedAt: row?.updatedAt ?? null,
  };
};

/**
 * @param {import('mongoose').LeanDocument<any> | null | undefined} row
 */
export const resolvePublicSiteHeaderBannerSlides = (row) => {
  const settings = resolveSiteHeaderBannerSettingsPayload(row);
  if (!settings.enabled) {
    return [];
  }

  return settings.items
    .filter((item) => item.enabled && item.imageUrl)
    .map((item) => ({
      id: item.id,
      imageUrl: item.imageUrl,
      imageAlt: item.imageAlt || "Баннер",
      linkPath: item.linkPath,
      backgroundColor: item.backgroundColor,
    }));
};

/**
 * @returns {Promise<Array<{
 *   id: string;
 *   imageUrl: string;
 *   imageAlt: string;
 *   linkPath: string | null;
 *   backgroundColor: string | null;
 * }>>}
 */
export const resolveActivePaidSiteHeaderBannerCampaignSlides = async () => {
  const now = new Date();
  const rows = await SiteHeaderBannerCampaignModel.find({
    status: SITE_HEADER_BANNER_CAMPAIGN_STATUS_ACTIVE,
    activeUntil: { $gt: now },
  })
    .sort({ activatedAt: 1, createdAt: 1 })
    .lean();

  return rows
    .filter((row) => row.imageUrl)
    .map((row) => ({
      id: `paid:${String(row._id)}`,
      imageUrl: String(row.imageUrl).trim(),
      imageAlt: String(row.imageAlt ?? "").trim() || "Баннер",
      linkPath:
        row.linkPath == null || String(row.linkPath).trim() === ""
          ? null
          : String(row.linkPath).trim(),
      backgroundColor:
        row.backgroundColor == null || String(row.backgroundColor).trim() === ""
          ? null
          : String(row.backgroundColor).trim(),
    }));
};

/**
 * @param {import('mongoose').LeanDocument<any> | null | undefined} row
 */
export const resolveMergedPublicSiteHeaderBannerSlides = async (row) => {
  const staffSlides = resolvePublicSiteHeaderBannerSlides(row);
  const paidSlides = await resolveActivePaidSiteHeaderBannerCampaignSlides();
  return [...staffSlides, ...paidSlides];
};

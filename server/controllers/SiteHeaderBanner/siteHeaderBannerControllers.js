import { SITE_HEADER_BANNER_SETTINGS_KEY } from "../../constants/siteHeaderBannerConstants.js";
import { SiteHeaderBannerSettingsModel } from "../../models/SiteHeaderBannerSettingsModel.js";
import {
  resolveMergedPublicSiteHeaderBannerSlides,
  resolveSiteHeaderBannerSettingsPayload,
} from "../../services/site-header-banner/resolveSiteHeaderBannerPayload.js";
import { successRes } from "../../services/http/index.js";

/**
 * @param {string | null | undefined} value
 */
const normalizeOptionalString = (value) => {
  if (value === undefined) {
    return undefined;
  }
  if (value == null || String(value).trim() === "") {
    return null;
  }
  return String(value).trim();
};

/** GET /site-header-banner */
export const getSiteHeaderBannerSlidesController = async (_req, res) => {
  const row = await SiteHeaderBannerSettingsModel.findOne({
    settingsKey: SITE_HEADER_BANNER_SETTINGS_KEY,
  }).lean();

  return successRes(res, {
    slides: await resolveMergedPublicSiteHeaderBannerSlides(row),
  });
};

/** GET /site-header-banner/settings */
export const getSiteHeaderBannerSettingsController = async (_req, res) => {
  const row = await SiteHeaderBannerSettingsModel.findOne({
    settingsKey: SITE_HEADER_BANNER_SETTINGS_KEY,
  }).lean();

  return successRes(res, {
    settings: resolveSiteHeaderBannerSettingsPayload(row),
  });
};

/** PATCH /site-header-banner/settings */
export const patchSiteHeaderBannerSettingsController = async (req, res) => {
  const body = req.body ?? {};
  /** @type {Record<string, unknown>} */
  const update = { updatedBy: req.userId };

  if (body.enabled !== undefined) {
    update.enabled = Boolean(body.enabled);
  }

  if (body.items !== undefined) {
    update.items = body.items.map((item) => ({
      id: String(item.id ?? "").trim(),
      enabled: Boolean(item.enabled),
      imageUrl: normalizeOptionalString(item.imageUrl) ?? null,
      imageAlt: normalizeOptionalString(item.imageAlt) ?? "",
      linkPath: normalizeOptionalString(item.linkPath) ?? null,
      backgroundColor: normalizeOptionalString(item.backgroundColor) ?? null,
    }));
  }

  const saved = await SiteHeaderBannerSettingsModel.findOneAndUpdate(
    { settingsKey: SITE_HEADER_BANNER_SETTINGS_KEY },
    { $set: update },
    { upsert: true, returnDocument: "after", runValidators: true },
  ).lean();

  return successRes(res, {
    settings: resolveSiteHeaderBannerSettingsPayload(saved),
  });
};

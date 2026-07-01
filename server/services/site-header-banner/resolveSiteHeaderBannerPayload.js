import { SITE_HEADER_BANNER_SETTINGS_DEFAULTS } from "../../constants/siteHeaderBannerConstants.js";

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

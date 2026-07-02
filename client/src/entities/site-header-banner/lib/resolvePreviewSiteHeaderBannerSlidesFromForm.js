/**
 * @param {ReturnType<typeof import('./siteHeaderBannerAdminForm.js').mapSiteHeaderBannerSettingsToForm>} form
 * @returns {import('../model/types.js').SiteHeaderBannerSlide[]}
 */
export const resolvePreviewSiteHeaderBannerSlidesFromForm = (form) => {
  if (!form.enabled) {
    return [];
  }

  return form.items
    .filter((item) => item.enabled && String(item.imageUrl ?? "").trim())
    .map((item) => ({
      id: item.id,
      imageUrl: String(item.imageUrl).trim(),
      imageAlt: String(item.imageAlt ?? "").trim() || "Баннер",
      linkPath: String(item.linkPath ?? "").trim() || null,
      backgroundColor: String(item.backgroundColor ?? "").trim() || null,
    }));
};

/**
 * @param {string} raw
 * @returns {string | null}
 */
export const normalizeSiteHeaderBannerHexColor = (raw) => {
  const value = String(raw ?? "").trim();
  if (!value) {
    return null;
  }

  if (/^#([0-9A-Fa-f]{3})$/.test(value)) {
    const [, hex] = value.match(/^#([0-9A-Fa-f]{3})$/) ?? [];
    if (!hex) {
      return null;
    }
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`.toLowerCase();
  }

  if (/^#([0-9A-Fa-f]{6})$/.test(value)) {
    return value.toLowerCase();
  }

  return null;
};

/**
 * @param {string} raw
 * @returns {string}
 */
export const resolveSiteHeaderBannerColorInputValue = (raw) => {
  return normalizeSiteHeaderBannerHexColor(raw) ?? "#ffffff";
};

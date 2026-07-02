import type { SiteHeaderBannerSlide } from "@/entities/site-header-banner/model/types";

import type { SiteHeaderBannerAdminForm } from "./siteHeaderBannerAdminForm";

export const resolvePreviewSiteHeaderBannerSlidesFromForm = (
  form: SiteHeaderBannerAdminForm,
): SiteHeaderBannerSlide[] => {
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

export const normalizeSiteHeaderBannerHexColor = (raw: string): string | null => {
  const value = String(raw ?? "").trim();
  if (!value) {
    return null;
  }

  const shortMatch = value.match(/^#([0-9A-Fa-f]{3})$/);
  if (shortMatch) {
    const hex = shortMatch[1];
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`.toLowerCase();
  }

  if (/^#([0-9A-Fa-f]{6})$/.test(value)) {
    return value.toLowerCase();
  }

  return null;
};

export const resolveSiteHeaderBannerColorPreview = (raw: string): string | undefined => {
  return normalizeSiteHeaderBannerHexColor(raw) ?? undefined;
};

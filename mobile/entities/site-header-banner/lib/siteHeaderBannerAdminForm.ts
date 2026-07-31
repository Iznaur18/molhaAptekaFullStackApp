import { SITE_HEADER_BANNER_SETTINGS_DEFAULTS } from "@molha/api-contract";

import type { SiteHeaderBannerSettings } from "@/entities/site-header-banner/model/types";
import { createClientIdempotencyKey } from "@/shared/lib/createClientIdempotencyKey";

export type SiteHeaderBannerAdminForm = {
  enabled: boolean;
  guestProfileLoginMenuBannerImageUrl: string;
  items: Array<{
    id: string;
    enabled: boolean;
    imageUrl: string;
    imageAlt: string;
    linkPath: string;
    backgroundColor: string;
  }>;
};

export const mapSiteHeaderBannerSettingsToForm = (
  settings: SiteHeaderBannerSettings | null | undefined,
): SiteHeaderBannerAdminForm => {
  const source = settings ?? SITE_HEADER_BANNER_SETTINGS_DEFAULTS;

  return {
    enabled: Boolean(source.enabled),
    guestProfileLoginMenuBannerImageUrl: source.guestProfileLoginMenuBannerImageUrl ?? "",
    items: Array.isArray(source.items)
      ? source.items.map((item) => ({
          id: item.id,
          enabled: Boolean(item.enabled),
          imageUrl: item.imageUrl ?? "",
          imageAlt: item.imageAlt ?? "",
          linkPath: item.linkPath ?? "",
          backgroundColor: item.backgroundColor ?? "",
        }))
      : [],
  };
};

export const buildPatchSiteHeaderBannerSettingsBody = (form: SiteHeaderBannerAdminForm) => ({
  enabled: Boolean(form.enabled),
  guestProfileLoginMenuBannerImageUrl:
    String(form.guestProfileLoginMenuBannerImageUrl ?? "").trim() || null,
  items: form.items.map((item) => ({
    id: item.id,
    enabled: Boolean(item.enabled),
    imageUrl: String(item.imageUrl ?? "").trim() || null,
    imageAlt: String(item.imageAlt ?? "").trim() || null,
    linkPath: String(item.linkPath ?? "").trim() || null,
    backgroundColor: String(item.backgroundColor ?? "").trim() || null,
  })),
});

export const createEmptySiteHeaderBannerItem = () => ({
  id: createClientIdempotencyKey(),
  enabled: true,
  imageUrl: "",
  imageAlt: "",
  linkPath: "",
  backgroundColor: "",
});

export const validateSiteHeaderBannerAdminForm = (
  form: SiteHeaderBannerAdminForm,
): string | null => {
  for (const item of form.items) {
    const imageUrl = String(item.imageUrl ?? "").trim();
    const imageAlt = String(item.imageAlt ?? "").trim();
    const linkPath = String(item.linkPath ?? "").trim();
    const backgroundColor = String(item.backgroundColor ?? "").trim();

    if (imageUrl && !imageAlt) {
      return "Укажите alt-текст для каждого изображения";
    }

    if (linkPath && !linkPath.startsWith("/")) {
      return "Внутренний путь должен начинаться с /";
    }

    if (backgroundColor && !/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(backgroundColor)) {
      return "Цвет фона: формат #RGB или #RRGGBB";
    }
  }

  return null;
};

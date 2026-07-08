import { z } from "zod";

export const SITE_HEADER_BANNER_SETTINGS_KEY = "default";
export const SITE_HEADER_BANNER_HEIGHT_PX = 180;
export const SITE_HEADER_BANNER_CAROUSEL_PEEK_PX = 0;
export const SITE_HEADER_BANNER_CAROUSEL_SLIDE_GAP_PX = 8;
export const SITE_HEADER_BANNER_AUTOPLAY_MS = 5000;
export const SITE_HEADER_BANNER_IMAGE_ALT_MAX_LENGTH = 200;
export const SITE_HEADER_BANNER_LINK_PATH_MAX_LENGTH = 512;
export const SITE_HEADER_BANNER_ITEM_ID_MAX_LENGTH = 64;

const optionalTrimmedMediaUrl = z.preprocess((value) => {
  if (value === undefined) {
    return undefined;
  }
  if (value == null || String(value).trim() === "") {
    return null;
  }
  return String(value).trim();
}, z.string().max(2048).nullable().optional());

const optionalTrimmedText = (maxLength) =>
  z.preprocess((value) => {
    if (value === undefined) {
      return undefined;
    }
    if (value == null || String(value).trim() === "") {
      return null;
    }
    return String(value).trim();
  }, z.string().max(maxLength).nullable().optional());

const hexColorSchema = z.preprocess((value) => {
  if (value === undefined) {
    return undefined;
  }
  if (value == null || String(value).trim() === "") {
    return null;
  }
  return String(value).trim();
}, z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/).nullable().optional());

const internalLinkPathSchema = z.preprocess((value) => {
  if (value === undefined) {
    return undefined;
  }
  if (value == null || String(value).trim() === "") {
    return null;
  }
  return String(value).trim();
}, z.string().max(SITE_HEADER_BANNER_LINK_PATH_MAX_LENGTH).nullable().optional());

export const siteHeaderBannerItemSchema = z.object({
  id: z.string().trim().min(1).max(SITE_HEADER_BANNER_ITEM_ID_MAX_LENGTH),
  enabled: z.boolean(),
  imageUrl: z.string().max(2048).nullable(),
  imageAlt: z.string().max(SITE_HEADER_BANNER_IMAGE_ALT_MAX_LENGTH),
  linkPath: z.string().max(SITE_HEADER_BANNER_LINK_PATH_MAX_LENGTH).nullable(),
  backgroundColor: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
    .nullable(),
});

export const siteHeaderBannerSlideSchema = z.object({
  id: z.string(),
  imageUrl: z.string(),
  imageAlt: z.string(),
  linkPath: z.string().nullable(),
  backgroundColor: z.string().nullable(),
});

export const siteHeaderBannerSettingsSchema = z.object({
  enabled: z.boolean(),
  items: z.array(siteHeaderBannerItemSchema),
  guestProfileLoginMenuBannerImageUrl: optionalTrimmedMediaUrl,
  updatedAt: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
});

export const siteHeaderBannerSlidesDataSchema = z.object({
  slides: z.array(siteHeaderBannerSlideSchema),
  guestProfileLoginMenuBannerImageUrl: optionalTrimmedMediaUrl,
});

export const siteHeaderBannerSettingsDataSchema = z.object({
  settings: siteHeaderBannerSettingsSchema,
});

const patchSiteHeaderBannerItemSchema = z.object({
  id: z.string().trim().min(1).max(SITE_HEADER_BANNER_ITEM_ID_MAX_LENGTH),
  enabled: z.boolean().optional(),
  imageUrl: optionalTrimmedMediaUrl,
  imageAlt: optionalTrimmedText(SITE_HEADER_BANNER_IMAGE_ALT_MAX_LENGTH),
  linkPath: internalLinkPathSchema,
  backgroundColor: hexColorSchema,
});

export const patchSiteHeaderBannerSettingsBodySchema = z
  .object({
    enabled: z.boolean().optional(),
    items: z.array(patchSiteHeaderBannerItemSchema).optional(),
    guestProfileLoginMenuBannerImageUrl: optionalTrimmedMediaUrl,
  })
  .superRefine((body, ctx) => {
    if (body.items == null) {
      return;
    }

    body.items.forEach((item, index) => {
      const imageUrl = item.imageUrl ?? null;
      const imageAlt = item.imageAlt ?? null;
      if (imageUrl && !imageAlt) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Укажите alt-текст для изображения",
          path: ["items", index, "imageAlt"],
        });
      }

      const linkPath = item.linkPath ?? null;
      if (linkPath && !linkPath.startsWith("/")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Внутренний путь должен начинаться с /",
          path: ["items", index, "linkPath"],
        });
      }
    });
  });

export const SITE_HEADER_BANNER_SETTINGS_DEFAULTS = {
  enabled: false,
  items: [],
  guestProfileLoginMenuBannerImageUrl: null,
};

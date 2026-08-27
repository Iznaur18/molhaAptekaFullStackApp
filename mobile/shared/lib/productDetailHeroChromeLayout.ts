import type { IzTheme } from "@izibuy/design-tokens";

type ThemeColors = IzTheme["colors"];

/** Паритет `ProductMediaGalleryReadonly.css` + `ProductDetailsPage.css` (page). */
export const PRODUCT_DETAIL_HERO_CHROME = {
  backSize: 36,
  actionSize: 32,
  iconSize: 20,
  inset: 10.4,
  actionsGap: 7.2,
  actionRadius: 20,
  actionPadding: 6,
  surfaceMix: 0.55,
  wishlistActiveMix: 0.72,
} as const;

const withHexAlpha = (hex: string, alpha: number): string => {
  const channel = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
  const normalized = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return hex;
  }
  return `#${normalized}${channel}`;
};

export const resolveProductDetailHeroChromeBackground = (colors: ThemeColors): string =>
  withHexAlpha(colors.surface, PRODUCT_DETAIL_HERO_CHROME.surfaceMix);

export const resolveProductDetailHeroWishlistActiveBackground = (colors: ThemeColors): string =>
  withHexAlpha(colors.danger, PRODUCT_DETAIL_HERO_CHROME.wishlistActiveMix);

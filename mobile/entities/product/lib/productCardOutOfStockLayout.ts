import type { IzTheme } from "@izibuy/design-tokens";

type ThemeColors = IzTheme["colors"];

/** Паритет `client/.../product-card/ProductCardOutOfStock.css` (1rem = 16px). */
export const PRODUCT_CARD_OUT_OF_STOCK_LAYOUT = {
  cardOpacity: 0.72,
  overlayPadding: 8,
  labelPaddingHorizontal: 12,
  labelPaddingVertical: 5.6,
  labelFontSize: 13.12,
  labelLineHeight: 15.74,
  overlaySurfaceMix: 0.55,
  labelSurfaceMix: 0.88,
  overlayZIndex: 5,
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

/** color-mix(in srgb, surface N%, transparent) → #rrggbb + alpha для RN. */
export const resolveProductCardOutOfStockOverlayColors = (colors: ThemeColors) => ({
  overlayBackground: withHexAlpha(
    colors.surface,
    PRODUCT_CARD_OUT_OF_STOCK_LAYOUT.overlaySurfaceMix,
  ),
  labelBackground: withHexAlpha(
    colors.surface,
    PRODUCT_CARD_OUT_OF_STOCK_LAYOUT.labelSurfaceMix,
  ),
  labelColor: colors.textMuted,
});

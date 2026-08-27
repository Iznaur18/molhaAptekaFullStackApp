import type { IzTheme } from "@izibuy/design-tokens";

type ThemeColors = IzTheme["colors"];

/** Паритет `ProductDetailsModalTabs.css` + `ModalSectionTabs.css` (page). */
export const PRODUCT_DETAIL_TAB_BAR_LAYOUT = {
  /** `--product-details-modal-tabs-gap-bottom` на page; 0 на page-split wide-tabs. */
  rootMarginBottom: 12,
  wideRootMarginBottom: 0,
  containerPaddingTop: 4,
  tabGap: 4,
  tabPaddingVertical: 11.2,
  tabPaddingHorizontal: 12,
  underlineWidth: 2.5,
  fontSize: 14,
  lineHeight: 20,
  letterSpacing: 0.21,
  fontWeight: "500" as const,
  fontWeightActive: "700" as const,
  pressScale: 0.97,
  springDamping: 18,
  springStiffness: 350,
  underlineHoverMix: 0.35,
  transitionMs: 150,
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

export const resolveProductDetailTabUnderlineHoverColor = (colors: ThemeColors): string =>
  withHexAlpha(colors.action, PRODUCT_DETAIL_TAB_BAR_LAYOUT.underlineHoverMix);
